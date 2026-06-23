import { useState, useRef, useEffect } from "react";

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  green: '#008922', dark: '#206100', bg: '#F4FBF6',
  white: '#ffffff', border: '#b8dfc4', text: '#0d2615', muted: '#4a7a58',
};

// ── Data ──────────────────────────────────────────────────────────────────────
const SERVICES = [
  { name: 'Clean + Polish',             price: '$8'  },
  { name: 'Edge & Corner Lift Correction', price: '$30', note: 'includes Clean + Polish' },
  { name: 'Dent Correction',            price: '$40', note: 'includes Clean + Polish' },
  { name: 'Crease Correction',          price: '$50', note: 'includes Clean + Polish' },
];

const SECTIONS = [
  ['1. Services & Pricing',
   `Just Mint Card Care provides card cleaning and restoration services on collectible trading cards, including Pokémon and other TCG cards. Prices are per card, in USD.

• Clean + Polish (Surface clean, holo polish) — $8
• Edge & Corner Lift Correction (Clean + Polish included) — $30
• Dent Correction (Clean + Polish included) — $40
• Crease Correction (Clean + Polish included) — $50

Cards requiring multiple types of correction will be quoted as a single service. The scope will be agreed upon before any work begins.`],

  ['2. How the Process Works',
   `Step 1 — Request a Quote: Reach out before dropping off your cards. Share photos and a list of the cards you'd like serviced. We'll review them and send a written quote outlining the service, price per card, estimated turnaround, and total cost.

Step 2 — Approve the Quote: Once you're happy with the quote, sign and return it. Your signature confirms you've reviewed the scope of work, agree to the pricing, and have read this Agreement.

Step 3 — Pay & Drop Off: Full payment is due at or before drop-off. We do not begin work until both the signed agreement and payment have been received. Drop-off is by appointment in the Minneapolis area.

Step 4 — Pre-Condition Documentation: Before any work begins, we photograph and document the condition of every card in your batch. This record is shared with you and becomes the before-and-after reference. It protects both of us.

Step 5 — Restoration: We get to work. If we discover unexpected issues that change the scope, we will pause and contact you before continuing. No additional work will be performed without your approval.

Step 6 — Pick Up: When your batch is ready, we'll notify you to schedule pick-up. Cards are returned in protective sleeves and toploaders. The service is considered complete once you've received your cards.`],

  ['3. Payment',
   `• Full payment is required before work begins. We accept cash, Venmo, and PayPal.
• All prices are in USD.
• If the scope of work changes due to a hidden defect, we will provide a revised quote before proceeding. You are not obligated to accept the revision.
• Invoices are issued for every order. Keep your copy for your records.`],

  ['4. Risks of Card Restoration',
   `4.1 Risk of Worsening: There is always a possibility that a card's condition may worsen during restoration, even when handled with care. This risk is inherent to the materials involved. We will never attempt a service we believe is likely to cause additional damage without first telling you.

4.2 Pre-Existing Damage: The pre-condition documentation completed at drop-off establishes the baseline condition of your cards. Just Mint Card Care is not responsible for any damage that was present prior to drop-off and documented in that record.

4.3 No Grading Guarantees: We make no guarantees regarding how a card will grade after restoration. Grading company standards are outside our control. We cannot be held responsible for any grading outcome.

4.4 Severely Damaged Cards: If we assess that proceeding poses a high risk of further damage, we will contact you before touching the card. If you choose to proceed, you accept the risk and release Just Mint Card Care from liability for any worsening. If you choose to cancel that card, we will refund its service fee in full.`],

  ['5. Cancellations & Refunds',
   `• You may cancel your order any time before drop-off for a full refund.
• Once work has begun on a card, that card's service fee is non-refundable.
• If a card cannot be serviced for any reason on our end (e.g., we determine it's a counterfeit, or we cannot safely complete the work), we will refund that card's service fee in full.
• If the quote scope changes due to hidden damage and no agreement is reached, the portion of work not performed is refunded.`],

  ['6. Your Responsibilities',
   `• Provide accurate information about the cards you're submitting, including their condition, any known damage, and whether they are authentic.
• Do not submit counterfeit or altered cards (e.g., cards with paint, coating, or any substance added to conceal damage). Submission of altered cards is grounds for immediate refusal and forfeiture of applicable fees.
• Ensure the cards you drop off match the cards listed on the approved quote.
• Provide accurate contact information (name, phone, email).
• Communicate promptly if your contact details change or if you need to modify your order.
• Confirm any order changes in writing.`],

  ['7. Turnaround Time',
   `Estimated turnaround times are provided in good faith. Actual completion may vary based on batch complexity, order queue, and any unexpected issues discovered during restoration.

We commit to completing your batch within the following timeframes from the date of drop-off:

• Clean + Polish — within 1 week
• Edge & Corner Lift Correction — 1.5 to 2 weeks
• Dent Correction — 1.5 to 2 weeks
• Crease Correction — 2 to 3 weeks

If we anticipate a significant delay beyond these windows, we will notify you as soon as possible.`],

  ['8. Claims & Disputes',
   `• Claims must be submitted within 5 days of pick-up by contacting us at justminttcg@gmail.com.
• Please include photos or video of the cards in question. We photograph all cards before and after service and will reference both records when reviewing any claim.
• We will respond to all claims within 3 business days and work with you in good faith to reach a fair resolution.
• Disputes that cannot be resolved directly will be handled under Minnesota law (see Section 11).`],

  ['9. Liability',
   `Just Mint Card Care's liability is limited strictly to the service fees paid for the affected cards. This is the maximum compensation available regardless of the card's market value.

If a card is damaged due to our error during the restoration process, we will refund the service fee paid for that card in full. This refund represents our total liability.

Just Mint Card Care is not liable for:
• Damage that was pre-existing and documented at drop-off
• Damage caused by inherent fragility of the card material
• Grading outcomes or results after restoration
• Any damage occurring after pick-up
• Losses unrelated to the direct service performed
• Any amount exceeding the service fee paid for the affected card

Note: Clients submitting cards with a fair market value exceeding $200 do so at their own risk and are encouraged to obtain their own insurance prior to drop-off. Just Mint Card Care's liability remains capped at the service fee paid regardless of card value.`],

  ['10. Your Information',
   `We collect your name, contact information, and card details solely to manage your order. We do not sell or share your personal information with third parties.

We may photograph or document your cards for internal record-keeping and quality tracking, or for portfolio/marketing use (e.g., before/after photos) — only with your written consent.

Personal information (name, contact details, payment info) is retained for 1 year after your last service, then automatically deleted. Before/after photos and service records are retained for up to 5 years as part of our professional work history, then deleted. You may request earlier deletion of any of your records at any time by contacting us at justminttcg@gmail.com.`],

  ['11. Governing Law',
   `This Agreement is governed by the laws of the State of Minnesota. Any disputes that cannot be resolved informally will be handled in the appropriate courts of Hennepin County, Minnesota.

If any part of this Agreement is found to be unenforceable, the remaining provisions continue in full effect.`],
];

// ── Build receipt image on canvas ────────────────────────────────────────────
async function buildReceiptImage(record) {
  const signed = new Date(record.signedAt).toLocaleString('en-US', {
    year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit',
  });

  // Load signature image element first (needed for drawImage)
  let sigEl = null;
  if (record.sig) {
    sigEl = await new Promise(res => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = () => res(null);
      img.src = record.sig;
    });
  }

  const W = 800, P = 48, DPR = 2;
  const notesH  = record.notes ? 40 : 0;
  const totalH  = 480 + notesH;

  const canvas  = document.createElement('canvas');
  canvas.width  = W * DPR;
  canvas.height = totalH * DPR;
  const ctx = canvas.getContext('2d');
  ctx.scale(DPR, DPR);

  // ── background ──
  ctx.fillStyle = '#F4FBF6';
  ctx.fillRect(0, 0, W, totalH);

  // ── top green bar ──
  const g = ctx.createLinearGradient(0,0,W,0);
  g.addColorStop(0,'#008922'); g.addColorStop(1,'#206100');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, 6);

  let y = 42;

  // ── title ──
  ctx.fillStyle = '#206100';
  ctx.font = `bold 28px Arial, sans-serif`;
  ctx.fillText('Just Mint Card Care', P, y);
  y += 32;
  ctx.fillStyle = '#4a7a58';
  ctx.font = `12px Arial, sans-serif`;
  ctx.fillText('SIGNED SERVICE AGREEMENT & LIABILITY WAIVER', P, y);
  y += 20;

  // ── divider ──
  ctx.strokeStyle = '#b8dfc4'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(P, y); ctx.lineTo(W-P, y); ctx.stroke();
  y += 22;

  // ── details box ──
  const boxH = 50 + 38 + 38 + notesH + 20;
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#b8dfc4'; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(P, y, W-P*2, boxH, 8);
  ctx.fill(); ctx.stroke();

  const bx = P+20; let by = y+26;
  const drawRow = (label, value) => {
    ctx.fillStyle = '#4a7a58'; ctx.font = '12px Arial';
    ctx.fillText(label, bx, by);
    ctx.fillStyle = '#0d2615'; ctx.font = 'bold 16px Arial';
    ctx.fillText(value, bx+90, by);
    by += 38;
  };
  drawRow('Client', record.name);
  drawRow('Signed', signed);
  if (record.notes) drawRow('Notes', record.notes.substring(0,60) + (record.notes.length>60?'…':''));
  y += boxH + 18;

  // ── signature box ──
  const sigBoxH = 150;
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#b8dfc4'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(P, y, W-P*2, sigBoxH, 8);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#4a7a58'; ctx.font = 'bold 10px Arial';
  ctx.fillText('SIGNATURE', P+20, y+22);
  if (sigEl) {
    ctx.drawImage(sigEl, P+20, y+32, 280, 100);
  } else {
    ctx.fillStyle = '#b8dfc4'; ctx.font = '14px Arial';
    ctx.fillText('(no signature captured)', P+20, y+85);
  }
  y += sigBoxH + 18;

  // ── services ──
  const svcH = 28 + SERVICES.length * 36 + 16;
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#b8dfc4'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(P, y, W-P*2, svcH, 8);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#4a7a58'; ctx.font = 'bold 10px Arial';
  ctx.fillText('SERVICE RATES — PER CARD', P+20, y+20);
  let sy = y + 36;
  SERVICES.forEach(s => {
    ctx.fillStyle = '#0d2615'; ctx.font = '14px Arial';
    ctx.fillText(s.name + (s.note ? ` (${s.note})` : ''), P+20, sy);
    ctx.fillStyle = '#008922'; ctx.font = 'bold 15px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(s.price, W-P-20, sy);
    ctx.textAlign = 'left';
    sy += 36;
  });
  y += svcH + 18;

  // ── footer ──
  ctx.fillStyle = '#4a7a58'; ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Just Mint Card Care  •  justminttcg@gmail.com', W/2, y+18);
  ctx.fillText('Client has read and agreed to all terms of the Just Mint Card Care Service Agreement', W/2, y+36);
  ctx.textAlign = 'left';

  return canvas.toDataURL('image/png');
}

// ── Waiver overlay ────────────────────────────────────────────────────────────
function WaiverOverlay({ record, onClose }) {
  const [imgUrl,   setImgUrl]   = useState(null);
  const [building, setBuilding] = useState(false);

  async function handleSaveImage() {
    setBuilding(true);
    try {
      const url = await buildReceiptImage(record);
      setImgUrl(url);
    } catch(e) { alert('Could not generate image: ' + e.message); }
    setBuilding(false);
  }

  const signed = new Date(record.signedAt).toLocaleString('en-US', {
    year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit',
  });

  const S = {
    overlay:  { position:'fixed', inset:0, zIndex:9999, background:'#fff', overflowY:'auto', fontFamily:"Georgia,serif", color:'#0d2615' },
    inner:    { maxWidth:640, margin:'0 auto', padding:'20px 16px 48px' },
    bar:      { height:5, background:'linear-gradient(90deg,#008922,#206100)', borderRadius:3, marginBottom:20 },
    h1:       { fontSize:22, fontWeight:700, color:'#206100', margin:'0 0 3px' },
    sub:      { fontSize:11, color:'#4a7a58', letterSpacing:'.07em', textTransform:'uppercase', marginBottom:20 },
    card:     { border:'1px solid #b8dfc4', borderRadius:8, padding:14, marginBottom:14 },
    lbl:      { fontSize:10, fontWeight:700, letterSpacing:'.1em', color:'#4a7a58', textTransform:'uppercase', marginBottom:8 },
    row:      { display:'flex', justifyContent:'space-between', fontSize:14, padding:'6px 0', borderBottom:'.5px solid #b8dfc4' },
    sTitle:   { fontSize:13, fontWeight:700, color:'#206100', margin:'14px 0 4px' },
    sBody:    { fontSize:13, lineHeight:1.75, whiteSpace:'pre-wrap', margin:0, color:'#0d2615' },
    greenBtn: { width:'100%', padding:14, background:'#008922', color:'#fff', border:'none', borderRadius:8, fontSize:15, fontWeight:600, cursor:'pointer', marginBottom:10, fontFamily:'Georgia,serif' },
    outBtn:   { width:'100%', padding:12, background:'none', border:'1px solid #b8dfc4', borderRadius:8, fontSize:14, cursor:'pointer', color:'#4a7a58', fontFamily:'Georgia,serif', marginBottom:10 },
  };

  // Image preview screen
  if (imgUrl) return (
    <div style={S.overlay}>
      <div style={S.inner}>
        <div style={{ background:'#e6f5eb', border:'1px solid #b8dfc4', borderRadius:8, padding:14, marginBottom:16, fontSize:13, color:'#4a7a58', lineHeight:1.7 }}>
          <strong style={{color:'#206100'}}>📱 How to save:</strong><br/>
          <strong>iOS:</strong> Long-press the image → "Add to Photos" or "Save Image"<br/>
          <strong>Android:</strong> Long-press the image → "Download image" or "Save image"
        </div>
        <img src={imgUrl} alt="Signed waiver receipt"
          style={{ width:'100%', borderRadius:8, border:'1px solid #b8dfc4', display:'block', marginBottom:14 }} />
        <button onClick={() => setImgUrl(null)} style={S.outBtn}>← Back</button>
        <button onClick={onClose} style={S.outBtn}>✕ Close</button>
      </div>
    </div>
  );

  return (
    <div id="waiver-overlay" style={S.overlay}>
      <div style={S.inner}>
        <button onClick={handleSaveImage} disabled={building} style={{...S.greenBtn, opacity: building?0.7:1}}>
          {building ? 'Building image…' : '📷 Save as Image (tap to save to photos)'}
        </button>
        <button onClick={() => window.print()} style={{...S.greenBtn, background:'#206100'}}>📄 Print / Save as PDF</button>
        <button onClick={onClose} style={S.outBtn}>✕ Close</button>

        <div style={S.bar} />
        <div style={S.h1}>Just Mint Card Care</div>
        <div style={S.sub}>Signed Service Agreement &amp; Liability Waiver</div>

        <div style={S.card}>
          <div style={S.lbl}>Submission Details</div>
          <div style={{...S.row}}><span style={{color:'#4a7a58'}}>Client</span><strong>{record.name}</strong></div>
          <div style={{...S.row}}><span style={{color:'#4a7a58'}}>Signed</span><span>{signed}</span></div>
          {record.notes && <div style={{...S.row,borderBottom:'none'}}><span style={{color:'#4a7a58'}}>Notes</span><span>{record.notes}</span></div>}
          {record.sig && (
            <div style={{marginTop:10}}>
              <div style={S.lbl}>Signature</div>
              <img src={record.sig} alt="sig" style={{maxWidth:220, height:56, objectFit:'contain', border:'1px solid #b8dfc4', borderRadius:6, padding:3, display:'block'}} />
            </div>
          )}
        </div>

        <div style={S.card}>
          <div style={S.lbl}>Service Rates — Per Card</div>
          {SERVICES.map((s,i) => (
            <div key={s.name} style={{...S.row, borderBottom: i<SERVICES.length-1 ? '.5px solid #b8dfc4' : 'none'}}>
              <span>{s.name}{s.note && <span style={{fontSize:11,color:'#4a7a58'}}> ({s.note})</span>}</span>
              <span style={{fontWeight:700,color:'#008922'}}>{s.price}</span>
            </div>
          ))}
        </div>

        <div style={S.card}>
          <div style={S.lbl}>Full Agreement</div>
          {SECTIONS.map(([title, body], i) => (
            <div key={i}>
              <div style={S.sTitle}>{title}</div>
              <div style={S.sBody}>{body}</div>
            </div>
          ))}
        </div>

        <div style={{textAlign:'center', fontSize:12, color:'#4a7a58', marginTop:20, lineHeight:1.8}}>
          Just Mint Card Care &nbsp;•&nbsp; justminttcg@gmail.com
        </div>

        <div style={{marginTop:20}}>
          <button onClick={onClose} style={S.outBtn}>✕ Close and go back</button>
        </div>
      </div>
    </div>
  );
}

// ── Signature canvas ──────────────────────────────────────────────────────────
function SigPad({ onChange }) {
  const canvas  = useRef(null);
  const drawing = useRef(false);
  const last    = useRef({ x: 0, y: 0 });
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const ctx = canvas.current.getContext('2d');
    Object.assign(ctx, { strokeStyle: C.text, lineWidth: 2, lineCap: 'round', lineJoin: 'round' });
  }, []);

  function pt(e) {
    const r = canvas.current.getBoundingClientRect();
    const s = e.touches ? e.touches[0] : e;
    return { x: (s.clientX - r.left) * canvas.current.width  / r.width,
             y: (s.clientY - r.top)  * canvas.current.height / r.height };
  }

  function onDown(e) { e.preventDefault(); drawing.current = true; last.current = pt(e); }
  function onMove(e) {
    e.preventDefault();
    if (!drawing.current) return;
    const p = pt(e), ctx = canvas.current.getContext('2d');
    ctx.beginPath(); ctx.moveTo(last.current.x, last.current.y); ctx.lineTo(p.x, p.y); ctx.stroke();
    last.current = p;
    if (!drawn) setDrawn(true);
    onChange(canvas.current.toDataURL());
  }
  function onUp(e) { e?.preventDefault(); drawing.current = false; }

  function clear() {
    canvas.current.getContext('2d').clearRect(0, 0, canvas.current.width, canvas.current.height);
    setDrawn(false);
    onChange(null);
  }

  return (
    <>
      <canvas ref={canvas} width={560} height={150} onMouseDown={onDown} onMouseMove={onMove}
        onMouseUp={onUp} onMouseLeave={onUp} onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}
        style={{ width:'100%', height:140, display:'block', touchAction:'none', cursor:'crosshair',
          borderRadius:8, border:`1.5px solid ${drawn ? C.green : C.border}`,
          background: drawn ? '#f0faf3' : C.white }} />
      {drawn && (
        <button onClick={clear}
          style={{ background:'none', border:'none', color:C.muted, fontSize:12, cursor:'pointer', padding:'5px 0', textDecoration:'underline' }}>
          Clear &amp; redraw
        </button>
      )}
    </>
  );
}

// ── Shared UI primitives ──────────────────────────────────────────────────────
const input = { width:'100%', padding:'10px 12px', fontSize:15, fontFamily:'Georgia,serif',
  background:'#F4FBF6', color:'#0d2615', borderRadius:8, boxSizing:'border-box',
  outline:'none', WebkitAppearance:'none' };

function Wrap({ step, children }) {
  return (
    <div style={{ maxWidth:600, margin:'0 auto', minHeight:'100vh', background:C.bg, fontFamily:'Georgia,serif', paddingBottom:48 }}>
      <div style={{ height:4, background:`linear-gradient(90deg,${C.green},${C.dark})` }} />
      <div style={{ textAlign:'center', padding:'22px 16px 18px' }}>
        <div style={{ fontSize:20, fontWeight:700, color:C.dark }}>Just Mint Card Care</div>
        <div style={{ fontSize:11, color:C.muted, marginTop:3, letterSpacing:'.06em', textTransform:'uppercase' }}>
          Service Agreement &amp; Liability Waiver
        </div>
        <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:12 }}>
          {[1,2,3].map(n => (
            <div key={n} style={{ height:8, borderRadius:4, transition:'all .2s',
              width: n===step ? 24 : 8, background: n<=step ? C.green : C.border }} />
          ))}
        </div>
      </div>
      <div style={{ padding:'0 16px' }}>{children}</div>
    </div>
  );
}

function Box({ children, onClick, fade }) {
  return (
    <div onClick={onClick} style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12,
      padding:18, marginBottom:14, cursor:onClick?'pointer':'default', opacity:fade?0.4:1, transition:'opacity .2s' }}>
      {children}
    </div>
  );
}

function Cap({ children }) {
  return <div style={{ fontSize:10, fontWeight:700, letterSpacing:'.1em', color:C.muted, textTransform:'uppercase', marginBottom:10 }}>{children}</div>;
}

function Btn({ children, onClick, disabled, outline }) {
  return (
    <button onClick={onClick} disabled={disabled} type="button" style={{
      width:'100%', padding:15, fontSize:15, fontWeight:600, borderRadius:10, cursor: disabled?'not-allowed':'pointer',
      border: outline ? `1.5px solid ${C.green}` : 'none',
      background: outline ? 'transparent' : disabled ? C.muted : C.green,
      color: outline ? C.green : '#fff', marginBottom: outline ? 0 : undefined,
    }}>
      {children}
    </button>
  );
}

// ── Step 1: Review ────────────────────────────────────────────────────────────
function Review({ onNext }) {
  return (
    <>
      <Box>
        <Cap>Service Rates — Per Card</Cap>
        {SERVICES.map((s, i) => (
          <div key={s.name} style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline',
            padding:'8px 0', borderBottom: i<SERVICES.length-1 ? `.5px solid ${C.border}` : 'none' }}>
            <span style={{ fontSize:14 }}>
              {s.name}{s.note && <span style={{ fontSize:11, color:C.muted, marginLeft:5 }}>({s.note})</span>}
            </span>
            <span style={{ fontSize:15, fontWeight:700, color:C.green }}>{s.price}</span>
          </div>
        ))}
      </Box>

      <Box>
        <Cap>Agreement Terms — Please Read Carefully</Cap>
        {SECTIONS.map(([title, body], i) => (
          <div key={i} style={{ marginBottom: i<SECTIONS.length-1 ? 16 : 0 }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.dark, marginBottom:4 }}>{title}</div>
            <div style={{ fontSize:13, color:C.text, lineHeight:1.75, whiteSpace:'pre-line' }}>{body}</div>
          </div>
        ))}
      </Box>

      <Btn onClick={onNext}>I Have Read the Terms — Continue to Sign →</Btn>
    </>
  );
}

// ── Step 2: Sign ──────────────────────────────────────────────────────────────
function Sign({ onBack, onDone }) {
  const [name,   setName]   = useState('');
  const [notes,  setNotes]  = useState('');
  const [sig,    setSig]    = useState('');   // dataURL string
  const [agreed, setAgreed] = useState(false);
  const [errs,   setErrs]   = useState({});

  function submit() {
    const e = {};
    if (name.trim().length < 2) e.name   = 'Please enter your full name.';
    if (!sig)                    e.sig    = 'Please draw your signature.';
    if (!agreed)                 e.agreed = 'Please check the box to agree.';
    if (Object.keys(e).length) { setErrs(e); return; }

    const record = { name: name.trim(), notes: notes.trim() || null,
      signedAt: new Date().toISOString(), sig: sig || null };
    onDone(record);
  }

  const err = (k) => errs[k] && (
    <div style={{ color:'#b91c1c', fontSize:12, marginTop:5 }}>{errs[k]}</div>
  );

  return (
    <>
      <button onClick={onBack} type="button"
        style={{ background:'none', border:'none', color:C.muted, fontSize:13, cursor:'pointer', padding:'0 0 12px' }}>
        ← Back
      </button>

      <Box>
        <Cap>Full Name *</Cap>
        <input value={name} placeholder="Your full legal name" onChange={e => { setName(e.target.value); setErrs(p=>({...p,name:null})); }}
          style={{ ...input, border:`1.5px solid ${errs.name ? '#b91c1c' : C.border}` }} />
        {err('name')}
      </Box>

      <Box>
        <Cap>Optional Notes</Cap>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
          placeholder="Special instructions, card details..."
          style={{ ...input, border:`1.5px solid ${C.border}`, resize:'vertical', lineHeight:1.6 }} />
      </Box>

      <Box>
        <Cap>Signature *</Cap>
        <p style={{ fontSize:12, color:C.muted, margin:'0 0 8px' }}>Draw using your finger or mouse.</p>
        <SigPad onChange={c => { setSig(c); if (c) { setErrs(p=>({...p,sig:null})); } else { setAgreed(false); } }} />
        {err('sig')}
      </Box>

      <Box onClick={sig ? () => { setAgreed(a=>!a); setErrs(p=>({...p,agreed:null})); } : null} fade={!sig}>
        <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
          <div style={{ width:20, height:20, minWidth:20, borderRadius:5, marginTop:2, flexShrink:0,
            border:`2px solid ${errs.agreed ? '#b91c1c' : agreed ? C.green : C.border}`,
            background: agreed ? C.green : C.white,
            display:'flex', alignItems:'center', justifyContent:'center',
            cursor: sig ? 'pointer' : 'not-allowed' }}>
            {agreed && <span style={{ color:'#fff', fontSize:12, fontWeight:700 }}>✓</span>}
          </div>
          <div>
            <p style={{ fontSize:13, color:C.text, lineHeight:1.7, margin:0 }}>
              I have read and agree to the <strong>Just Mint Card Care Service Agreement &amp; Liability Waiver</strong>.
            </p>
            {!sig && <p style={{ fontSize:11, color:C.muted, margin:'5px 0 0', fontStyle:'italic' }}>Draw your signature to unlock.</p>}
          </div>
        </div>
        {err('agreed')}
      </Box>


      <div style={{ fontSize:12, color:C.muted, textAlign:'center', marginBottom:10 }}>
        {new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}
      </div>
      <Btn onClick={submit}>Sign &amp; Download Agreement</Btn>
    </>
  );
}

// ── Step 3: Done ──────────────────────────────────────────────────────────────
function Done({ record }) {
  const [showOverlay, setShowOverlay] = useState(false);
  const signed = new Date(record.signedAt).toLocaleString('en-US', {
    year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit',
  });

  if (showOverlay) return <WaiverOverlay record={record} onClose={() => setShowOverlay(false)} />;

  return (
    <div style={{ textAlign:'center' }}>
      <div style={{ width:68, height:68, borderRadius:'50%', background:C.green,
        display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px' }}>
        <span style={{ color:'#fff', fontSize:30 }}>✓</span>
      </div>
      <div style={{ fontSize:22, fontWeight:700, color:C.dark, marginBottom:6 }}>Agreement Signed</div>
      <div style={{ fontSize:14, color:C.muted, marginBottom:24, lineHeight:1.6 }}>
        Thank you, <strong>{record.name}</strong>.
      </div>

      <Box style={{ textAlign:'left' }}>
        <Cap>Confirmation</Cap>
        {[['Client', record.name], ['Signed', signed], ...(record.notes ? [['Notes', record.notes]] : [])].map(([l,v]) => (
          <div key={l} style={{ display:'flex', justifyContent:'space-between', fontSize:14, padding:'7px 0', borderBottom:`.5px solid ${C.border}` }}>
            <span style={{ color:C.muted, marginRight:12, flexShrink:0 }}>{l}</span>
            <span style={{ fontWeight:600, textAlign:'right' }}>{v}</span>
          </div>
        ))}
        {record.sig && (
          <div style={{ marginTop:12 }}>
            <Cap>Signature on file</Cap>
            <img src={record.sig} alt="sig" style={{ maxWidth:200, height:50, objectFit:'contain', border:`1px solid ${C.border}`, borderRadius:6, padding:3 }} />
          </div>
        )}
      </Box>

      <button onClick={() => setShowOverlay(true)} type="button"
        style={{ width:'100%', background:C.green, color:'#fff', border:'none', borderRadius:10,
          padding:15, fontSize:15, fontWeight:600, cursor:'pointer', marginBottom:14 }}>
        📄 View &amp; Save Signed Waiver
      </button>

      <div style={{ fontSize:13, color:C.muted, lineHeight:1.8 }}>
        Questions? <a href="mailto:justminttcg@gmail.com" style={{ color:C.green }}>justminttcg@gmail.com</a>
      </div>
    </div>
  );
}

// ── Error boundary ────────────────────────────────────────────────────────────
import { Component } from "react";
class Boundary extends Component {
  state = { err: null };
  static getDerivedStateFromError(e) { return { err: e.message || 'Unknown error' }; }
  render() {
    if (this.state.err) return (
      <div style={{ padding:32, fontFamily:'Georgia,serif', color:'#0d2615', background:'#F4FBF6', minHeight:'100vh' }}>
        <div style={{ height:4, background:'linear-gradient(90deg,#008922,#206100)', marginBottom:24 }} />
        <div style={{ fontSize:18, fontWeight:700, color:'#206100', marginBottom:8 }}>Something went wrong</div>
        <div style={{ fontSize:13, color:'#4a7a58', marginBottom:20 }}>{this.state.err}</div>
        <button onClick={() => this.setState({ err: null })}
          style={{ background:'#008922', color:'#fff', border:'none', borderRadius:8, padding:'10px 20px', fontSize:14, cursor:'pointer' }}>
          Try again
        </button>
      </div>
    );
    return this.props.children;
  }
}

// ── Root ──────────────────────────────────────────────────────────────────────
function Main() {
  const [step,   setStep]   = useState(1);
  const [record, setRecord] = useState(null);
  return (
    <Wrap step={step}>
      {step === 1 && <Review onNext={() => setStep(2)} />}
      {step === 2 && <Sign   onBack={() => setStep(1)} onDone={r => { setRecord(r); setStep(3); }} />}
      {step === 3 && <Done   record={record} />}
    </Wrap>
  );
}

export default function App() {
  return <Boundary><Main /></Boundary>;
}
