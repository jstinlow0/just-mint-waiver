// api/upload-card-photo.js
// POST /api/upload-card-photo?pageId=<cards page id>&filename=<name>&type=<mime>
// Body: RAW BINARY image bytes (already compressed client-side to < 4 MB).
//
// Performs Notion's single_part File Upload, then attaches the file to the Cards
// row's "Photos" property. Free-plan: single_part only, 5 MB hard cap per file.
//
// Why raw binary (not base64 JSON): base64 inflates ~33%, which would push a 4 MB
// photo over Vercel's 4.5 MB function-body limit. Raw binary keeps full headroom.
//
// IMPORTANT: we read the raw request stream ourselves, so body parsing must be
// off for this route. For framework-less Vercel functions the stream is raw by
// default; this config makes the intent explicit and is harmless.
export const config = { api: { bodyParser: false } };

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_VERSION = '2026-03-11';
const MAX_BYTES = 5 * 1024 * 1024;       // Notion free-plan per-file cap
const VERCEL_BODY_LIMIT = 4.5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

async function readRawBody(req) {
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > VERCEL_BODY_LIMIT) {
      // Defensive: client must compress first; this should never trigger.
      throw new Error('Photo too large after upload — compress further (< 4 MB).');
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
  if (!NOTION_TOKEN) {
    return res.status(500).json({ ok: false, error: 'NOTION_TOKEN not configured' });
  }

  const { pageId, filename = 'photo.jpg', type = 'image/jpeg' } = req.query || {};
  if (!pageId) return res.status(400).json({ ok: false, error: 'pageId is required' });
  if (!ALLOWED_TYPES.includes(type)) {
    return res.status(400).json({ ok: false, error: `Unsupported type: ${type}` });
  }

  try {
    const buffer = await readRawBody(req);
    if (buffer.length === 0) return res.status(400).json({ ok: false, error: 'Empty body' });
    if (buffer.length > MAX_BYTES) {
      return res.status(400).json({ ok: false, error: 'Photo exceeds the 5 MB Notion free-plan limit' });
    }

    // ── Step 1: create the file upload (single_part) ──────────────────────────
    const createRes = await fetch('https://api.notion.com/v1/file_uploads', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': NOTION_VERSION,
      },
      body: JSON.stringify({ mode: 'single_part', filename, content_type: type }),
    });
    const created = await createRes.json();
    if (!createRes.ok) throw new Error(created.message || 'Failed to create file upload');

    // ── Step 2: send the bytes (multipart/form-data, field "file") ────────────
    // Node 18+ has global FormData/Blob/fetch — no extra deps. Do NOT set
    // Content-Type manually; fetch adds the multipart boundary.
    const form = new FormData();
    form.append('file', new Blob([buffer], { type }), filename);

    const sendUrl = created.upload_url || `https://api.notion.com/v1/file_uploads/${created.id}/send`;
    const sendRes = await fetch(sendUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': NOTION_VERSION,
      },
      body: form,
    });
    const sent = await sendRes.json();
    if (!sendRes.ok) throw new Error(sent.message || 'Failed to send file bytes');

    // ── Step 3: attach to the Cards row "Photos" property (within 1 hour) ──────
    // Append to existing files so multiple photos accumulate on the same card.
    const pageRes = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': NOTION_VERSION,
      },
    });
    const page = await pageRes.json();
    if (!pageRes.ok) throw new Error(page.message || 'Failed to read card page');

    const existing = (page.properties?.Photos?.files || []).map((f) => {
      if (f.type === 'file_upload') return { type: 'file_upload', file_upload: { id: f.file_upload?.id }, name: f.name };
      if (f.type === 'external') return { type: 'external', external: { url: f.external.url }, name: f.name };
      // Notion-hosted files can be re-referenced by their existing url
      return { type: 'external', external: { url: f.file?.url }, name: f.name };
    }).filter((f) => f.external?.url || f.file_upload?.id);

    const attachRes = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': NOTION_VERSION,
      },
      body: JSON.stringify({
        properties: {
          Photos: {
            files: [
              ...existing,
              { type: 'file_upload', file_upload: { id: created.id }, name: filename },
            ],
          },
        },
      }),
    });
    const attached = await attachRes.json();
    if (!attachRes.ok) throw new Error(attached.message || 'Failed to attach file to card');

    return res.status(200).json({ ok: true, fileUploadId: created.id });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
