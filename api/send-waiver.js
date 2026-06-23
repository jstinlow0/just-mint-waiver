import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import nodemailer from 'nodemailer'
import { Client as NotionClient } from '@notionhq/client'

const CLIENT_DB = '334bc09b-53ce-80a9-82ec-000b8cffc130'

// ── Matches App.jsx exactly ───────────────────────────────────────────────────
const SERVICES = [
  { name: 'Clean + Polish',                price: '$8',  note: 'Surface clean, holo polish' },
  { name: 'Edge & Corner Lift Correction', price: '$30', note: 'includes Clean + Polish' },
  { name: 'Dent Correction',               price: '$40', note: 'includes Clean + Polish' },
  { name: 'Crease Correction',             price: '$50', note: 'includes Clean + Polish' },
]

const SECTIONS = [
  ['1. Services & Pricing',
   'Just Mint Card Care provides card cleaning and restoration on collectible trading cards, including Pokemon and other TCG cards. Prices are per card, in USD.\n\nClean + Polish (Surface clean, holo polish) — $8\nEdge & Corner Lift Correction (Clean + Polish included) — $30\nDent Correction (Clean + Polish included) — $40\nCrease Correction (Clean + Polish included) — $50\n\nCards requiring multiple types of correction will be quoted as a single service. The scope will be agreed upon before any work begins.'],
  ['2. How the Process Works',
   "Step 1 — Request a Quote: Reach out before dropping off your cards. Share photos and a list of the cards you'd like serviced. We'll review them and send a written quote outlining the service, price per card, estimated turnaround, and total cost.\n\nStep 2 — Approve the Quote: Once you're happy with the quote, sign and return it. Your signature confirms you've reviewed the scope of work, agree to the pricing, and have read this Agreement.\n\nStep 3 — Pay & Drop Off: Full payment is due at or before drop-off. We do not begin work until both the signed agreement and payment have been received. Drop-off is by appointment in the Minneapolis area.\n\nStep 4 — Pre-Condition Documentation: Before any work begins, we photograph and document the condition of every card in your batch. This record is shared with you and becomes the before-and-after reference.\n\nStep 5 — Restoration: We get to work. If we discover unexpected issues that change the scope, we will pause and contact you before continuing. No additional work will be performed without your approval.\n\nStep 6 — Pick Up: When your batch is ready, we'll notify you to schedule pick-up. Cards are returned in protective sleeves and toploaders."],
  ['3. Payment',
   'Full payment is required before work begins. We accept PayPal, Venmo, Zelle, and cash.\nAll prices are in USD.\nIf the scope of work changes due to a hidden defect, we will provide a revised quote before proceeding. You are not obligated to accept the revision.'],
  ['4. Risks of Card Restoration',
   "4.1 Risk of Worsening: There is always a possibility that a card's condition may worsen during restoration, even when handled with care. This risk is inherent to the materials involved. We will never attempt a service we believe is likely to cause additional damage without first telling you.\n\n4.2 Pre-Existing Damage: The pre-condition documentation completed at drop-off establishes the baseline condition of your cards. Just Mint Card Care is not responsible for any damage that was present prior to drop-off and documented in that record.\n\n4.3 No Grading Guarantees: We make no guarantees regarding how a card will grade after restoration. Grading company standards are outside our control.\n\n4.4 Severely Damaged Cards: If we assess that proceeding poses a high risk of further damage, we will contact you before touching the card. If you choose to proceed, you accept the risk. If you choose to cancel that card, we will refund its service fee in full."],
  ['5. Cancellations & Refunds',
   "You may cancel your order any time before drop-off for a full refund.\nOnce work has begun on a card, that card's service fee is non-refundable.\nIf a card cannot be serviced for any reason on our end (e.g., counterfeit, or we cannot safely complete the work), we will refund that card's service fee in full.\nIf the quote scope changes due to hidden damage and no agreement is reached, the portion of work not performed is refunded."],
  ['6. Your Responsibilities',
   "Provide accurate information about the cards you're submitting, including their condition, any known damage, and whether they are authentic.\nDo not submit counterfeit or altered cards. Submission of altered cards is grounds for immediate refusal and forfeiture of applicable fees.\nEnsure the cards you drop off match the cards listed on the approved quote.\nProvide accurate contact information (name, phone, email).\nCommunicate promptly if your contact details change or if you need to modify your order."],
  ['7. Turnaround Time',
   'Estimated turnaround times are provided in good faith. Actual completion may vary based on batch complexity, order queue, and any unexpected issues discovered during restoration.\n\nWe commit to completing your batch within 1 month of drop-off under normal circumstances. If we anticipate a significant delay, we will notify you as soon as possible.'],
  ['8. Claims & Disputes',
   'Claims must be submitted within 5 days of pick-up by contacting us at justminttcg@gmail.com.\nPlease include photos or video of the cards in question. We photograph all cards before and after service and will reference both records when reviewing any claim.\nWe will respond to all claims within 3 business days and work with you in good faith to reach a fair resolution.\nDisputes that cannot be resolved directly will be handled under Minnesota law (see Section 11).'],
  ['9. Liability',
   "Just Mint Card Care's liability is limited to the service fees paid for the affected cards. If a card is damaged due to our error, compensation will be based on the card's fair market value at the time of drop-off, referencing current market prices (e.g., TCGPlayer, Cardmarket).\n\nJust Mint Card Care is not liable for:\nDamage that was pre-existing and documented at drop-off\nDamage caused by inherent fragility of the card material\nGrading outcomes or results after restoration\nAny damage occurring after pick-up\nLosses unrelated to the direct service performed"],
  ['10. Your Information',
   'We collect your name, contact information, and card details solely to manage your order. We do not sell or share your personal information with third parties.\n\nWe may photograph or document your cards for internal record-keeping and quality tracking, or for portfolio/marketing use (e.g., before/after photos) — only with your written consent.\n\nYou may request deletion of your information at any time by contacting us directly. Records are retained for 1 year to support our service history.'],
  ['11. Governing Law',
   'This Agreement is governed by the laws of the State of Minnesota. Any disputes that cannot be resolved informally will be handled in the appropriate courts of Hennepin County, Minnesota.\n\nIf any part of this Agreement is found to be unenforceable, the remaining provisions continue in full effect.'],
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

    await Promise.allSettled([
      sendEmail({ clientName, notes, signedAt, pdfBytes }),
      syncToNotion({ clientName, notes, signedAt }),
    ])

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('[send-waiver]', err)
    return res.status(500).json({ error: err.message })
  }
}

// ── PDF builder ───────────────────────────────────────────────────────────────
async function buildPDF({ clientName, notes, signedAt, sigDataUrl }) {
  const doc   = await PDFDocument.create()
  const font  = await doc.embedFont(StandardFonts.Helvetica)
  const bold  = await doc.embedFont(StandardFonts.HelveticaBold)

  const green     = rgb(0, 0.537, 0.133)
  const darkGreen = rgb(0.125, 0.380, 0)
  const body      = rgb(0.051, 0.149, 0.082)
  const muted     = rgb(0.290, 0.478, 0.345)
  const light     = rgb(0.722, 0.875, 0.769)

  const W = 595, H = 842, M = 50, CW = W - M * 2
  let page = doc.addPage([W, H])
  let y    = H - M

  const newPage = () => { page = doc.addPage([W, H]); y = H - M }
  const check   = (need) => { if (y - need < M + 30) newPage() }
  const gap     = (n = 10) => { y -= n }

  function drawText(str, x, size, f, color) {
    page.drawText(String(str), { x, y, size, font: f, color })
    y -= size * 1.5
  }

  function drawWrapped(str, x, size, f, color, maxW) {
    const paragraphs = String(str).split('\n')
    for (const para of paragraphs) {
      if (para.trim() === '') { y -= size * 0.8; continue }
      const words = para.split(' ')
      let line = ''
      for (const word of words) {
        const test = line ? `${line} ${word}` : word
        if (f.widthOfTextAtSize(test, size) > maxW && line) {
          check(size * 1.6)
          page.drawText(line, { x, y, size, font: f, color })
          y -= size * 1.45
          line = word
        } else {
          line = test
        }
      }
      if (line) {
        check(size * 1.6)
        page.drawText(line, { x, y, size, font: f, color })
        y -= size * 1.45
      }
    }
  }

  function divider(color = light, thickness = 0.5) {
    page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness, color })
    gap(12)
  }

  // ── Green header bar ──
  page.drawRectangle({ x: 0, y: H - 5, width: W, height: 5, color: green })
  gap(5)

  // ── Title ──
  drawText('Just Mint Card Care', M, 22, bold, green)
  drawText('SERVICE AGREEMENT & LIABILITY WAIVER', M, 9, font, muted)
  gap(6)
  divider()

  // ── Client details box ──
  const signedDate = new Date(signedAt).toLocaleString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
  const boxRows = 2 + (notes ? 1 : 0)
  const boxH    = boxRows * 22 + 24
  page.drawRectangle({
    x: M, y: y - boxH, width: CW, height: boxH,
    color: rgb(0.957, 0.984, 0.965),
    borderColor: light, borderWidth: 0.5,
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
      const b64   = sigDataUrl.replace(/^data:image\/png;base64,/, '')
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

  // ── Services table ──
  check(120)
  divider(green, 1)
  drawText('SERVICE RATES — PER CARD', M, 11, bold, green)
  gap(4)
  for (const s of SERVICES) {
    check(18)
    page.drawText(`${s.name} — ${s.note}`, { x: M, y, size: 10, font, color: body })
    page.drawText(s.price, { x: W - M - 25, y, size: 11, font: bold, color: green })
    y -= 18
  }
  gap(8)

  // ── Agreement sections ──
  check(30)
  divider(green, 1)
  drawText('FULL AGREEMENT TERMS', M, 11, bold, green)
  gap(4)

  for (const [title, text] of SECTIONS) {
    check(30)
    page.drawText(title, { x: M, y, size: 10, font: bold, color: darkGreen })
    y -= 14
    drawWrapped(text, M, 9, font, body, CW)
    gap(8)
  }

  // ── Footer on every page ──
  const pages = doc.getPages()
  for (let i = 0; i < pages.length; i++) {
    const p = pages[i]
    p.drawLine({ start: { x: M, y: 28 }, end: { x: W - M, y: 28 }, thickness: 0.3, color: light })
    p.drawText(
      `Just Mint Card Care  •  justminttcg@gmail.com  •  Page ${i + 1} of ${pages.length}`,
      { x: M, y: 16, size: 7, font, color: muted }
    )
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
        <p style="color:#4a7a58;margin-top:20px">The signed PDF waiver is attached.</p>
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

// ── Notion sync ───────────────────────────────────────────────────────────────
async function syncToNotion({ clientName, notes, signedAt }) {
  if (!process.env.NOTION_TOKEN) return

  const notion     = new NotionClient({ auth: process.env.NOTION_TOKEN })
  const intakeDate = new Date(signedAt).toISOString().split('T')[0]

  await notion.pages.create({
    parent: { database_id: CLIENT_DB },
    properties: {
      'Name':           { title: [{ text: { content: clientName } }] },
      'Date Intake':    { date: { start: intakeDate } },
      'Risk Agreement': { checkbox: true },
      'Intake Complete':{ checkbox: false },
      ...(notes && {
        'Contact Info': { rich_text: [{ text: { content: notes } }] },
      }),
    },
  })
}