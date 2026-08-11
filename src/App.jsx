import { useState, useEffect, useRef } from "react";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
// Deployed on Vercel with the api/ folder in the same project, so all sync
// calls hit same-origin relative URLs (no ngrok, no laptop required).
// Set NOTION_SYNC to false to run in localStorage-only mode.
const NOTION_SYNC = true;
const NOTION_PROXY_URL = ""; // empty = same origin

// ─── Brand Palette & Design Tokens ────────────────────────────────────────────
const C = {
  bg:       '#F1FAF3',
  white:    '#ffffff',
  alt:      '#EDF8F0',
  main:     '#008922',
  secondary:'#206100',
  border:   '#DCEEE1',
  text:     '#12291A',
  muted:    '#4E7A5C',
  light:    '#8FB89B',
  danger:   '#b91c1c',
};

// Soft green gradient used as the app background
const GRAD     = 'linear-gradient(168deg,#F3FBF5 0%,#E3F4E8 48%,#D2ECDC 100%)';
// High-contrast CTA gradient for primary buttons
const CTA_GRAD = 'linear-gradient(135deg,#00A22C 0%,#008922 60%,#0A6B22 100%)';
// Shadows
const SHADOW_CARD = '0 6px 22px rgba(13,60,30,0.08)';
const SHADOW_CTA  = '0 6px 16px rgba(0,137,34,0.30)';

// Minimal leaf motif used across the app
function Leaf({ size = 16, color = C.main }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 4c-8.5 0-14 4.5-14 11 0 2.2.7 4 1.6 5.1C9.3 15 13 11.5 17 9.5c-3.4 2.7-6.7 6.2-8.3 10.2.9.4 1.9.6 2.8.6C18 20.3 20 12 20 4z"
        fill={color}
      />
    </svg>
  );
}

// ─── Static Data ─────────────────────────────────────────────────────────────
// Service IDs match Notion "Service Type" select options exactly
const SERVICES = [
  { id:'Clean + Polish', label:'Clean + Polish',       price:8  },
  { id:'Lift',           label:'Lift — Edge & Corner', price:30, includesClean:true },
  { id:'Dent',           label:'Dent Correction',      price:40, includesClean:true },
  { id:'Crease',         label:'Crease Correction',    price:50, includesClean:true },
];

// Condition IDs match Notion "Condition (Before)" select options exactly
const CONDITIONS      = ['NM','LP','MP','HP','DMG'];
const CONTACT_METHODS = ['Email','Text','Facebook','Instagram'];
const PAYMENT_TYPES   = ['Cash','PayPal','Venmo','Zelle'];
const STEP_NAMES      = ['Client Info','Cards','Agreement','Sign & Pay','Sign Off'];

// Status flow: Pending → In Progress → Complete → Picked Up
const STATUS_NEXT = {
  pending:     'in_progress',
  in_progress: 'complete',
  complete:    'picked_up',
};
const STATUS_LABEL = {
  pending:     'Pending',
  in_progress: 'In Progress',
  complete:    'Complete',
  picked_up:   'Picked Up',
};
const STATUS_BTN = {
  pending:     'Start →',
  in_progress: 'Complete ✓',
  complete:    'Mark Picked Up',
};

// The official 18-section agreement — MUST stay identical to SECTIONS in
// api/send-waiver.js, so the signed PDF matches what the client read here.
const WAIVER_SECTIONS = [
  { t:'Preamble', b:"This Service Agreement is entered into between Just Mint Card Care (the \"Service Provider\") and the Customer identified in the Submission Details of this Agreement (the \"Customer\"), effective as of the date the Customer accepts these terms as described in Section 18." },
  { t:'1. Services and Scope', b:"The Service Provider agrees to perform the repair and restoration services described in the Quote (the \"Services\") on the trading card(s) identified therein (the \"Card(s)\")." },
  { t:'2. Acknowledgment of Risk', b:"Card repair and restoration involve specialized techniques that carry inherent risks, including minor alterations in texture, gloss, or coloration; changes in surface integrity including additional whitening or increased visibility of existing defects; unforeseen reactions to materials, treatments, heat, pressure, hydration, or cleaning processes; the possibility that defects cannot be fully repaired and may remain visible; and the possibility that Card(s) may be left in a condition equal to or worse than on arrival. No specific outcome is guaranteed and some changes may be permanent or irreversible." },
  { t:'3. Assumption of Risk and Limitation of Liability', b:"The Customer knowingly assumes all risks associated with the repair and restoration process. To the fullest extent permitted by applicable law, the Service Provider shall not be liable for any loss in value, condition change, or damage arising during or after the restoration process, including fading, color shifts, whitening, gloss variation, surface changes, creases, dents, imperfections that may not be fully removable, or any impact on the Card's eligibility for grading, authentication, or resale. Liability Cap: the Service Provider's total aggregate liability shall not exceed the total fees paid by the Customer for the Services. Nothing in this Agreement limits liability for gross negligence, willful misconduct, or fraud." },
  { t:'4. No Guarantee of Grading or Value', b:"The Service Provider makes no representations or warranties regarding the outcome of grading or authentication by third-party companies including PSA, Beckett (BGS), CGC, SGC, or similar entities; whether a Card will be flagged as altered, restored, or ineligible for numeric grading; or the market value, resale value, or collectability of any Card following restoration. All grading determinations are made solely by independent third parties entirely outside the Service Provider's control." },
  { t:'5. Custody of Property', b:"The Service Provider will exercise reasonable care in safeguarding the Customer's Card(s) while in the Service Provider's possession. The Service Provider is not an insurer of the Card(s). Except to the extent caused by gross negligence, willful misconduct, or fraud, the Service Provider shall not be liable for loss, theft, burglary, fire, vandalism, natural disaster, or other events beyond reasonable control. The Customer is encouraged to obtain appropriate insurance coverage for valuable Card(s)." },
  { t:'6. Pre-Existing Conditions and Hidden Defects', b:"Collectible trading cards may contain pre-existing damage, hidden defects, prior restoration, manufacturing irregularities, or other conditions not visible or reasonably discoverable before restoration begins. Such conditions may affect the restoration process or become apparent only after treatment commences. The Service Provider shall not be responsible for adverse outcomes resulting from pre-existing or concealed conditions that could not reasonably have been identified prior to performing the authorized Services." },
  { t:'7. Authorization for Restoration Methods', b:"The Customer authorizes the Service Provider to perform the Services using professional judgment, experience, and customary restoration techniques, including the selection of materials, tools, processes, heat, pressure, hydration, cleaning, or other methods the Service Provider reasonably determines are appropriate. If a material change in scope is necessary, the Customer's written approval will be obtained before proceeding, unless immediate action is necessary to prevent further damage to the Card." },
  { t:'8. Payment, Possession, and Unclaimed Property (Minnesota)', b:"Payment for all Services is due in full within fourteen (14) calendar days of completion notice. The Service Provider shall retain possession of the Card(s) until payment is received in full. Under Minnesota law, the Service Provider does not have authority to sell, auction, transfer, or dispose of the Card(s) to satisfy unpaid fees. All notices will be sent exclusively by email. If the Customer fails to pay or retrieve the Card(s) within ninety (90) days of completion notice, storage fees apply: $15/month for Days 91-180, $25/month for Days 181-365, and $35/month beyond 365 days. Fees must be paid in full before cards are released; partial months are prorated. Trading cards cannot be transferred to the State of Minnesota as unclaimed property under Minnesota Statutes Chapter 345. Card(s) remain in the Service Provider's custody until retrieved by the Customer." },
  { t:'9. Cancellation and Refunds', b:"The Customer may cancel at any time before work begins for a full refund. Once work has commenced, no refunds will be issued for services already performed. If a card cannot be serviced due to being counterfeit or unsafe to work on, the service fee for that card will be refunded in full. If the agreed scope changes due to hidden damage and no revised agreement is reached, the portion of work not performed will be refunded." },
  { t:'10. Release of Claims', b:"By submitting Card(s) for repair or restoration, the Customer releases and discharges the Service Provider from claims arising out of or related to the inherent risks of authorized restoration services, except to the extent caused by gross negligence, willful misconduct, or fraud." },
  { t:'11. Customer Ownership, Authority, and Disclosure Obligations', b:"The Customer represents and warrants that they are the lawful owner of the Card(s) submitted, or have full legal authority to authorize the Services. The Customer agrees that any subsequent sale, trade, consignment, or grading submission is the Customer's sole responsibility to disclose accurately. The Service Provider expressly disclaims any participation in misrepresentation of restored Card(s) as unrestored. The Customer agrees to indemnify and hold harmless the Service Provider from any claim arising out of the Customer's failure to disclose restoration." },
  { t:'12. Good-Faith Customer Care', b:"While this Agreement limits liability, Just Mint Card Care values transparency and customer satisfaction. Concerns should be communicated promptly to justminttcg@gmail.com. The Service Provider may, at its sole discretion, address issues as a customer service courtesy. Nothing in this Agreement shall be interpreted as an obligation to provide refunds, replacements, or compensation." },
  { t:'13. Photography and Documentation', b:"The Service Provider may photograph or record the Card(s) before, during, and after Services for documentation, quality control, and portfolio, educational, or promotional purposes. Unless the Customer objects in writing before work begins, the Customer grants the Service Provider a non-exclusive, royalty-free license to use such images and recordings. Personally identifying information will be excluded; the Customer will not be identified by name without separate written consent." },
  { t:'14. Electronic Acceptance and Communications', b:"This Agreement may be delivered, accepted, and executed electronically. Agreement may be confirmed by email response or other written electronic communication, which shall be deemed legally binding and equivalent to a handwritten signature. No physical signature is required for this Agreement to be valid and enforceable." },
  { t:'15. Governing Law, Venue, and Dispute Resolution', b:"This Agreement shall be governed by and construed in accordance with the laws of the State of Minnesota, without regard to conflict-of-law principles. Any dispute arising out of or relating to this Agreement shall be brought exclusively in the appropriate courts of Hennepin County, Minnesota." },
  { t:'16. Severability', b:"If any provision of this Agreement is determined to be invalid, illegal, or unenforceable, that provision shall be enforced to the maximum extent permitted by law, and the remaining provisions shall remain in full force and effect." },
  { t:'17. Entire Agreement', b:"This Agreement constitutes the entire understanding between the Customer and the Service Provider with respect to the Services. It supersedes all prior or contemporaneous discussions, representations, understandings, negotiations, and agreements, whether oral or written. No amendment, modification, or waiver shall be effective unless made in writing and agreed to by both parties." },
  { t:'18. Acceptance of Agreement', b:"By replying to the accompanying email, checking the acceptance box on the Service Provider's intake form, or submitting Card(s) for repair or restoration services, the Customer affirms that they have read, understood, and voluntarily agreed to the terms of this Agreement in full." },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const emptyForm = () => ({
  clientName:'', clientEmail:'', clientPhone:'', contactMethod:'',
  cards:[], agreed:false, paymentType:'',
});

const emptyCard = () => ({
  cardName:'', condition:'', service:''
});

const genId = (list) => {
  const max = list.reduce((m, o) => {
    const n = parseInt(o.id.replace('ORD-',''), 10);
    return n > m ? n : m;
  }, 0);
  return `ORD-${String(max + 1).padStart(3,'0')}`;
};

const batchTotal = (cards) =>
  cards.reduce((sum, c) => sum + (SERVICES.find(s => s.id === c.service)?.price || 0), 0);

// ─── Notion Sync ──────────────────────────────────────────────────────────────
async function syncOrderToNotion(order) {
  if (!NOTION_SYNC) return { success:false, error:'Notion sync disabled' };
  try {
    const res = await fetch(`${NOTION_PROXY_URL}/api/sync-order`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify(order),
    });
    if (!res.ok) throw new Error(`Server responded ${res.status}`);
    return await res.json();
  } catch (err) {
    return { success:false, error: err.message };
  }
}

// ─── Shared Styles ────────────────────────────────────────────────────────────
const IS = (err) => ({
  width:'100%', padding:'13px 16px', borderRadius:14, boxSizing:'border-box',
  border:`1.5px solid ${err ? C.danger : C.border}`,
  background:C.white, color:C.text, fontSize:15, fontFamily:'inherit',
  outline:'none', WebkitAppearance:'none', appearance:'none',
  boxShadow:'0 1px 4px rgba(13,60,30,0.04)',
});

const LS = {
  fontSize:12, fontWeight:700, color:C.muted, marginBottom:7,
  display:'block', letterSpacing:'0.05em', textTransform:'uppercase',
};

// ─── Micro Components ─────────────────────────────────────────────────────────
function Err({ m }) {
  if (!m) return null;
  return <span style={{ fontSize:12, color:C.danger, display:'block', marginTop:4 }}>{m}</span>;
}

function StatusBadge({ status }) {
  const map = {
    pending:     { bg:'rgba(161,100,0,0.10)',  color:'#7a4d00' },
    in_progress: { bg:'rgba(0,137,34,0.12)',   color:'#005c18' },
    complete:    { bg:'rgba(20,70,200,0.09)',   color:'#1a3a8a' },
    picked_up:   { bg:'rgba(100,50,160,0.09)', color:'#4a1a8a' },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{
      fontSize:10, padding:'4px 12px', borderRadius:999,
      fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase',
      background:s.bg, color:s.color,
    }}>
      {STATUS_LABEL[status] || status}
    </span>
  );
}

function NotionSyncBadge({ synced, error }) {
  if (!NOTION_SYNC) return null;
  return (
    <span style={{
      fontSize:9, padding:'3px 10px', borderRadius:999,
      fontWeight:600, letterSpacing:'0.06em',
      background: synced ? 'rgba(0,137,34,0.08)' : 'rgba(185,28,28,0.08)',
      color: synced ? C.main : C.danger,
    }}>
      {synced ? '✓ Notion' : error ? '⚠ Sync failed' : '○ Not synced'}
    </span>
  );
}

// ─── Signature Pad ────────────────────────────────────────────────────────────
function SignaturePad({ onDataChange }) {
  const canvasRef = useRef(null);
  const drawing   = useRef(false);
  const last      = useRef(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    c.width  = c.offsetWidth;
    c.height = 150;
  }, []);

  const getXY = (e) => {
    const c   = canvasRef.current;
    const r   = c.getBoundingClientRect();
    const scX = c.width  / r.width;
    const scY = c.height / r.height;
    const src = e.touches ? e.touches[0] : e;
    return { x:(src.clientX - r.left)*scX, y:(src.clientY - r.top)*scY };
  };

  const startDraw = (e) => { e.preventDefault(); drawing.current = true; last.current = getXY(e); };
  const doDraw    = (e) => {
    e.preventDefault();
    if (!drawing.current) return;
    const c   = canvasRef.current;
    const ctx = c.getContext('2d');
    const pt  = getXY(e);
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(pt.x, pt.y);
    ctx.strokeStyle = C.secondary;
    ctx.lineWidth   = 2.5;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    ctx.stroke();
    last.current = pt;
    onDataChange(c.toDataURL());
  };
  const endDraw = (e) => { e.preventDefault(); drawing.current = false; };

  const clearPad = () => {
    const c = canvasRef.current;
    c.getContext('2d').clearRect(0, 0, c.width, c.height);
    onDataChange(null);
  };

  return (
    <div>
      <div style={{ position:'relative' }}>
        <canvas
          ref={canvasRef}
          style={{
            display:'block', width:'100%', height:'150px',
            borderRadius:16, border:`1.5px solid ${C.border}`,
            background:C.white, touchAction:'none', cursor:'crosshair',
            boxShadow:'0 1px 4px rgba(13,60,30,0.04)',
          }}
          onMouseDown={startDraw}   onMouseMove={doDraw}
          onMouseUp={endDraw}       onMouseLeave={endDraw}
          onTouchStart={startDraw}  onTouchMove={doDraw}  onTouchEnd={endDraw}
        />
        <button type="button" onClick={clearPad} style={{
          position:'absolute', top:8, right:8, fontSize:11,
          padding:'5px 14px', borderRadius:999,
          background:'rgba(255,255,255,0.94)',
          border:`1px solid ${C.border}`, color:C.muted, cursor:'pointer',
        }}>Clear</button>
      </div>
      <p style={{ fontSize:11, color:C.light, margin:'5px 0 0', lineHeight:1.4 }}>
        Sign using your mouse, stylus, or finger.
      </p>
    </div>
  );
}

// ─── Step 1: Client Info ──────────────────────────────────────────────────────
function StepClientInfo({ form, setForm, errors }) {
  const f = (k) => (e) => setForm(p => ({ ...p, [k]:e.target.value }));
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div>
        <label style={LS}>Client Name *</label>
        <input style={IS(errors.clientName)} value={form.clientName} onChange={f('clientName')} placeholder="Full legal name" autoComplete="off" />
        <Err m={errors.clientName} />
      </div>
     <div>
        <label style={LS}>Email</label>
        <input type="email" inputMode="email" style={IS(errors.clientEmail)} value={form.clientEmail} onChange={f('clientEmail')} placeholder="client@email.com (optional)" autoCapitalize="none" />
        <Err m={errors.clientEmail} />
      </div>
      <div>
        <label style={LS}>Phone *</label>
        <input type="tel" inputMode="tel" style={IS(errors.clientPhone)} value={form.clientPhone} onChange={f('clientPhone')} placeholder="(612) 555-0000" />
        <Err m={errors.clientPhone} />
      </div>
      <div>
        <label style={LS}>Preferred Contact Method *</label>
        <select style={IS(errors.contactMethod)} value={form.contactMethod} onChange={f('contactMethod')}>
          <option value="">Select method…</option>
          {CONTACT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <Err m={errors.contactMethod} />
      </div>
    </div>
  );
}

// ─── Step 2: Cards (Batch) ────────────────────────────────────────────────────
function StepCards({ form, setForm, errors, onFormOpenChange }) {
  const [draft,    setDraft]    = useState(emptyCard());
  const [adding,   setAdding]   = useState(form.cards.length === 0);
  const [draftErr, setDraftErr] = useState({});

  // Tell the parent whether a card entry is in progress — blocks Continue
  useEffect(() => { onFormOpenChange?.(adding); }, [adding, onFormOpenChange]);

  const df = (k) => (e) => setDraft(p => ({ ...p, [k]:e.target.value }));

const validateDraft = () => {
    const e = {};
    if (!draft.cardName.trim())  e.cardName  = 'Card is required';
    if (!draft.condition)        e.condition = 'Select a condition';
    if (!draft.service)          e.service   = 'Select a service';
    return e;
  };

  const addCard = () => {
    const e = validateDraft();
    if (Object.keys(e).length) { setDraftErr(e); return; }
    setForm(p => ({ ...p, cards:[...p.cards, { ...draft }] }));
    setDraft(emptyCard());
    setDraftErr({});
    setAdding(false);
  };

  const removeCard = (i) =>
    setForm(p => ({ ...p, cards: p.cards.filter((_, idx) => idx !== i) }));

  const svcFor   = (id) => SERVICES.find(s => s.id === id);
  const total    = batchTotal(form.cards);
  const draftSvc = SERVICES.find(s => s.id === draft.service);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      {/* Empty state */}
      {form.cards.length === 0 && !adding && (
        <div style={{
          textAlign:'center', padding:'30px 20px',
          color:C.muted, fontSize:13, lineHeight:1.6,
          background:'rgba(255,255,255,0.65)', borderRadius:18, border:`1.5px dashed ${C.border}`,
        }}>
          No cards added yet.<br />
          Tap <strong>+ Add Card</strong> below to start your batch.
        </div>
      )}

      {/* Card rows */}
      {form.cards.map((card, i) => {
        const svc = svcFor(card.service);
        return (
          <div key={i} style={{
            background:C.white, border:'none', boxShadow:SHADOW_CARD,
            borderRadius:16, padding:'14px 16px',
            display:'flex', justifyContent:'space-between', alignItems:'center',
            gap:10,
          }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:14, fontWeight:700, color:C.text, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                {card.cardName}
              </div>
              <div style={{ fontSize:12, color:C.muted, marginTop:3 }}>
                {card.condition} · {svc?.label} · ${svc?.price}
              </div>
            </div>
            <button type="button" onClick={() => removeCard(i)} style={{
              background:'transparent', border:`1px solid ${C.border}`,
              borderRadius:999, color:C.danger, fontSize:18, lineHeight:1,
              padding:'4px 11px', cursor:'pointer', flexShrink:0,
            }}>×</button>
          </div>
        );
      })}

      {/* Add card form */}
      {adding && (
        <div style={{
          background:C.white, border:`1.5px solid ${C.main}`,
          borderRadius:18, padding:'18px 16px', boxShadow:SHADOW_CARD,
          display:'flex', flexDirection:'column', gap:14,
        }}>
          <div style={{ fontSize:12, fontWeight:700, color:C.main, textTransform:'uppercase', letterSpacing:'0.07em' }}>
            {form.cards.length > 0 ? `Card ${form.cards.length + 1}` : 'Card Details'}
          </div>
          <div>
            <label style={LS}>Card *</label>
            <input style={IS(draftErr.cardName)} value={draft.cardName} onChange={df('cardName')} placeholder="e.g. Delta Species Charizard" autoComplete="off" />
            <Err m={draftErr.cardName} />
          </div>
          <div>
            <label style={LS}>Condition *</label>
            <select style={IS(draftErr.condition)} value={draft.condition} onChange={df('condition')}>
              <option value="">Select condition…</option>
              {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <Err m={draftErr.condition} />
          </div>
          <div>
            <label style={LS}>Service *</label>
            <select style={IS(draftErr.service)} value={draft.service} onChange={df('service')}>
              <option value="">Select service…</option>
              {SERVICES.map(s => (
                <option key={s.id} value={s.id}>{s.label} — ${s.price}</option>
              ))}
            </select>
            <Err m={draftErr.service} />
          </div>

          {/* Includes clean note */}
          {draftSvc?.includesClean && (
            <div style={{ fontSize:12, color:C.main, background:C.alt, borderRadius:6, padding:'8px 10px' }}>
              ✓ Includes Clean + Polish at no extra charge
            </div>
          )}
          {!draft.service && (
            <div style={{ fontSize:11, color:C.muted, fontStyle:'italic' }}>
              Note: Edge, Dent, and Crease services include Clean + Polish.
            </div>
          )}

          <div style={{ display:'flex', gap:8 }}>
            {form.cards.length > 0 && (
              <button type="button" onClick={() => { setAdding(false); setDraftErr({}); setDraft(emptyCard()); }} style={{
                flex:1, padding:'13px', borderRadius:999, fontSize:14,
                background:C.white, border:`1.5px solid ${C.border}`,
                color:C.text, cursor:'pointer', fontFamily:'inherit', fontWeight:600,
              }}>Cancel</button>
            )}
            <button type="button" onClick={addCard} style={{
              flex:2, padding:'13px', borderRadius:999, fontSize:14,
              fontWeight:700, background:CTA_GRAD, border:'none',
              color:'#fff', cursor:'pointer', fontFamily:'inherit',
              boxShadow:SHADOW_CTA,
            }}>Add Card</button>
          </div>
        </div>
      )}

      {/* Add another button */}
      {!adding && (
        <button type="button" onClick={() => setAdding(true)} style={{
          width:'100%', padding:'15px', borderRadius:16, fontSize:14,
          fontWeight:700, background:'rgba(255,255,255,0.65)',
          border:`2px dashed ${C.main}44`, color:C.main,
          cursor:'pointer', fontFamily:'inherit',
        }}>+ Add Card to Batch</button>
      )}

      <Err m={errors.cards} />

      {/* Batch total */}
      {form.cards.length > 0 && (
        <div style={{
          background:C.white, border:'none', boxShadow:SHADOW_CARD,
          borderRadius:16, padding:'13px 18px',
          display:'flex', justifyContent:'space-between', alignItems:'center',
        }}>
          <span style={{ fontSize:13, color:C.muted }}>
            {form.cards.length} card{form.cards.length !== 1 ? 's' : ''} in batch
          </span>
          <span style={{ fontSize:20, fontWeight:800, color:C.main }}>${total}</span>
        </div>
      )}
    </div>
  );
}

// ─── Step 3: Agreement (full-screen reading) ──────────────────────────────────
function StepAgreement({ waiverRead, onReadToEnd, errors }) {
  const handleScroll = (e) => {
    const el = e.currentTarget;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 30) onReadToEnd();
  };
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      <div>
        <label style={LS}>Service Agreement — Scroll to read in full</label>
        <div onScroll={handleScroll} style={{
          height:'56dvh', overflowY:'auto', border:`1.5px solid ${C.border}`,
          borderRadius:16, padding:'16px 18px', background:C.white,
          fontSize:12.5, lineHeight:1.75, color:C.text,
          WebkitOverflowScrolling:'touch', boxShadow:'0 1px 4px rgba(13,60,30,0.04)',
        }}>
          <div style={{ textAlign:'center', marginBottom:16 }}>
            <div style={{ fontWeight:800, fontSize:15, color:C.secondary }}>
              Just Mint Card Care
            </div>
            <div style={{ fontSize:11, color:C.light, marginTop:4 }}>
              Minneapolis, Minnesota · Version 1.0 · Effective 4/29/2026
            </div>
          </div>
          <p style={{ marginBottom:14 }}>
            This Client Service Agreement ("Agreement") is between Just Mint TCG — Card Cleaning Co. ("Just Mint Card Care," "we," or "us") and the client signing below ("you" or "Client"). By signing, you agree to all terms described in this document. Please read it fully before dropping off any cards.
          </p>
          {WAIVER_SECTIONS.map(s => (
            <div key={s.t} style={{ marginBottom:12 }}>
              <div style={{ fontWeight:700, color:C.secondary, marginBottom:4, fontSize:12.5 }}>{s.t}</div>
              <div style={{ color:C.text }}>{s.b}</div>
            </div>
          ))}
          <div style={{
            marginTop:14, padding:'12px 14px', background:C.alt,
            borderRadius:12, fontSize:11.5, color:C.muted, lineHeight:1.6,
          }}>
            By signing below, you confirm you have read this Agreement in full, agree to all terms and conditions, are at least 18 years of age (or have parental authorization), and that the information you have provided about your cards is accurate and complete.
          </div>
        </div>
      </div>

      {waiverRead ? (
        <div style={{
          background:C.alt, border:`1.5px solid ${C.main}55`, borderRadius:999,
          padding:'11px 16px', fontSize:13, fontWeight:700, color:C.main, textAlign:'center',
        }}>
          ✓ You've reached the end — continue to sign
        </div>
      ) : (
        <div style={{
          background:'rgba(255,255,255,0.75)', borderRadius:999,
          padding:'11px 16px', fontSize:13, fontWeight:600, color:C.muted, textAlign:'center',
        }}>
          ↓ Scroll to the end of the agreement to unlock the signature step
        </div>
      )}
      <Err m={errors.waiver} />
    </div>
  );
}

// ─── Step 4: Signature & Payment ──────────────────────────────────────────────
function StepSignature({ form, setForm, sigData, setSigData, errors }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <p style={{ fontSize:14, color:C.muted, margin:0, lineHeight:1.6 }}>
        You've read the Service Agreement. Sign below to accept it, then choose the payment method.
      </p>
      <div>
        <label style={LS}>Client Signature *</label>
        <SignaturePad onDataChange={setSigData} />
        <Err m={errors.signature} />
      </div>

      <label style={{ display:'flex', alignItems:'flex-start', gap:12, cursor:'pointer' }}>
        <input
          type="checkbox"
          checked={form.agreed || false}
          onChange={e => setForm(p => ({ ...p, agreed:e.target.checked }))}
          style={{ marginTop:2, accentColor:C.main, width:18, height:18, flexShrink:0, cursor:'pointer' }}
        />
        <span style={{ fontSize:14, color:C.text, lineHeight:1.5 }}>
          I have read and agree to the Just Mint Card Care Service Agreement in full.
        </span>
      </label>
      <Err m={errors.agreed} />

      {/* Payment method — merged into this step */}
      <div style={{ marginTop:4 }}>
        <label style={LS}>Payment Method *</label>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {PAYMENT_TYPES.map(pt => {
            const active = form.paymentType === pt;
            return (
              <button key={pt} type="button"
                onClick={() => setForm(p => ({ ...p, paymentType:pt }))}
                style={{
                  padding:'16px 12px', borderRadius:16, cursor:'pointer',
                  fontSize:15, fontFamily:'inherit',
                  fontWeight: active ? 700 : 500,
                  border:`2px solid ${active ? C.main : 'transparent'}`,
                  background: active ? C.alt : C.white,
                  color: active ? C.main : C.text,
                  boxShadow: active ? SHADOW_CTA : SHADOW_CARD,
                  transition:'all 0.15s',
                }}
              >
                {pt}
              </button>
            );
          })}
        </div>
        <Err m={errors.paymentType} />
      </div>
    </div>
  );
}

// ─── Step 5: Sign Off ─────────────────────────────────────────────────────────
function StepSignOff({ form }) {
  const total = batchTotal(form.cards);
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <p style={{ fontSize:14, color:C.muted, margin:0 }}>
        Review the full order. Tapping <strong style={{ color:C.secondary }}>Approve & Begin Service</strong> is your authorization to start work.
      </p>

      {/* Client summary */}
      <div style={{ background:C.white, border:'none', boxShadow:SHADOW_CARD, borderRadius:18, padding:18 }}>
        <div style={{ fontSize:10, color:C.muted, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8 }}>Client</div>
        <div style={{ fontSize:15, fontWeight:700, color:C.text }}>{form.clientName}</div>
        <div style={{ fontSize:12, color:C.muted, marginTop:3 }}>
          {form.clientEmail} · {form.clientPhone} · {form.contactMethod}
        </div>
        <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>
          Payment: {form.paymentType}
        </div>
      </div>

      {/* Cards summary */}
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        <div style={{ fontSize:10, color:C.muted, textTransform:'uppercase', letterSpacing:'0.07em' }}>
          Batch — {form.cards.length} card{form.cards.length !== 1 ? 's' : ''}
        </div>
        {form.cards.map((card, i) => {
          const svc = SERVICES.find(s => s.id === card.service);
          return (
            <div key={i} style={{
              background:C.white, border:'none', boxShadow:'0 2px 10px rgba(13,60,30,0.06)',
              borderRadius:14, padding:'12px 14px',
              display:'flex', justifyContent:'space-between', alignItems:'center',
            }}>
              <div>
                 <div style={{ fontSize:13, fontWeight:600, color:C.text }}>
                  {card.cardName}
                </div>
                <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>
                  {card.condition} · {svc?.label}
                </div>
              </div>
              <div style={{ fontSize:15, fontWeight:700, color:C.main }}>${svc?.price}</div>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div style={{
        background:C.white, border:`2px solid ${C.main}`, borderRadius:18,
        padding:'14px 18px', display:'flex', justifyContent:'space-between', alignItems:'center',
        boxShadow:SHADOW_CARD,
      }}>
        <div>
          <div style={{ fontSize:10, color:C.muted, textTransform:'uppercase', letterSpacing:'0.07em' }}>Batch Total</div>
          <div style={{ fontSize:11, color:C.light, marginTop:2 }}>
            ✓ Waiver signed · {new Date().toLocaleDateString('en-US')}
          </div>
        </div>
        <div style={{ fontSize:28, fontWeight:800, color:C.main }}>${total}</div>
      </div>
    </div>
  );
}

// ─── Order Card ───────────────────────────────────────────────────────────────
function OrderCard({ order, onAdvance, onRetrySync }) {
  const [expanded, setExpanded] = useState(false);
  const total     = batchTotal(order.cards || []);
  const canAdvance = order.status !== 'picked_up';

  return (
    <div style={{
      background:C.white, border:'none', boxShadow:SHADOW_CARD,
      borderRadius:20, marginBottom:14, overflow:'hidden',
    }}>
      {/* Main row */}
      <div
        style={{ padding:'14px 16px', cursor:'pointer' }}
        onClick={() => setExpanded(x => !x)}
      >
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
          <div style={{ flex:1, marginRight:10 }}>
            <div style={{ fontSize:15, fontWeight:700, color:C.text, lineHeight:1.3 }}>
              {order.clientName}
            </div>
            <div style={{ fontSize:11, color:C.light, marginTop:1 }}>
              {order.id} · {order.dateCreated}
            </div>
          </div>
          <div style={{ textAlign:'right', flexShrink:0 }}>
            <div style={{ fontSize:18, fontWeight:800, color:C.main }}>${total}</div>
            <div style={{ fontSize:10, color:C.muted }}>
              {order.cards?.length || 0} card{(order.cards?.length || 0) !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
          <StatusBadge status={order.status} />
          <NotionSyncBadge synced={order.notionSynced} error={order.notionError} />
          <span style={{ fontSize:10, color:C.light, marginLeft:'auto' }}>
            {expanded ? '▲ Hide cards' : '▼ Show cards'}
          </span>
        </div>
      </div>

      {/* Expanded card list */}
      {expanded && (
        <div style={{ borderTop:`1px solid ${C.border}`, padding:'12px 16px', background:C.bg }}>
          <div style={{ display:'flex', flexDirection:'column', gap:7, marginBottom:12 }}>
            {(order.cards || []).map((card, i) => {
              const svc = SERVICES.find(s => s.id === card.service);
              return (
                <div key={i} style={{
                  background:C.white, border:`1px solid ${C.border}`,
                  borderRadius:7, padding:'9px 12px',
                  display:'flex', justifyContent:'space-between', alignItems:'center',
                }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:C.text }}>
                      {card.cardName} ({card.year}){card.cardNumber ? ` #${card.cardNumber}` : ''}
                    </div>
                    <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>
                      {card.condition} · {svc?.label}
                    </div>
                  </div>
                  <div style={{ fontSize:14, fontWeight:700, color:C.main }}>${svc?.price}</div>
                </div>
              );
            })}
          </div>

          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {canAdvance && (
              <button type="button" onClick={() => onAdvance(order.id)} style={{
                flex:1, fontSize:13, padding:'11px 12px', borderRadius:999,
                background:CTA_GRAD, color:'#fff', border:'none',
                fontWeight:700, cursor:'pointer', fontFamily:'inherit',
                minWidth:120, boxShadow:SHADOW_CTA,
              }}>
                {STATUS_BTN[order.status]}
              </button>
            )}
            {NOTION_SYNC && !order.notionSynced && (
              <button type="button" onClick={() => onRetrySync(order.id)} style={{
                flex:1, fontSize:13, padding:'11px 12px', borderRadius:999,
                background:C.white, color:C.muted,
                border:`1.5px solid ${C.border}`, fontWeight:600,
                cursor:'pointer', fontFamily:'inherit', minWidth:120,
              }}>
                ↻ Retry Notion Sync
              </button>
            )}
          </div>

          <div style={{ fontSize:10, color:C.light, marginTop:10 }}>
            {order.paymentType} · Waiver signed {order.waiverSignedAt
              ? new Date(order.waiverSignedAt).toLocaleString('en-US')
              : '—'}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [orders, setOrders] = useState(() => {
    try { return JSON.parse(localStorage.getItem('jm_orders') || '[]'); }
    catch { return []; }
  });

  const [tab,       setTab]       = useState('active');
  const [search,    setSearch]    = useState('');
  const [showModal, setShowModal] = useState(false);
  const [step,      setStep]      = useState(1);
  const [form,      setForm]      = useState(emptyForm);
  const [sigData,   setSigData]   = useState(null);
  const [errors,    setErrors]    = useState({});
  const [submitting,setSubmitting]= useState(false);
  const [cardFormOpen, setCardFormOpen] = useState(false); // card entry in progress
  const [waiverRead,   setWaiverRead]   = useState(false); // scrolled to end of agreement

  // Incomplete entries — anything closed before Approve is kept here, never lost
  const [drafts, setDrafts] = useState(() => {
    try { return JSON.parse(localStorage.getItem('jm_drafts')) || []; } catch { return []; }
  });
  const [activeDraftId, setActiveDraftId] = useState(null);

  useEffect(() => {
    localStorage.setItem('jm_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('jm_drafts', JSON.stringify(drafts));
  }, [drafts]);

  // ── Two-way sync: pull statuses back from Notion ──────────────────────────
  // Notion is the source of truth. Runs on load, on returning to the tab,
  // and every 60 seconds. Only orders that synced to Notion are affected.
  useEffect(() => {
    if (!NOTION_SYNC) return;
    let stopped = false;

    const pull = async () => {
      try {
        const res = await fetch(`${NOTION_PROXY_URL}/api/orders`);
        if (!res.ok) return;
        const remote = await res.json();
        if (stopped || !Array.isArray(remote)) return;
        const byId = Object.fromEntries(remote.map(r => [r.pageId, r]));
        setOrders(prev => prev.map(o => {
          const pid = (o.notionOrderUrls?.[0] || '')
            .replace(/-/g, '').match(/([a-f0-9]{32})/i)?.[1];
          const r = pid ? byId[pid] : null;
          if (!r || !r.appStatus) return o;
          if (r.appStatus === o.status && (o.orderNumber || !r.orderNumber)) return o;
          return { ...o, status: r.appStatus, orderNumber: o.orderNumber || r.orderNumber };
        }));
      } catch { /* offline or cold function — try again next cycle */ }
    };

    pull();
    const interval = setInterval(pull, 60000);
    const onFocus = () => pull();
    window.addEventListener('focus', onFocus);
    return () => {
      stopped = true;
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const openModal = () => {
    setForm(emptyForm());
    setSigData(null);
    setErrors({});
    setStep(1);
    setCardFormOpen(false);
    setWaiverRead(false);
    setActiveDraftId(null);
    setShowModal(true);
  };

  // Closing the sheet mid-entry keeps the work as an Incomplete Entry
  const closeModal = () => {
    const hasContent =
      form.clientName.trim() || form.clientEmail.trim() ||
      form.clientPhone.trim() || form.cards.length > 0;
    if (hasContent) {
      const draft = {
        draftId: activeDraftId || `DRAFT-${Date.now()}`,
        form, sigData, waiverRead, step,
        savedAt: new Date().toISOString(),
      };
      setDrafts(prev => [draft, ...prev.filter(d => d.draftId !== draft.draftId)]);
    }
    setShowModal(false);
  };

  const resumeDraft = (d) => {
    setForm(d.form);
    setSigData(d.sigData || null);
    setWaiverRead(!!d.waiverRead);
    setErrors({});
    // Clamp in case a draft was saved under an older step layout
    setStep(Math.min(d.step || 1, STEP_NAMES.length));
    setCardFormOpen(false);
    setActiveDraftId(d.draftId);
    setShowModal(true);
  };

  const deleteDraft = (id) => setDrafts(prev => prev.filter(d => d.draftId !== id));

  const validate = (s) => {
    const e = {};
    if (s === 1) {
      if (!form.clientName.trim())   e.clientName  = 'Client name is required';
      if (form.clientEmail.trim() && !/\S+@\S+\.\S+/.test(form.clientEmail))
        e.clientEmail = 'Enter a valid email address';
      if (!form.clientPhone.trim())  e.clientPhone = 'Phone number is required';
      if (!form.contactMethod)       e.contactMethod = 'Select a contact method';
    }
    if (s === 2) {
      if (cardFormOpen)              e.cards = 'Finish the card you’re entering — tap "Add Card" to save it, or Cancel — before continuing';
      else if (form.cards.length === 0) e.cards = 'Add at least one card to continue';
    }
    if (s === 3) {
      if (!waiverRead)               e.waiver = 'Please scroll to the end of the agreement to continue';
    }
    if (s === 4) {
      if (!sigData)                  e.signature = 'Please provide a signature above';
      if (!form.agreed)              e.agreed    = 'You must agree to the terms to continue';
      if (!form.paymentType)         e.paymentType = 'Please select a payment method';
    }
    return e;
  };

  const next = () => {
    const e = validate(step);
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setStep(p => p + 1);
  };

  const back = () => { setErrors({}); setStep(p => p - 1); };

  const submit = async () => {
    setSubmitting(true);
    const newOrder = {
      id:              genId(orders),
      clientName:      form.clientName,
      clientEmail:     form.clientEmail,
      clientPhone:     form.clientPhone,
      contactMethod:   form.contactMethod,
      cards:           form.cards,
      paymentType:     form.paymentType,
      signatureDataUrl:sigData,
      status:          'pending',
      dateCreated:     new Date().toLocaleDateString('en-US'),
      waiverSignedAt:  new Date().toISOString(),
      notionSynced:    false,
      notionError:     null,
    };

    // Notion sync: creates/matches the client + creates the batch (real ORD-#)
    if (NOTION_SYNC) {
      const result = await syncOrderToNotion(newOrder);
      newOrder.notionSynced    = result.success;
      newOrder.notionError     = result.error || null;
      newOrder.notionCardIds   = result.cardIds || [];
      newOrder.notionOrderUrls = result.orderUrls || [];
      newOrder.orderNumber     = result.orderNumber || null;

      // Fire-and-forget: signed waiver PDF → emailed to you + attached to the
      // client's Notion page. Never blocks or fails the order flow.
      fetch(`${NOTION_PROXY_URL}/api/send-waiver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName:  newOrder.clientName,
          email:       newOrder.clientEmail,
          notes:       null,
          signedAt:    newOrder.waiverSignedAt,
          sigDataUrl:  newOrder.signatureDataUrl,
        }),
      }).catch(() => {});
    }

    setOrders(prev => [newOrder, ...prev]);
    // Approved — the incomplete entry (if resuming one) is no longer needed
    if (activeDraftId) {
      setDrafts(prev => prev.filter(d => d.draftId !== activeDraftId));
      setActiveDraftId(null);
    }
    setSubmitting(false);
    setShowModal(false);
  };

  const advance = (id) => setOrders(prev => prev.map(o => {
    if (o.id !== id) return o;
    const nextStatus = STATUS_NEXT[o.status] || o.status;
    // Fire-and-forget: move the batch on the Notion Pipeline board too
    if (NOTION_SYNC && o.notionOrderUrls?.length) {
      fetch(`${NOTION_PROXY_URL}/api/update-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderUrls: o.notionOrderUrls, status: nextStatus }),
      }).catch(() => {});
    }
    return { ...o, status: nextStatus };
  }));

  const retrySync = async (id) => {
    const order = orders.find(o => o.id === id);
    if (!order) return;
    const result = await syncOrderToNotion(order);
    setOrders(prev => prev.map(o =>
      o.id !== id ? o
      : { ...o,
          notionSynced:    result.success,
          notionError:     result.error || null,
          notionCardIds:   result.cardIds || [],
          notionOrderUrls: result.orderUrls || [],
          orderNumber:     result.orderNumber || o.orderNumber || null,
        }
    ));
  };

  const filtered = orders.filter(o => {
    const inTab = tab === 'active' ? o.status !== 'picked_up' : o.status === 'picked_up';
    const q     = search.toLowerCase();
    const hit   = !q || [o.clientName, o.id, ...(o.cards||[]).map(c=>c.cardName)]
      .some(v => (v||'').toLowerCase().includes(q));
    return inTab && hit;
  });

  const activeCount    = orders.filter(o => o.status !== 'picked_up').length;
  const completedCount = orders.filter(o => o.status === 'picked_up').length;
  const pendingCount   = orders.filter(o => o.status === 'pending').length;
  const inProgCount    = orders.filter(o => o.status === 'in_progress').length;

  return (
    <div style={{
      minHeight:'100vh', background:GRAD, backgroundAttachment:'fixed',
      fontFamily:"'Inter',system-ui,-apple-system,'Segoe UI',sans-serif",
      maxWidth:500, margin:'0 auto', position:'relative',
    }}>

      {/* ── Header ── */}
      <div style={{
        background:'linear-gradient(135deg,#1E5C0B 0%,#206100 55%,#0C4A16 100%)',
        padding:'16px 20px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        position:'sticky', top:0, zIndex:100,
        boxShadow:'0 4px 18px rgba(13,38,21,0.22)',
        borderRadius:'0 0 22px 22px',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{
            width:38, height:38, borderRadius:12, background:'rgba(255,255,255,0.14)',
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
          }}>
            <Leaf size={20} color="#B8F0C6" />
          </div>
          <div>
            <div style={{
              fontSize:20, fontWeight:800, color:'#ffffff',
              letterSpacing:'-0.02em', lineHeight:1.15,
            }}>
              Just Mint <span style={{ color:'#9FE8B4', fontWeight:700 }}>Card Care</span>
            </div>
          </div>
        </div>
        <button type="button" onClick={openModal} style={{
          background:'#ffffff', color:C.secondary, border:'none',
          padding:'11px 18px', borderRadius:999, fontSize:13,
          fontWeight:800, cursor:'pointer', fontFamily:'inherit',
          letterSpacing:'0.02em', boxShadow:'0 4px 12px rgba(0,0,0,0.18)',
        }}>
          + New Order
        </button>
      </div>

      {/* ── Tabs (pill segmented control) ── */}
      <div style={{ display:'flex', gap:8, padding:'16px 18px 4px' }}>
        {[['active','Active Orders',activeCount],['completed','Picked Up',completedCount]].map(([id,label,count]) => (
          <button key={id} type="button" onClick={() => setTab(id)} style={{
            flex:1, padding:'11px 14px', fontSize:13,
            fontWeight: tab === id ? 800 : 600,
            color: tab === id ? C.secondary : C.muted,
            background: tab === id ? C.white : 'rgba(255,255,255,0.45)',
            border:'none', borderRadius:999,
            boxShadow: tab === id ? SHADOW_CARD : 'none',
            cursor:'pointer', fontFamily:'inherit',
            display:'flex', alignItems:'center', justifyContent:'center', gap:7,
            transition:'all 0.15s',
          }}>
            {label}
            <span style={{
              fontSize:11, padding:'2px 9px', borderRadius:999,
              background: tab === id ? C.alt : 'transparent',
              color: tab === id ? C.main : C.light, fontWeight:700,
            }}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Search ── */}
      <div style={{ padding:'12px 18px 2px' }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by client name, card name, or order ID…"
          style={{ ...IS(), fontSize:14, borderRadius:999, border:'none', boxShadow:SHADOW_CARD }}
        />
      </div>

      {/* ── Order List ── */}
      <div style={{ padding:'14px 16px', paddingBottom:100 }}>

        {/* Incomplete entries — saved work that hasn't been approved yet */}
        {tab === 'active' && drafts.length > 0 && (
          <div style={{ marginBottom:18 }}>
            <div style={{
              fontSize:10, fontWeight:800, color:'#7a4d00',
              textTransform:'uppercase', letterSpacing:'0.1em', margin:'2px 4px 8px',
            }}>
              Incomplete entries — not yet approved
            </div>
            {drafts.map(d => (
              <div key={d.draftId} style={{
                background:'#FFF9EC', borderLeft:'4px solid #E5A800',
                borderRadius:16, boxShadow:SHADOW_CARD, marginBottom:10,
                padding:'12px 14px', display:'flex', alignItems:'center', gap:10,
              }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:14, fontWeight:700, color:C.text, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                    {d.form?.clientName?.trim() || 'Unnamed client'}
                  </div>
                  <div style={{ fontSize:11, color:'#7a4d00', marginTop:2 }}>
                    {(d.form?.cards?.length || 0)} card{(d.form?.cards?.length || 0) !== 1 ? 's' : ''}
                    {' · stopped at '}{STEP_NAMES[(d.step || 1) - 1]}
                    {' · '}{new Date(d.savedAt).toLocaleString('en-US', { month:'short', day:'numeric', hour:'numeric', minute:'2-digit' })}
                  </div>
                </div>
                <button type="button" onClick={() => resumeDraft(d)} style={{
                  fontSize:12, fontWeight:800, padding:'10px 16px', borderRadius:999,
                  background:CTA_GRAD, color:'#fff', border:'none', cursor:'pointer',
                  fontFamily:'inherit', boxShadow:SHADOW_CTA, flexShrink:0,
                }}>Resume</button>
                <button type="button" onClick={() => { if (window.confirm('Delete this incomplete entry? The saved card info will be lost.')) deleteDraft(d.draftId); }} style={{
                  fontSize:16, padding:'7px 12px', borderRadius:999,
                  background:'transparent', color:C.danger, border:`1px solid ${C.border}`,
                  cursor:'pointer', flexShrink:0, lineHeight:1,
                }}>×</button>
              </div>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px', color:C.light }}>
            <div style={{ marginBottom:14, lineHeight:1, opacity:0.55 }}><Leaf size={48} color={C.light} /></div>
            <div style={{ fontSize:14, lineHeight:1.7 }}>
              {search
                ? 'No orders match your search.'
                : tab === 'active'
                  ? 'No active orders.\nTap + New Order to get started.'
                  : 'No picked-up orders yet.'}
            </div>
          </div>
        ) : (
          filtered.map(o => (
            <OrderCard key={o.id} order={o} onAdvance={advance} onRetrySync={retrySync} />
          ))
        )}
      </div>

      {/* ── Footer Stats ── */}
      <div style={{
        position:'sticky', bottom:12, margin:'0 18px',
        background:'rgba(255,255,255,0.92)', backdropFilter:'blur(8px)',
        borderRadius:20, boxShadow:'0 8px 28px rgba(13,60,30,0.14)',
        padding:'12px 22px', display:'flex', gap:28, zIndex:90,
      }}>
        <div>
          <div style={{ fontSize:9, color:C.light, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:2 }}>In Progress</div>
          <div style={{ fontSize:22, fontWeight:800, color:C.main }}>{inProgCount}</div>
        </div>
        <div>
          <div style={{ fontSize:9, color:C.light, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:2 }}>Pending</div>
          <div style={{ fontSize:22, fontWeight:800, color:'#7a4d00' }}>{pendingCount}</div>
        </div>
        <div>
          <div style={{ fontSize:9, color:C.light, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:2 }}>Total Orders</div>
          <div style={{ fontSize:22, fontWeight:800, color:C.text }}>{orders.length}</div>
        </div>
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div
          style={{
            position:'fixed', inset:0,
            background:'rgba(13,38,21,0.68)',
            zIndex:200, display:'flex',
            alignItems:'flex-end', justifyContent:'center',
          }}
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div style={{
            background:GRAD, width:'100%', maxWidth:500,
            maxHeight:'93dvh', borderRadius:'26px 26px 0 0',
            display:'flex', flexDirection:'column', overflow:'hidden',
          }}>
            {/* Modal header */}
            <div style={{
              padding:'16px 18px', background:C.white,
              borderBottom:`1px solid ${C.border}`,
              display:'flex', alignItems:'center', justifyContent:'space-between',
              flexShrink:0,
            }}>
              <div>
                <div style={{ fontSize:16, fontWeight:700, color:C.secondary }}>New Order</div>
                <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>
                  Step {step} of {STEP_NAMES.length} — {STEP_NAMES[step-1]}
                </div>
              </div>
              <button type="button" onClick={closeModal} style={{
                background:'transparent', border:'none',
                fontSize:22, color:C.muted, cursor:'pointer',
                padding:'4px 8px', lineHeight:1, borderRadius:999,
              }}>✕</button>
            </div>

            {/* Progress bar */}
            <div style={{
              display:'flex', gap:4, padding:'10px 18px',
              background:C.white, borderBottom:`1px solid ${C.border}`,
              flexShrink:0,
            }}>
              {STEP_NAMES.map((_, i) => (
                <div key={i} style={{
                  flex:1, height:6, borderRadius:999,
                  background: i < step ? CTA_GRAD : C.border,
                  transition:'background 0.2s',
                }} />
              ))}
            </div>

            {/* Modal body */}
            <div style={{
              flex:1, overflowY:'auto', padding:'20px 18px',
              WebkitOverflowScrolling:'touch',
            }}>
              {step === 1 && <StepClientInfo form={form} setForm={setForm} errors={errors} />}
              {step === 2 && <StepCards      form={form} setForm={setForm} errors={errors} onFormOpenChange={setCardFormOpen} />}
              {step === 3 && <StepAgreement  waiverRead={waiverRead} onReadToEnd={() => setWaiverRead(true)} errors={errors} />}
              {step === 4 && <StepSignature  form={form} setForm={setForm} sigData={sigData} setSigData={setSigData} errors={errors} />}
              {step === 5 && <StepSignOff    form={form} />}
            </div>

            {/* Modal footer */}
            <div style={{
              padding:'14px 18px', background:C.white,
              borderTop:`1px solid ${C.border}`,
              display:'flex', gap:10, flexShrink:0,
            }}>
              {step > 1 && (
                <button type="button" onClick={back} style={{
                  flex:1, padding:'15px', borderRadius:999, fontSize:14,
                  background:C.white, border:`1.5px solid ${C.border}`,
                  color:C.text, cursor:'pointer', fontFamily:'inherit', fontWeight:600,
                }}>Back</button>
              )}
              {step < 5 ? (
                <button type="button" onClick={next} disabled={step === 3 && !waiverRead} style={{
                  flex:2, padding:'15px', borderRadius:999, fontSize:15,
                  fontWeight:800,
                  background: (step === 3 && !waiverRead) ? C.light : CTA_GRAD,
                  border:'none',
                  color:'#fff',
                  cursor: (step === 3 && !waiverRead) ? 'not-allowed' : 'pointer',
                  fontFamily:'inherit',
                  boxShadow: (step === 3 && !waiverRead) ? 'none' : SHADOW_CTA,
                  letterSpacing:'0.01em',
                }}>
                  {step === 3 ? (waiverRead ? 'Continue to Signature' : 'Scroll to the end ↓') : 'Continue'}
                </button>
              ) : (
                <button type="button" onClick={submit} disabled={submitting} style={{
                  flex:2, padding:'15px', borderRadius:999, fontSize:15,
                  fontWeight:800, background: submitting ? C.light : CTA_GRAD,
                  border:'none', color:'#fff', cursor: submitting ? 'not-allowed' : 'pointer',
                  fontFamily:'inherit', letterSpacing:'0.02em',
                  boxShadow: submitting ? 'none' : SHADOW_CTA,
                }}>
                  {submitting ? 'Saving…' : 'Approve & Begin Service'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}