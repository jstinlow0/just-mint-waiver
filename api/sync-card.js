// api/sync-card.js
// POST /api/sync-card
// Body (JSON, small — no photo bytes here):
//   {
//     pageId?: string,        // present => update existing card; absent => create new
//     cardName: string,
//     orderId: string,        // Card Orders page id (relation)
//     clientId: string,       // Client page id (relation)
//     status: 'Intake'|'Cleaning & Prep'|'Done'|'Returned',
//     notes?: string
//   }
// Returns: { ok, pageId, orderStatus } — orderStatus is the derived value written
// back to the parent Order (or null if left unchanged).
//
// Photos are NOT handled here. After this returns a pageId, the client uploads
// each photo via /api/upload-card-photo.
//
// Follows the existing api/sync-order.js conventions (ES module, NOTION_TOKEN,
// exact property names, clear JSON errors).

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const CARDS_DB_ID = process.env.CARDS_DB_ID;
const CARD_ORDERS_DB_ID = process.env.CARD_ORDERS_DB_ID || '334bc09b-53ce-8026-a631-000b683d4ef9';
const NOTION_VERSION = '2026-03-11';

// ── VERIFY THESE AGAINST YOUR CARD ORDERS DB ─────────────────────────────────
// The property name and option labels MUST match the Card Orders DB exactly, or
// the status write-back silently fails. Confirm in Notion before going live.
const ORDER_STATUS_PROP = 'Status';
const ORDER_STATUS = {
  inProgress: 'In Progress',
  complete: 'Complete',
  pickedUp: 'Picked Up',
};
// Manual quote/payment states we must never auto-overwrite:
const PROTECTED_ORDER_STATES = ['Awaiting Approval', 'Pending'];

const CARD_STATUSES = ['Intake', 'Cleaning & Prep', 'Done', 'Returned'];
const RICH_TEXT_LIMIT = 2000;

async function notion(path, options = {}) {
  const res = await fetch(`https://api.notion.com/v1/${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${NOTION_TOKEN}`,
      'Content-Type': 'application/json',
      'Notion-Version': NOTION_VERSION,
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Notion error on ${path}`);
  return data;
}

// rich_text caps each chunk at 2000 chars — split long notes.
function toRichText(text) {
  const t = (text || '').trim();
  if (!t) return [];
  const chunks = [];
  for (let i = 0; i < t.length; i += RICH_TEXT_LIMIT) {
    chunks.push({ type: 'text', text: { content: t.slice(i, i + RICH_TEXT_LIMIT) } });
  }
  return chunks;
}

// Derive the parent Order status from all its cards' statuses.
// Returns one of ORDER_STATUS.* or null (= leave Order unchanged).
function deriveOrderStatus(cardStatuses) {
  if (cardStatuses.length === 0) return null;
  const every = (s) => cardStatuses.every((c) => s.includes(c));
  const some = (s) => cardStatuses.some((c) => s.includes(c));

  if (every(['Returned'])) return ORDER_STATUS.pickedUp;
  if (every(['Done', 'Returned'])) return ORDER_STATUS.complete;
  if (some(['Cleaning & Prep', 'Done'])) return ORDER_STATUS.inProgress;
  return null; // all still Intake
}

async function getOrderCardStatuses(orderId, includePage) {
  // Query all Cards related to this Order. Notion relation filter:
  const results = [];
  let cursor;
  do {
    const data = await notion(`databases/${CARDS_DB_ID}/query`, {
      method: 'POST',
      body: JSON.stringify({
        start_cursor: cursor,
        page_size: 100,
        filter: { property: 'Order', relation: { contains: orderId } },
      }),
    });
    results.push(...data.results);
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);

  const statuses = results.map((p) => p.properties?.Status?.select?.name).filter(Boolean);
  // includePage covers a race where the just-written card isn't in the index yet.
  if (includePage && !results.some((p) => p.id === includePage.id)) {
    if (includePage.status) statuses.push(includePage.status);
  }
  return statuses;
}

async function maybeUpdateOrderStatus(orderId, justWrittenCard) {
  if (!orderId) return null;
  const statuses = await getOrderCardStatuses(orderId, justWrittenCard);
  const derived = deriveOrderStatus(statuses);
  if (!derived) return null;

  // Read current Order status; never overwrite a protected manual state.
  const order = await notion(`pages/${orderId}`);
  const current = order.properties?.[ORDER_STATUS_PROP]?.select?.name || null;
  if (PROTECTED_ORDER_STATES.includes(current)) return null;
  if (current === derived) return null;

  await notion(`pages/${orderId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      properties: { [ORDER_STATUS_PROP]: { select: { name: derived } } },
    }),
  });
  return derived;

  // ── Phase 2 seam (two-way sync) ────────────────────────────────────────────
  // A Notion -> app trigger (webhook/poll) would call this same derivation when a
  // card status is edited directly in Notion. Hook that in here.
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
  if (!NOTION_TOKEN || !CARDS_DB_ID) {
    return res.status(500).json({ ok: false, error: 'NOTION_TOKEN or CARDS_DB_ID not configured' });
  }

  try {
    const { pageId, cardName, orderId, clientId, status, notes } = req.body || {};

    // ── Validation ────────────────────────────────────────────────────────────
    if (!cardName || cardName.trim().length < 1) {
      return res.status(400).json({ ok: false, error: 'cardName is required' });
    }
    if (!CARD_STATUSES.includes(status)) {
      return res.status(400).json({ ok: false, error: `status must be one of: ${CARD_STATUSES.join(', ')}` });
    }
    if (!orderId) return res.status(400).json({ ok: false, error: 'orderId is required' });
    if (!clientId) return res.status(400).json({ ok: false, error: 'clientId is required' });

    const properties = {
      'Card Name': { title: [{ type: 'text', text: { content: cardName.trim() } }] },
      'Order': { relation: [{ id: orderId }] },
      'Client': { relation: [{ id: clientId }] },
      'Status': { select: { name: status } },
      'Notes': { rich_text: toRichText(notes) },
    };

    let page;
    if (pageId) {
      page = await notion(`pages/${pageId}`, {
        method: 'PATCH',
        body: JSON.stringify({ properties }),
      });
    } else {
      page = await notion('pages', {
        method: 'POST',
        body: JSON.stringify({ parent: { database_id: CARDS_DB_ID }, properties }),
      });
    }

    const orderStatus = await maybeUpdateOrderStatus(orderId, { id: page.id, status });

    return res.status(200).json({ ok: true, pageId: page.id, orderStatus });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
