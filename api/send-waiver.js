import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import nodemailer from 'nodemailer'
import { Client as NotionClient } from '@notionhq/client'

// NEW SYSTEM — Clients database under "Card Restoration HQ"
const CLIENT_DB = '1292d2fb-cf2d-4e0c-b2d3-7d5ed07335e8'
const NOTION_VERSION = '2025-09-03' // for raw file-upload calls

// ── Matches App.jsx exactly ───────────────────────────────────────────────────
const SERVICES = [
  { name: 'Clean + Polish',                price: '$8',  note: 'Surface clean, holo polish' },
  { name: 'Edge & Corner Lift Correction', price: '$30', note: 'includes Clean + Polish' },
  { name: 'Dent Correction',               price: '$50', note: 'includes Clean + Polish' },
  { name: 'Crease Correction',             price: '$70', note: 'includes Clean + Polish' },
]

const SECTIONS = [
  ['Preamble', 'This Service Agreement is entered into between Just Mint Card Care (the "Service Provider") and the Customer identified in the Submission Details of this Agreement (the "Customer"), effective as of the date the Customer accepts these terms as described in Section 18.'],

  ['1. Services and Scope', 'The Service Provider agrees to perform the repair and restoration services described in the Quote (the "Services") on the trading card(s) identified therein (the "Card(s)").'],

  ['2. Acknowledgment of Risk', 'Card repair and restoration involve specialized techniques that carry inherent risks, including minor alterations in texture, gloss, or coloration; changes in surface integrity including additional whitening or increased visibility of existing defects; unforeseen reactions to materials, treatments, heat, pressure, hydration, or cleaning processes; the possibility that defects cannot be fully repaired and may remain visible; and the possibility that Card(s) may be left in a condition equal to or worse than on arrival. No specific outcome is guaranteed and some changes may be permanent or irreversible.'],

  ['3. Assumption of Risk and Limitation of Liability', 'The Customer knowingly assumes all risks associated with the repair and restoration process. To the fullest extent permitted by applicable law, the Service Provider shall not be liable for any loss in value, condition change, or damage arising during or after the restoration process, including fading, color shifts, whitening, gloss variation, surface changes, creases, dents, imperfections that may not be fully removable, or any impact on the Card\'s eligibility for grading, authentication, or resale. Liability Cap: the Service Provider\'s total aggregate liability shall not exceed the total fees paid by the Customer for the Services. Nothing in this Agreement limits liability for gross negligence, willful misconduct, or fraud.'],

  ['4. No Guarantee of Grading or Value', 'The Service Provider makes no representations or warranties regarding the outcome of grading or authentication by third-party companies including PSA, Beckett (BGS), CGC, SGC, or similar entities; whether a Card will be flagged as altered, restored, or ineligible for numeric grading; or the market value, resale value, or collectability of any Card following restoration. All grading determinations are made solely by independent third parties entirely outside the Service Provider\'s control.'],

  ['5. Custody of Property', 'The Service Provider will exercise reasonable care in safeguarding the Customer\'s Card(s) while in the Service Provider\'s possession. The Service Provider is not an insurer of the Card(s). Except to the extent caused by gross negligence, willful misconduct, or fraud, the Service Provider shall not be liable for loss, theft, burglary, fire, vandalism, natural disaster, or other events beyond reasonable control. The Customer is encouraged to obtain appropriate insurance coverage for valuable Card(s).'],

  ['6. Pre-Existing Conditions and Hidden Defects', 'Collectible trading cards may contain pre-existing damage, hidden defects, prior restoration, manufacturing irregularities, or other conditions not visible or reasonably discoverable before restoration begins. Such conditions may affect the restoration process or become apparent only after treatment commences. The Service Provider shall not be responsible for adverse outcomes resulting from pre-existing or concealed conditions that could not reasonably have been identified prior to performing the authorized Services.'],

  ['7. Authorization for Restoration Methods', 'The Customer authorizes the Service Provider to perform the Services using professional judgment, experience, and customary restoration techniques, including the selection of materials, tools, processes, heat, pressure, hydration, cleaning, or other methods the Service Provider reasonably determines are appropriate. If a material change in scope is necessary, the Customer\'s written approval will be obtained before proceeding, unless immediate action is necessary to prevent further damage to the Card.'],

  ['8. Payment, Possession, and Unclaimed Property (Minnesota)', 'Payment for all Services is due in full within fourteen (14) calendar days of completion notice. The Service Provider shall retain possession of the Card(s) until payment is received in full. Under Minnesota law, the Service Provider does not have authority to sell, auction, transfer, or dispose of the Card(s) to satisfy unpaid fees. All notices will be sent exclusively by email. If the Customer fails to pay or retrieve the Card(s) within ninety (90) days of completion notice, storage fees apply: $15/month for Days 91-180, $25/month for Days 181-365, and $35/month beyond 365 days. Fees must be paid in full before cards are released; partial months are prorated. Trading cards cannot be transferred to the State of Minnesota as unclaimed property under Minnesota Statutes Chapter 345. Card(s) remain in the Service Provider\'s custody until retrieved by the Customer.'],

  ['9. Cancellation and Refunds', 'The Customer may cancel at any time before work begins for a full refund. Once work has commenced, no refunds will be issued for services already performed. If a card cannot be serviced due to being counterfeit or unsafe to work on, the service fee for that card will be refunded in full. If the agreed scope changes due to hidden damage and no revised agreement is reached, the portion of work not performed will be refunded.'],

  ['10. Release of Claims', 'By submitting Card(s) for repair or restoration, the Customer releases and discharges the Service Provider from claims arising out of or related to the inherent risks of authorized restoration services, except to the extent caused by gross negligence, willful misconduct, or fraud.'],

  ['11. Customer Ownership, Authority, and Disclosure Obligations', 'The Customer represents and warrants that they are the lawful owner of the Card(s) submitted, or have full legal authority to authorize the Services. The Customer agrees that any subsequent sale, trade, consignment, or grading submission is the Customer\'s sole responsibility to disclose accurately. The Service Provider expressly disclaims any participation in misrepresentation of restored Card(s) as unrestored. The Customer agrees to indemnify and hold harmless the Service Provider from any claim arising out of the Customer\'s failure to disclose restoration.'],

  ['12. Good-Faith Customer Care', 'While this Agreement limits liability, Just Mint Card Care values transparency and customer satisfaction. Concerns should be communicated promptly to justminttcg@gmail.com. The Service Provider may, at its sole discretion, address issues as a customer service courtesy. Nothing in this Agreement shall be interpreted as an obligation to provide refunds, replacements, or compensation.'],

  ['13. Photography and Documentation', 'The Service Provider may photograph or record the Card(s) before, during, and after Services for documentation, quality control, and portfolio, educational, or promotional purposes. Unless the Customer objects in writing before work begins, the Customer grants the Service Provider a non-exclusive, royalty-free license to use such images and recordings. Personally identifying information will be excluded; the Customer will not be identified by name without separate written consent.'],

  ['14. Electronic Acceptance and Communications', 'This Agreement may be delivered, accepted, and executed electronically. Agreement may be confirmed by email response or other written electronic communication, which shall be deemed legally binding and equivalent to a handwritten signature. No physical signature is required for this Agreement to be valid and enforceable.'],

  ['15. Governing Law, Venue, and Dispute Resolution', 'This Agreement shall be governed by and construed in accordance with the laws of the State of Minnesota, without regard to conflict-of-law principles. Any dispute arising out of or relating to this Agreement shall be brought exclusively in the appropriate courts of Hennepin County, Minnesota.'],

  ['16. Severability', 'If any provision of this Agreement is determined to be invalid, illegal, or unenforceable, that provision shall be enforced to the maximum extent permitted by law, and the remaining provisions shall remain in full force and effect.'],

  ['17. Entire Agreement', 'This Agreement constitutes the entire understanding between the Customer and the Service Provider with respect to the Services. It supersedes all prior or contemporaneous discussions, representations, understandings, negotiations, and agreements, whether oral or written. No amendment, modification, or waiver shall be effective unless made in writing and agreed to by both parties.'],

  ['18. Acceptance of Agreement', 'By replying to the accompanying email, checking the acceptance box on the intake form, or submitting Card(s) for repair or restoration services, the Customer affirms that they have read, understood, and voluntarily agreed to the terms of this Agreement in full.'],
]

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { clientName, clientEmail, notes, signedAt, sigDataUrl } = req.body || {}

  if (!clientName || !signedAt) {
    return res.status(400).json({ error: 'Missing clientName or signedAt' })
  }

  try {
    const pdfBytes = await buildPDF({ clientName, clientEmail, notes, signedAt, sigDataUrl })

    await Promise.allSettled([
      sendEmail({ clientName, clientEmail, notes, signedAt, pdfBytes }),
      syncToNotion({ clientName, clientEmail, notes, signedAt, pdfBytes }),
    ])

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('[send-waiver]', err)
    return res.status(500).json({ error: err.message })
  }
}

// ── PDF builder ───────────────────────────────────────────────────────────────
async function buildPDF({ clientName, clientEmail, notes, signedAt, sigDataUrl }) {
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
  const boxRows = 2 + (clientEmail ? 1 : 0) + (notes ? 1 : 0)
  const boxH    = boxRows * 22 + 24
  page.drawRectangle({
    x: M, y: y - boxH, width: CW, height: boxH,
    color: rgb(0.957, 0.984, 0.965),
    borderColor: light, borderWidth: 0.5,
  })
  y -= 16
  page.drawText('Client', { x: M + 12, y, size: 10, font, color: muted })
  page.drawText(clientName, { x: M + 80, y, size: 12, font: bold, color: body })
  if (clientEmail) {
    y -= 22
    page.drawText('Email', { x: M + 12, y, size: 10, font, color: muted })
    page.drawText(clientEmail, { x: M + 80, y, size: 11, font, color: body })
  }
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
async function sendEmail({ clientName, clientEmail, notes, signedAt, pdfBytes }) {
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
        ${clientEmail ? `<p><strong>Email:</strong> ${clientEmail}</p>` : ''}
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

// ── Notion sync (NEW SYSTEM) ──────────────────────────────────────────────────
// Finds the client by email (creates them if new), records the signature
// date/time, and attaches the signed PDF to their "Signed PDF" property.
async function syncToNotion({ clientName, clientEmail, notes, signedAt, pdfBytes }) {
  if (!process.env.NOTION_TOKEN) return

  const notion = new NotionClient({ auth: process.env.NOTION_TOKEN })

  // 1. Find existing client by email (fallback: exact name match)
  const filter = clientEmail
    ? { property: 'Email', email: { equals: clientEmail } }
    : { property: 'Name', title: { equals: clientName } }

  const found = await notion.databases.query({
    database_id: CLIENT_DB,
    filter,
    page_size: 1,
  })

  let pageId
  if (found.results.length) {
    // Returning client — just refresh the signature date
    pageId = found.results[0].id
    await notion.pages.update({
      page_id: pageId,
      properties: {
        'Signature Date': { date: { start: signedAt } },
        'Vite Synced':    { checkbox: true },
      },
    })
  } else {
    const page = await notion.pages.create({
      parent: { database_id: CLIENT_DB },
      properties: {
        'Name':           { title: [{ text: { content: clientName } }] },
        ...(clientEmail && { 'Email': { email: clientEmail } }),
        'Status':         { select: { name: 'Active' } },
        'Source':         { select: { name: 'Vite Form' } },
        'Vite Synced':    { checkbox: true },
        'Signature Date': { date: { start: signedAt } },
        ...(notes && {
          'Notes': { rich_text: [{ text: { content: notes.slice(0, 1900) } }] },
        }),
      },
    })
    pageId = page.id
  }

  // 2. Attach the signed PDF to the client's page (best-effort — never
  //    fails the waiver flow if the upload hiccups)
  try {
    await attachPdfToClient(pageId, pdfBytes, `JustMint_Waiver_${clientName.replace(/\s+/g, '_')}.pdf`)
  } catch (e) {
    console.error('[send-waiver] PDF attach skipped:', e.message)
  }
}

// Uploads the PDF via Notion's File Upload API (raw fetch — SDK v2 lacks it),
// then sets it on the client's "Signed PDF" property.
async function attachPdfToClient(pageId, pdfBytes, filename) {
  const headers = {
    Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
    'Notion-Version': NOTION_VERSION,
  }

  // Step 1 — create the upload slot
  const created = await fetch('https://api.notion.com/v1/file_uploads', {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'single_part', filename, content_type: 'application/pdf' }),
  }).then(r => r.json())
  if (!created.id) throw new Error(created.message || 'file upload creation failed')

  // Step 2 — send the bytes
  const form = new FormData()
  form.append('file', new Blob([Buffer.from(pdfBytes)], { type: 'application/pdf' }), filename)
  const sent = await fetch(`https://api.notion.com/v1/file_uploads/${created.id}/send`, {
    method: 'POST',
    headers, // no Content-Type — FormData sets its own boundary
    body: form,
  }).then(r => r.json())
  if (sent.status && sent.status !== 'uploaded') throw new Error(sent.message || 'file upload send failed')

  // Step 3 — attach to the page property
  const patched = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    method: 'PATCH',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      properties: {
        'Signed PDF': {
          files: [{ type: 'file_upload', file_upload: { id: created.id }, name: filename }],
        },
      },
    }),
  }).then(r => r.json())
  if (patched.object === 'error') throw new Error(patched.message)
}