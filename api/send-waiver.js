import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import nodemailer from 'nodemailer'

const SERVICES = [
  { name: 'Clean + Polish',                price: '$8',  note: 'Surface clean, holo polish' },
  { name: 'Edge & Corner Lift Correction', price: '$30', note: 'includes Clean + Polish' },
  { name: 'Dent Correction',               price: '$40', note: 'includes Clean + Polish' },
  { name: 'Crease Correction',             price: '$50', note: 'includes Clean + Polish' },
]

const SECTIONS = [
  ['1. Services & Pricing', 'Just Mint Card Care provides card cleaning and restoration on collectible trading cards, including Pokemon and other TCG cards. Prices are per card in USD. Cards requiring multiple correction types will be quoted as a single service. Scope agreed upon before work begins.'],
  ['2. How the Process Works', 'Step 1: Request a quote - share photos and card list before drop-off. Step 2: Approve the quote - signature confirms agreement to scope, pricing, and this Agreement. Step 3: Pay & Drop Off - full payment due at or before drop-off. Step 4: Pre-Condition Documentation - all cards photographed before work begins. Step 5: Restoration - paused and client contacted if unexpected issues arise. Step 6: Pick Up - cards returned in protective sleeves and toploaders.'],
  ['3. Payment', 'Full payment required before work begins. Accepted: PayPal, Venmo, Zelle, cash. All prices in USD. If scope changes due to hidden defect, revised quote provided before proceeding.'],
  ['4. Risks of Card Restoration', '4.1 Risk of Worsening: Card condition may worsen during restoration even when handled carefully. 4.2 Pre-Existing Damage: Just Mint is not responsible for damage documented at drop-off. 4.3 No Grading Guarantees: No guarantees regarding grading outcomes. 4.4 Severely Damaged Cards: Client contacted before touching high-risk cards. Client may cancel for full refund of that card\'s fee.'],
  ['5. Cancellations & Refunds', 'Before drop-off: full refund. After work has begun: non-refundable. If we cannot service a card: full refund. If scope changes and no agreement: unperformed portion refunded.'],
  ['6. Your Responsibilities', 'Provide accurate card information. Do not submit counterfeit or altered cards. Ensure drop-off cards match the approved quote. Provide accurate contact information and communicate promptly.'],
  ['7. Turnaround Time', 'Estimated times provided in good faith. We commit to completing within 1 month of drop-off under normal circumstances. Significant delays communicated promptly.'],
  ['8. Claims & Disputes', 'Claims submitted within 5 days of pick-up to justminttcg@gmail.com with photos/video. Response within 3 business days. Unresolved disputes handled under Minnesota law.'],
  ['9. Liability', 'Liability limited to service fees paid. Damage compensation based on fair market value (TCGPlayer, Cardmarket). Not liable for pre-existing damage, inherent fragility, grading outcomes, post-pickup damage, or unrelated losses.'],
  ['10. Your Information', 'Name, contact info, and card details collected solely to manage orders. Not shared with third parties. Cards may be photographed for records or marketing only with written consent. Data retained for 1 year.'],
  ['11. Governing Law', 'Governed by Minnesota law. Disputes in Hennepin County courts. If any provision is unenforceable, remaining provisions continue in effect.'],
]

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { clientName, notes, signedAt, sigDataUrl } = req.body || {}

  if (!clientName || !signedAt) {
    return res.status(400).json({ error: 'Missing clientName or signedAt' })
  }

  try {
    const pdfBytes = await buildPDF({ clientName, notes, signedAt, sigDataUrl })
    await sendEmail({ clientName, notes, signedAt, pdfBytes })
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('[send-waiver]', err)
    return res.status(500).json({ error: err.message })
  }
}

// ── PDF builder ───────────────────────────────────────────────────────────────
async function buildPDF({ clientName, notes, signedAt, sigDataUrl }) {
  const doc      = await PDFDocument.create()
  const font     = await doc.embedFont(StandardFonts.Helvetica)
  const bold     = await doc.embedFont(StandardFonts.HelveticaBold)

  const green    = rgb(0, 0.537, 0.133)
  const darkGreen= rgb(0.125, 0.380, 0)
  const body     = rgb(0.051, 0.149, 0.082)
  const muted    = rgb(0.290, 0.478, 0.345)
  const light    = rgb(0.722, 0.875, 0.769)

  const W = 595, H = 842, M = 50, CW = W - M * 2
  let page = doc.addPage([W, H])
  let y    = H - M

  const newPage = () => { page = doc.addPage([W, H]); y = H - M }
  const gap     = (n = 10) => { y -= n }
  const check   = (need) => { if (y - need < M + 30) newPage() }

  function text(str, x, size, f, color) {
    if (!str) return
    page.drawText(String(str), { x, y, size, font: f, color })
    y -= size * 1.5
  }

  function wrappedText(str, x, size, f, color, maxW) {
    const words = String(str).split(' ')
    let line = ''
    for (const word of words) {
      const test = line ? `${line} ${word}` : word
      if (f.widthOfTextAtSize(test, size) > maxW && line) {
        check(size * 1.6)
        page.drawText(line, { x, y, size, font: f, color })
        y -= size * 1.5
        line = word
      } else {
        line = test
      }
    }
    if (line) {
      check(size * 1.6)
      page.drawText(line, { x, y, size, font: f, color })
      y -= size * 1.5
    }
  }

  function divider(color = light) {
    page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.5, color })
    gap(12)
  }

  // ── Green header bar ──
  page.drawRectangle({ x: 0, y: H - 5, width: W, height: 5, color: green })
  gap(5)

  // ── Title ──
  text('Just Mint Card Care', M, 22, bold, green)
  text('SERVICE AGREEMENT & LIABILITY WAIVER', M, 9, font, muted)
  gap(6)
  divider()

  // ── Client details box ──
  const boxRows = 2 + (notes ? 1 : 0)
  const boxH    = boxRows * 22 + 24
  page.drawRectangle({
    x: M, y: y - boxH, width: CW, height: boxH,
    color: rgb(0.957, 0.984, 0.965),
    borderColor: light, borderWidth: 0.5,
  })

  const signedDate = new Date(signedAt).toLocaleString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  y -= 16
  page.drawText('Client', { x: M + 12, y, size: 10, font, color: muted })
  page.drawText(clientName, { x: M + 80, y, size: 12, font: bold, color: body })
  y -= 22
  page.drawText('Signed', { x: M + 12, y, size: 10, font, color: muted })
  page.drawText(signedDate, { x: M + 80, y, size: 11, font, color: body })
  if (notes) {
    y -= 22
    page.drawText('Notes', { x: M + 12, y, size: 10, font, color: muted })
    page.drawText(notes.substring(0, 70), { x: M + 80, y, size: 10, font, color: body })
  }
  y -= 20
  gap(14)

  // ── Signature ──
  if (sigDataUrl) {
    check(110)
    page.drawText('SIGNATURE', { x: M, y, size: 8, font: bold, color: muted })
    y -= 8
    page.drawRectangle({ x: M, y: y - 80, width: 220, height: 82, borderColor: light, borderWidth: 0.5 })
    try {
      const b64  = sigDataUrl.replace(/^data:image\/png;base64,/, '')
      const bytes = Buffer.from(b64, 'base64')
      const img   = await doc.embedPng(bytes)
      const dims  = img.scale(1)
      const scale = Math.min(216 / dims.width, 76 / dims.height)
      page.drawImage(img, {
        x: M + 2, y: y - 78,
        width: dims.width * scale, height: dims.height * scale,
      })
    } catch (e) {
      page.drawText('[signature on file]', { x: M + 10, y: y - 45, size: 10, font, color: muted })
    }
    y -= 92
    gap(12)
  }

  // ── Services ──
  check(120)
  divider()
  text('SERVICE RATES', M, 10, bold, green)
  for (const s of SERVICES) {
    check(16)
    page.drawText(`${s.name} (${s.note})`, { x: M, y, size: 10, font, color: body })
    page.drawText(s.price, { x: W - M - 25, y, size: 11, font: bold, color: green })
    y -= 16
  }
  gap(8)

  // ── Agreement sections ──
  divider()
  text('FULL AGREEMENT TERMS', M, 10, bold, green)
  gap(4)

  for (const [title, body_] of SECTIONS) {
    check(30)
    page.drawText(title, { x: M, y, size: 10, font: bold, color: darkGreen })
    y -= 14
    wrappedText(body_, M, 9, font, body, CW)
    gap(8)
  }

  // ── Footer on every page ──
  const pages = doc.getPages()
  for (let i = 0; i < pages.length; i++) {
    const p = pages[i]
    p.drawLine({ start: { x: M, y: 28 }, end: { x: W - M, y: 28 }, thickness: 0.3, color: light })
    p.drawText(`Just Mint Card Care  •  justminttcg@gmail.com  •  Page ${i + 1} of ${pages.length}`, {
      x: M, y: 16, size: 7, font, color: muted,
    })
  }

  return doc.save()
}

// ── Email sender ──────────────────────────────────────────────────────────────
async function sendEmail({ clientName, notes, signedAt, pdfBytes }) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'justminttcg@gmail.com',
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })

  const signedDate = new Date(signedAt).toLocaleString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  await transporter.sendMail({
    from:    '"Just Mint Card Care" <justminttcg@gmail.com>',
    to:      'justminttcg@gmail.com',
    subject: `Waiver Signed — ${clientName}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;padding:24px;background:#F4FBF6">
        <div style="height:4px;background:linear-gradient(90deg,#008922,#206100);margin-bottom:20px"></div>
        <h2 style="color:#206100;margin:0 0 16px">New Waiver Signed</h2>
        <p><strong>Client:</strong> ${clientName}</p>
        <p><strong>Signed:</strong> ${signedDate}</p>
        ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
        <p style="color:#4a7a58;margin-top:20px">The signed PDF waiver is attached to this email.</p>
        <hr style="border:none;border-top:1px solid #b8dfc4;margin:20px 0"/>
        <p style="color:#4a7a58;font-size:12px">Just Mint Card Care</p>
      </div>
    `,
    attachments: [{
      filename:    `JustMint_Waiver_${clientName.replace(/\s+/g, '_')}.pdf`,
      content:     Buffer.from(pdfBytes),
      contentType: 'application/pdf',
    }],
  })
}
