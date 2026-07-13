import { useState, useRef, useEffect, Component } from 'react'

const C = {
  green: '#008922', dark: '#206100', bg: '#F4FBF6',
  white: '#ffffff', border: '#b8dfc4', text: '#0d2615', muted: '#4a7a58',
}

const SERVICES = [
  { name: 'Clean + Polish',                price: '$8'  },
  { name: 'Edge & Corner Lift Correction', price: '$30', note: 'includes Clean + Polish' },
  { name: 'Dent Correction',               price: '$40', note: 'includes Clean + Polish' },
  { name: 'Crease Correction',             price: '$50', note: 'includes Clean + Polish' },
]

const SECTIONS = [
  ['Preamble',
   `This Service Agreement (the "Agreement") is entered into between Just Mint Card Care (the "Service Provider") and the Customer identified in the Submission Details of this Agreement (the "Customer"), effective as of the date the Customer accepts these terms as described in Section 18.`],

  ['1. Services and Scope',
   `The Service Provider agrees to perform the repair and restoration services described in the Quote Dated ___ (the "Services") on the trading card(s) identified therein (the "Card(s)").`],

  ['2. Acknowledgment of Risk',
   `The Customer acknowledges and understands that card repair and restoration involve specialized techniques and processes that carry inherent risks, including but not limited to:

- Minor alterations in texture, gloss, or coloration
- Changes in surface integrity, including additional whitening or increased visibility of existing defects
- Unforeseen reactions to materials, treatments, heat, pressure, hydration, cleaning processes, or environmental factors
- The possibility that certain defects cannot be fully repaired and may remain visible
- The possibility that the Card(s) may be left in a condition equal to or worse than their condition on arrival

The Customer understands and agrees that while the Service Provider will exercise reasonable care and professional judgment, no specific outcome is guaranteed, and some changes may be permanent or irreversible.`],

  ['3. Assumption of Risk and Limitation of Liability',
   `The Customer knowingly and voluntarily assumes all risks associated with the repair and restoration process.

To the fullest extent permitted by applicable law, the Service Provider shall not be liable for any actual or perceived loss in value, condition change, or damage arising during or after the restoration process, including but not limited to:

- Fading, color shifts, whitening, gloss variation, or surface changes
- Creases, dents, impressions, or imperfections that may not be fully removable or that may become more apparent
- Any impact on the Card's eligibility for grading, authentication, encapsulation, or resale

Liability Cap. To the fullest extent permitted by applicable law, the Service Provider's total aggregate liability arising out of or relating to this Agreement shall not exceed the total fees paid by the Customer for the Services.

Nothing in this Agreement limits liability that cannot be limited under applicable law, including liability for gross negligence, willful misconduct, or fraud.`],

  ['4. No Guarantee of Grading or Value',
   `The Service Provider makes no representations or warranties regarding:

- The outcome of grading or authentication by third-party companies, including but not limited to PSA, Beckett (BGS), CGC, SGC, or similar entities
- Whether a Card will or will not be flagged as altered, restored, or otherwise ineligible for numeric grading
- The market value, resale value, or collectability of any Card following restoration

All grading determinations and valuations are made solely by independent third parties and are entirely outside the Service Provider's control.`],

  ['5. Custody of Property',
   `The Service Provider will exercise reasonable care in safeguarding the Customer's Card(s) while they are in the Service Provider's possession. However, the Customer acknowledges and agrees that the Service Provider is not an insurer of the Card(s).

Except to the extent caused by the Service Provider's gross negligence, willful misconduct, or fraud, the Service Provider shall not be liable for any loss, theft, burglary, fire, vandalism, natural disaster, or other event beyond the Service Provider's reasonable control while the Card(s) are in the Service Provider's care, custody, or control.

The Customer acknowledges that collectible trading cards may possess substantial monetary or sentimental value, and assumes the risk of loss arising from such events beyond the Service Provider's reasonable control. The Customer is encouraged to maintain or obtain appropriate insurance coverage for valuable Card(s).`],

  ['6. Pre-Existing Conditions and Hidden Defects',
   `The Customer acknowledges that collectible trading cards may contain pre-existing damage, hidden defects, prior restoration, manufacturing irregularities, contamination, or other conditions that are not visible or reasonably discoverable before restoration begins.

The Customer understands and agrees that such conditions may affect the restoration process or become apparent only after treatment has commenced. The Service Provider shall not be responsible for adverse outcomes resulting from pre-existing or concealed conditions that could not reasonably have been identified prior to performing the authorized Services.`],

  ['7. Authorization for Restoration Methods',
   `The Customer authorizes the Service Provider to perform the Services using the Service Provider's professional judgment, experience, and customary restoration techniques, including the selection of materials, tools, processes, heat, pressure, hydration, cleaning, or other restoration methods the Service Provider reasonably determines are appropriate.

The Customer acknowledges that individual cards may respond differently to restoration techniques, and that the Service Provider may modify or discontinue a treatment if, in the Service Provider's professional judgment, doing so is appropriate to help preserve the condition of the Card.

If the Service Provider determines that a material change in the scope of the Services is necessary, or wishes to perform services substantially different from those originally authorized, the Service Provider will obtain the Customer's written approval before proceeding — unless immediate action is reasonably necessary to prevent further damage to the Card.`],

  ['8. Payment, Possession, and Unclaimed Property (Minnesota — No Address Collection)',
   `Payment. Payment for all Services is due in full within fourteen (14) calendar days of the Customer being notified that the Services are complete.

Possession Pending Payment. The Service Provider shall retain possession of the Card(s) until payment is received in full. The Customer acknowledges the Service Provider's right to do so, and the Service Provider may exercise any rights and remedies available under applicable law if payment is not timely received.

No Lien Sale or Disposal Rights. The Customer understands and agrees that, under Minnesota law, the Service Provider does not have authority to sell, auction, transfer, or dispose of the Card(s) to satisfy unpaid fees. Minnesota's artisan‑lien and repair‑lien statutes do not apply to trading cards or other collectibles. Nothing in this Agreement shall be interpreted as granting the Service Provider ownership or disposal rights over the Card(s).

No Physical Address Collected. The Customer acknowledges that the Service Provider does not collect physical mailing addresses. All notices, including retrieval notices, will be sent exclusively by email to the Customer's provided email address.

Unclaimed Property, Long‑Term Retention, and Storage Fees (Minnesota‑Compliant)

If the Customer fails to pay or retrieve the Card(s) within ninety (90) days after the completion notice is sent by email, the Card(s) will be placed into secure storage. The following storage‑fee schedule will apply:

Base Storage Period (Day 91–Day 180)
- $15 per month — Covers secure storage, climate control, and continued safekeeping.

Extended Storage Period (Day 181–Day 365)
- $25 per month — Reflects increased long‑term storage burden and administrative tracking.

Long‑Term Storage (Beyond 365 Days)
- $35 per month — Applies until the Customer retrieves the Card(s). The Service Provider may send periodic email reminders requesting retrieval.

Billing Method
- Storage fees accrue monthly.
- Fees must be paid in full before the Card(s) are released.
- Partial months are prorated.

Notice Method. Because the Service Provider does not collect physical mailing addresses, all notices — including the 90‑day retrieval notice — will be sent exclusively by email to the Customer's provided email address.

No Abandonment or Transfer to the State. The Customer acknowledges that Minnesota's unclaimed‑property statutes apply only to intangible property (e.g., money, credits). Physical items such as trading cards cannot be transferred to the State of Minnesota as unclaimed property and cannot be treated as abandoned under Minnesota Statutes Chapter 345.

Continued Custody. The Card(s) will remain in the Service Provider's custody until retrieved by the Customer. The Customer remains responsible for all outstanding fees, including storage fees, and for arranging prompt pickup.

Long‑Term Non‑Retrieval. If the Customer fails to retrieve the Card(s) for an extended period (e.g., twelve months or more), the Service Provider may request updated instructions via email. However, unless Minnesota law changes or a court order is obtained, the Service Provider may not sell, dispose of, or claim ownership of the Card(s).`],

  ['9. Cancellation and Refunds',
   `The Customer may cancel the Services at any time before work begins by written notice, and the Card(s) will be returned.

Once work has commenced, no refunds will be issued for services already performed. The Service Provider may cancel and return the Card(s) at any time for any reason, refunding any unearned fees.

If a card cannot be serviced for any reason on the Service Provider's end (e.g., the card is determined to be counterfeit, or the Service Provider cannot safely complete the work), the service fee for that card will be refunded in full.

If the agreed scope changes due to hidden damage and no revised agreement is reached, the portion of work not performed will be refunded.`],

  ['10. Release of Claims',
   `By submitting Card(s) for repair or restoration, the Customer releases and discharges the Service Provider from claims arising out of or related to the inherent risks of authorized restoration services, except to the extent caused by the Service Provider's gross negligence, willful misconduct, or fraud.`],

  ['11. Customer Ownership, Authority, and Disclosure Obligations',
   `Ownership. The Customer represents and warrants that they are the lawful owner of the Card(s) submitted, or that they have full legal authority from the owner to authorize the requested Services. The Service Provider shall not be responsible for disputes regarding ownership or authorization of submitted Card(s).

Disclosure. The Customer acknowledges that the Card(s) will have been restored, and agrees that any subsequent sale, trade, consignment, or submission for grading of the Card(s) is the Customer's sole responsibility to disclose accurately in accordance with applicable law and the policies of any third-party grading or authentication service.

The Service Provider does not authorize, and expressly disclaims any participation in, the misrepresentation of restored Card(s) as unrestored. The Customer agrees to indemnify and hold harmless the Service Provider from any claim arising out of the Customer's failure to disclose restoration.`],

  ['12. Good-Faith Customer Care',
   `While this Agreement limits liability, Just Mint Card Care values transparency and customer satisfaction. Any concerns should be communicated promptly to justminttcg@gmail.com, and the Service Provider may, at its sole discretion, elect to address issues as a customer service courtesy. Nothing in this Agreement shall be interpreted as an obligation to provide refunds, replacements, or compensation.`],

  ['13. Photography and Documentation',
   `The Service Provider may photograph or record the Card(s) before, during, and after the Services for documentation, quality control, and portfolio, educational, or promotional purposes.

Unless the Customer objects in writing before work begins, the Customer grants the Service Provider a non-exclusive, royalty-free license to use such images and recordings. Personally identifying information will be excluded; the Customer will not be identified by name without separate written consent.`],

  ['14. Electronic Acceptance and Communications',
   `The Customer acknowledges and agrees that this Agreement may be delivered, accepted, and executed electronically.

- Agreement to these terms may be confirmed by email response or other written electronic communication indicating acceptance.
- Such electronic acceptance shall be deemed legally binding and equivalent to a handwritten signature.
- No physical signature is required for this Agreement to be valid and enforceable.`],

  ['15. Governing Law, Venue, and Dispute Resolution',
   `This Agreement shall be governed by and construed in accordance with the laws of the State of Minnesota, without regard to conflict-of-law principles.

Any dispute arising out of or relating to this Agreement or the Services shall be brought exclusively in the appropriate courts of Hennepin County, Minnesota, and the Customer consents to such jurisdiction and venue.`],

  ['16. Severability',
   `If any provision of this Agreement is determined by a court of competent jurisdiction to be invalid, illegal, or unenforceable, that provision shall be enforced to the maximum extent permitted by law, and the remaining provisions shall remain in full force and effect.`],

  ['17. Entire Agreement',
   `This Agreement constitutes the entire understanding between the Customer and the Service Provider with respect to the Services. It supersedes all prior or contemporaneous discussions, representations, understandings, negotiations, and agreements, whether oral or written, relating to the subject matter of this Agreement.

No amendment, modification, or waiver of any provision shall be effective unless made in writing and agreed to by both parties.`],

  ['18. Acceptance of Agreement',
   `By replying to the accompanying email, checking the acceptance box on the Service Provider's intake form, or otherwise submitting Card(s) for repair or restoration services, the Customer affirms that they have read, understood, and voluntarily agreed to the terms of this Agreement in full.`],
];

// ── Signature pad ─────────────────────────────────────────────────────────────
function SigPad({ onChange }) {
  const canvas  = useRef(null)
  const drawing = useRef(false)
  const last    = useRef({ x: 0, y: 0 })
  const [drawn, setDrawn] = useState(false)

  useEffect(() => {
    const ctx = canvas.current.getContext('2d')
    Object.assign(ctx, { strokeStyle: C.text, lineWidth: 2, lineCap: 'round', lineJoin: 'round' })
  }, [])

  function pt(e) {
    const r = canvas.current.getBoundingClientRect()
    const s = e.touches ? e.touches[0] : e
    return { x: (s.clientX - r.left) * canvas.current.width  / r.width,
             y: (s.clientY - r.top)  * canvas.current.height / r.height }
  }

  function onDown(e) { e.preventDefault(); drawing.current = true; last.current = pt(e) }
  function onMove(e) {
    e.preventDefault()
    if (!drawing.current) return
    const p = pt(e), ctx = canvas.current.getContext('2d')
    ctx.beginPath(); ctx.moveTo(last.current.x, last.current.y); ctx.lineTo(p.x, p.y); ctx.stroke()
    last.current = p
    if (!drawn) setDrawn(true)
    onChange(canvas.current.toDataURL())
  }
  function onUp(e) { e?.preventDefault(); drawing.current = false }

  function clear() {
    canvas.current.getContext('2d').clearRect(0, 0, canvas.current.width, canvas.current.height)
    setDrawn(false)
    onChange(null)
  }

  return (
    <>
      <canvas ref={canvas} width={560} height={150}
        onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
        onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}
        style={{ width: '100%', height: 140, display: 'block', touchAction: 'none', cursor: 'crosshair',
          borderRadius: 8, border: `1.5px solid ${drawn ? C.green : C.border}`,
          background: drawn ? '#f0faf3' : C.white }} />
      {drawn && (
        <button onClick={clear} type="button"
          style={{ background: 'none', border: 'none', color: C.muted, fontSize: 12, cursor: 'pointer', padding: '5px 0', textDecoration: 'underline' }}>
          Clear &amp; redraw
        </button>
      )}
    </>
  )
}

// ── Shared UI ─────────────────────────────────────────────────────────────────
const inputStyle = {
  width: '100%', padding: '10px 12px', fontSize: 15, fontFamily: 'Georgia,serif',
  background: C.bg, color: C.text, borderRadius: 8, boxSizing: 'border-box',
  outline: 'none', WebkitAppearance: 'none',
}

function Wrap({ step, children }) {
  return (
    <div style={{ maxWidth: 600, margin: '0 auto', minHeight: '100vh', background: C.bg, fontFamily: 'Georgia,serif', paddingBottom: 48 }}>
      <div style={{ height: 4, background: `linear-gradient(90deg,${C.green},${C.dark})` }} />
      <div style={{ textAlign: 'center', padding: '22px 16px 18px' }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: C.dark }}>Just Mint Card Care</div>
        <div style={{ fontSize: 11, color: C.muted, marginTop: 3, letterSpacing: '.06em', textTransform: 'uppercase' }}>
          Service Agreement &amp; Liability Waiver
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
          {[1,2,3].map(n => (
            <div key={n} style={{ height: 8, borderRadius: 4, transition: 'all .2s',
              width: n === step ? 24 : 8, background: n <= step ? C.green : C.border }} />
          ))}
        </div>
      </div>
      <div style={{ padding: '0 16px' }}>{children}</div>
    </div>
  )
}

function Box({ children, onClick, fade, style = {} }) {
  return (
    <div onClick={onClick} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12,
      padding: 18, marginBottom: 14, cursor: onClick ? 'pointer' : 'default',
      opacity: fade ? 0.4 : 1, transition: 'opacity .2s', ...style }}>
      {children}
    </div>
  )
}

function Cap({ children }) {
  return <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', color: C.muted, textTransform: 'uppercase', marginBottom: 10 }}>{children}</div>
}

function Btn({ children, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} type="button" style={{
      width: '100%', padding: 15, fontSize: 15, fontWeight: 600, borderRadius: 10,
      border: 'none', background: disabled ? C.muted : C.green, color: '#fff',
      cursor: disabled ? 'not-allowed' : 'pointer',
    }}>
      {children}
    </button>
  )
}

// ── Step 1: Review ────────────────────────────────────────────────────────────
function Review({ onNext }) {
  return (
    <>
      <Box>
        <Cap>Service Rates — Per Card</Cap>
        {SERVICES.map((s, i) => (
          <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            padding: '8px 0', borderBottom: i < SERVICES.length - 1 ? `.5px solid ${C.border}` : 'none' }}>
            <span style={{ fontSize: 14 }}>
              {s.name}{s.note && <span style={{ fontSize: 11, color: C.muted, marginLeft: 5 }}>({s.note})</span>}
            </span>
            <span style={{ fontSize: 15, fontWeight: 700, color: C.green }}>{s.price}</span>
          </div>
        ))}
      </Box>

      <Box>
        <Cap>Agreement Terms — Please Read Carefully</Cap>
        {SECTIONS.map(([title, body], i) => (
          <div key={i} style={{ marginBottom: i < SECTIONS.length - 1 ? 16 : 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.dark, marginBottom: 4 }}>{title}</div>
            <div style={{ fontSize: 13, color: C.text, lineHeight: 1.75, whiteSpace: 'pre-line' }}>{body}</div>
          </div>
        ))}
      </Box>

      <Btn onClick={onNext}>I Have Read the Terms — Continue to Sign →</Btn>
    </>
  )
}

// ── Step 2: Sign ──────────────────────────────────────────────────────────────
function Sign({ onBack, onDone }) {
  const [name,     setName]     = useState('')
  const [notes,    setNotes]    = useState('')
  const [sig,      setSig]      = useState(null)
  const [agreed,   setAgreed]   = useState(false)
  const [errs,     setErrs]     = useState({})
  const [sending,  setSending]  = useState(false)
  const [apiError, setApiError] = useState(null)

  function err(k) {
    return errs[k] ? <div style={{ color: '#b91c1c', fontSize: 12, marginTop: 5 }}>{errs[k]}</div> : null
  }

  async function submit() {
    const e = {}
    if (name.trim().length < 2) e.name   = 'Please enter your full name.'
    if (!sig)                    e.sig    = 'Please draw your signature.'
    if (!agreed)                 e.agreed = 'Please check the box to agree.'
    if (Object.keys(e).length) { setErrs(e); return }

    setSending(true)
    setApiError(null)

    const record = {
      clientName: name.trim(),
      notes:      notes.trim() || null,
      signedAt:   new Date().toISOString(),
      sigDataUrl: sig,
    }

    try {
      const res = await fetch('/api/send-waiver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Server error (${res.status})`)
      }
      onDone(record)
    } catch (err) {
      setApiError(err.message)
      setSending(false)
    }
  }

  return (
    <>
      <button onClick={onBack} type="button"
        style={{ background: 'none', border: 'none', color: C.muted, fontSize: 13, cursor: 'pointer', padding: '0 0 12px' }}>
        ← Back
      </button>

      <Box>
        <Cap>Full Name *</Cap>
        <input value={name} placeholder="Your full legal name"
          onChange={e => { setName(e.target.value); setErrs(p => ({ ...p, name: null })) }}
          style={{ ...inputStyle, border: `1.5px solid ${errs.name ? '#b91c1c' : C.border}` }} />
        {err('name')}
      </Box>

      <Box>
        <Cap>Optional Notes</Cap>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
          placeholder="Special instructions, card details..."
          style={{ ...inputStyle, border: `1.5px solid ${C.border}`, resize: 'vertical', lineHeight: 1.6 }} />
      </Box>

      <Box>
        <Cap>Signature *</Cap>
        <p style={{ fontSize: 12, color: C.muted, margin: '0 0 8px' }}>Draw using your finger or mouse.</p>
        <SigPad onChange={c => { setSig(c); if (c) setErrs(p => ({ ...p, sig: null })); else setAgreed(false) }} />
        {err('sig')}
      </Box>

      <Box onClick={sig ? () => { setAgreed(a => !a); setErrs(p => ({ ...p, agreed: null })) } : null} fade={!sig}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ width: 20, height: 20, minWidth: 20, borderRadius: 5, marginTop: 2, flexShrink: 0,
            border: `2px solid ${errs.agreed ? '#b91c1c' : agreed ? C.green : C.border}`,
            background: agreed ? C.green : C.white,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: sig ? 'pointer' : 'not-allowed' }}>
            {agreed && <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>✓</span>}
          </div>
          <div>
            <p style={{ fontSize: 13, color: C.text, lineHeight: 1.7, margin: 0 }}>
              I have read and agree to the <strong>Just Mint Card Care Service Agreement &amp; Liability Waiver</strong>.
            </p>
            {!sig && <p style={{ fontSize: 11, color: C.muted, margin: '5px 0 0', fontStyle: 'italic' }}>Draw your signature to unlock.</p>}
          </div>
        </div>
        {err('agreed')}
      </Box>

      {apiError && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8,
          padding: 12, marginBottom: 14, fontSize: 13, color: '#b91c1c' }}>
          ⚠️ {apiError}
        </div>
      )}

      <div style={{ fontSize: 12, color: C.muted, textAlign: 'center', marginBottom: 10 }}>
        {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </div>

      <Btn onClick={submit} disabled={sending}>
        {sending ? 'Submitting…' : 'Sign & Submit Agreement'}
      </Btn>
    </>
  )
}

// ── Step 3: Done ──────────────────────────────────────────────────────────────
// ── Step 3: Done ──────────────────────────────────────────────────────────────
function Done({ record, onReset }) {
  const signed = new Date(record.signedAt).toLocaleString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: 68, height: 68, borderRadius: '50%', background: C.green,
        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
        <span style={{ color: '#fff', fontSize: 30 }}>✓</span>
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: C.dark, marginBottom: 6 }}>Agreement Signed</div>
      <div style={{ fontSize: 14, color: C.muted, marginBottom: 24, lineHeight: 1.6 }}>
        Thank you, <strong>{record.clientName}</strong>.<br />
        A signed PDF copy has been sent to Just Mint Card Care.
      </div>

      <Box style={{ textAlign: 'left' }}>
        <Cap>Confirmation</Cap>
        {[
          ['Client', record.clientName],
          ['Signed', signed],
          ...(record.notes ? [['Notes', record.notes]] : []),
        ].map(([l, v]) => (
          <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14,
            padding: '7px 0', borderBottom: `.5px solid ${C.border}` }}>
            <span style={{ color: C.muted, marginRight: 12, flexShrink: 0 }}>{l}</span>
            <span style={{ fontWeight: 600, textAlign: 'right' }}>{v}</span>
          </div>
        ))}
        {record.sigDataUrl && (
          <div style={{ marginTop: 12 }}>
            <Cap>Signature on file</Cap>
            <img src={record.sigDataUrl} alt="sig"
              style={{ maxWidth: 200, height: 50, objectFit: 'contain', border: `1px solid ${C.border}`, borderRadius: 6, padding: 3 }} />
          </div>
        )}
      </Box>

      <button onClick={onReset} type="button"
        style={{ width: '100%', padding: 15, fontSize: 15, fontWeight: 600, borderRadius: 10,
          border: `1.5px solid ${C.green}`, background: 'transparent', color: C.green,
          cursor: 'pointer', marginBottom: 14 }}>
        Submit Another Waiver
      </button>

      <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.8 }}>
        Just Mint Card Care will reach out when your order is ready.<br />
        Questions? <a href="mailto:justminttcg@gmail.com" style={{ color: C.green }}>justminttcg@gmail.com</a>
      </div>
    </div>
  )
}

// ── Error boundary ────────────────────────────────────────────────────────────
class Boundary extends Component {
  state = { err: null }
  static getDerivedStateFromError(e) { return { err: e.message || 'Unknown error' } }
  render() {
    if (this.state.err) return (
      <div style={{ padding: 32, fontFamily: 'Georgia,serif', color: C.text, background: C.bg, minHeight: '100vh' }}>
        <div style={{ height: 4, background: `linear-gradient(90deg,${C.green},${C.dark})`, marginBottom: 24 }} />
        <div style={{ fontSize: 18, fontWeight: 700, color: C.dark, marginBottom: 8 }}>Something went wrong</div>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>{this.state.err}</div>
        <button onClick={() => this.setState({ err: null })}
          style={{ background: C.green, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, cursor: 'pointer' }}>
          Try again
        </button>
      </div>
    )
    return this.props.children
  }
}

// ── Root ──────────────────────────────────────────────────────────────────────
function Main() {
  const [step, setStep] = useState(() => {
    try { return parseInt(localStorage.getItem('jmcc_step') || '1', 10) } catch { return 1 }
  })
  const [record, setRecord] = useState(() => {
    try {
      const saved = localStorage.getItem('jmcc_record')
      return saved ? JSON.parse(saved) : null
    } catch { return null }
  })

  function goToStep(n, rec = null) {
    setStep(n)
    try { localStorage.setItem('jmcc_step', String(n)) } catch {}
    if (rec) {
      setRecord(rec)
      try { localStorage.setItem('jmcc_record', JSON.stringify(rec)) } catch {}
    }
  }

  function reset() {
    setStep(1)
    setRecord(null)
    try {
      localStorage.removeItem('jmcc_step')
      localStorage.removeItem('jmcc_record')
    } catch {}
  }

  return (
    <Wrap step={step}>
      {step === 1 && <Review onNext={() => goToStep(2)} />}
      {step === 2 && <Sign   onBack={() => goToStep(1)} onDone={r => goToStep(3, r)} />}
      {step === 3 && record && <Done record={record} onReset={reset} />}
    </Wrap>
  )
}

export default function App() {
  return <Boundary><Main /></Boundary>
}
