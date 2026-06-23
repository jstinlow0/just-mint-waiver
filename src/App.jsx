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
  ['1. Services & Pricing',
   `Just Mint Card Care provides card cleaning and restoration on collectible trading cards, including Pokémon and other TCG cards. Prices are per card, in USD.

• Clean + Polish (Surface clean, holo polish) — $8
• Edge & Corner Lift Correction (Clean + Polish included) — $30
• Dent Correction (Clean + Polish included) — $40
• Crease Correction (Clean + Polish included) — $50

Cards requiring multiple types of correction will be quoted as a single service. The scope will be agreed upon before any work begins.`],
  ['2. How the Process Works',
   `Step 1 — Request a Quote: Reach out before dropping off your cards. Share photos and a list of the cards you'd like serviced. We'll review them and send a written quote outlining the service, price per card, estimated turnaround, and total cost.

Step 2 — Approve the Quote: Once you're happy with the quote, sign and return it. Your signature confirms you've reviewed the scope of work, agree to the pricing, and have read this Agreement.

Step 3 — Pay & Drop Off: Full payment is due at or before drop-off. We do not begin work until both the signed agreement and payment have been received. Drop-off is by appointment in the Minneapolis area.

Step 4 — Pre-Condition Documentation: Before any work begins, we photograph and document the condition of every card in your batch. This record is shared with you and becomes the before-and-after reference.

Step 5 — Restoration: We get to work. If we discover unexpected issues that change the scope, we will pause and contact you before continuing. No additional work will be performed without your approval.

Step 6 — Pick Up: When your batch is ready, we'll notify you to schedule pick-up. Cards are returned in protective sleeves and toploaders.`],
  ['3. Payment',
   `• Full payment is required before work begins. We accept PayPal, Venmo, Zelle, and cash.
• All prices are in USD.
• If the scope of work changes due to a hidden defect, we will provide a revised quote before proceeding. You are not obligated to accept the revision.`],
  ['4. Risks of Card Restoration',
   `4.1 Risk of Worsening: There is always a possibility that a card's condition may worsen during restoration, even when handled with care. This risk is inherent to the materials involved. We will never attempt a service we believe is likely to cause additional damage without first telling you.

4.2 Pre-Existing Damage: The pre-condition documentation completed at drop-off establishes the baseline condition of your cards. Just Mint Card Care is not responsible for any damage that was present prior to drop-off and documented in that record.

4.3 No Grading Guarantees: We make no guarantees regarding how a card will grade after restoration. Grading company standards are outside our control.

4.4 Severely Damaged Cards: If we assess that proceeding poses a high risk of further damage, we will contact you before touching the card. If you choose to proceed, you accept the risk. If you choose to cancel that card, we will refund its service fee in full.`],
  ['5. Cancellations & Refunds',
   `• You may cancel your order any time before drop-off for a full refund.
• Once work has begun on a card, that card's service fee is non-refundable.
• If a card cannot be serviced for any reason on our end (e.g., counterfeit, or we cannot safely complete the work), we will refund that card's service fee in full.
• If the quote scope changes due to hidden damage and no agreement is reached, the portion of work not performed is refunded.`],
  ['6. Your Responsibilities',
   `• Provide accurate information about the cards you're submitting, including their condition, any known damage, and whether they are authentic.
• Do not submit counterfeit or altered cards. Submission of altered cards is grounds for immediate refusal and forfeiture of applicable fees.
• Ensure the cards you drop off match the cards listed on the approved quote.
• Provide accurate contact information (name, phone, email).
• Communicate promptly if your contact details change or if you need to modify your order.`],
  ['7. Turnaround Time',
   `Estimated turnaround times are provided in good faith. Actual completion may vary based on batch complexity, order queue, and any unexpected issues discovered during restoration.

We commit to completing your batch within 1 month of drop-off under normal circumstances. If we anticipate a significant delay, we will notify you as soon as possible.`],
  ['8. Claims & Disputes',
   `• Claims must be submitted within 5 days of pick-up by contacting us at justminttcg@gmail.com.
• Please include photos or video of the cards in question. We photograph all cards before and after service and will reference both records when reviewing any claim.
• We will respond to all claims within 3 business days and work with you in good faith to reach a fair resolution.
• Disputes that cannot be resolved directly will be handled under Minnesota law (see Section 11).`],
  ['9. Liability',
   `Just Mint Card Care's liability is limited to the service fees paid for the affected cards. If a card is damaged due to our error, compensation will be based on the card's fair market value at the time of drop-off, referencing current market prices (e.g., TCGPlayer, Cardmarket).

Just Mint Card Care is not liable for:
• Damage that was pre-existing and documented at drop-off
• Damage caused by inherent fragility of the card material
• Grading outcomes or results after restoration
• Any damage occurring after pick-up
• Losses unrelated to the direct service performed`],
  ['10. Your Information',
   `We collect your name, contact information, and card details solely to manage your order. We do not sell or share your personal information with third parties.

We may photograph or document your cards for internal record-keeping and quality tracking, or for portfolio/marketing use (e.g., before/after photos) — only with your written consent.

You may request deletion of your information at any time by contacting us directly. Records are retained for 1 year to support our service history.`],
  ['11. Governing Law',
   `This Agreement is governed by the laws of the State of Minnesota. Any disputes that cannot be resolved informally will be handled in the appropriate courts of Hennepin County, Minnesota.

If any part of this Agreement is found to be unenforceable, the remaining provisions continue in full effect.`],
]

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
function Done({ record }) {
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
  const [step,   setStep]   = useState(1)
  const [record, setRecord] = useState(null)
  return (
    <Wrap step={step}>
      {step === 1 && <Review onNext={() => setStep(2)} />}
      {step === 2 && <Sign   onBack={() => setStep(1)} onDone={r => { setRecord(r); setStep(3) }} />}
      {step === 3 && <Done   record={record} />}
    </Wrap>
  )
}

export default function App() {
  return <Boundary><Main /></Boundary>
}
