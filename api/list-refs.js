// api/list-refs.js
// GET /api/list-refs
// Returns the data the capture UI needs on load:
//   - clients: [{ id, name }]   from the Client DB
//   - orders:  [{ id, name }]   from the Card Orders DB
//   - cards:   [{ id, name, status, orderId, clientId }]  recent Cards (for reopen/edit)
//
// Title property names differ per DB, so we detect the `title`-typed property
// dynamically instead of hard-coding names (avoids silent mismatches).

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const CLIENT_DB_ID = process.env.CLIENT_DB_ID || '334bc09b-53ce-80a9-82ec-000b8cffc130';
const CARD_ORDERS_DB_ID = process.env.CARD_ORDERS_DB_ID || '334bc09b-53ce-8026-a631-000b683d4ef9';
const CARDS_DB_ID = process.env.CARDS_DB_ID;
const NOTION_VERSION = '2026-03-11';

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

function titleOf(page) {
  const props = page.properties || {};
  for (const key of Object.keys(props)) {
    if (props[key]?.type === 'title') {
      return (props[key].title || []).map((t) => t.plain_text).join('') || '(untitled)';
    }
  }
  return '(untitled)';
}

function firstRelationId(prop) {
  return prop?.relation?.[0]?.id || null;
}

async function queryAll(dbId, sorts) {
  const out = [];
  let cursor;
  do {
    const data = await notion(`databases/${dbId}/query`, {
      method: 'POST',
      body: JSON.stringify({ start_cursor: cursor, page_size: 100, sorts }),
    });
    out.push(...data.results);
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);
  return out;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
  if (!NOTION_TOKEN) {
    return res.status(500).json({ ok: false, error: 'NOTION_TOKEN not configured' });
  }

  try {
    const [clientPages, orderPages] = await Promise.all([
      queryAll(CLIENT_DB_ID),
      queryAll(CARD_ORDERS_DB_ID),
    ]);

    const clients = clientPages.map((p) => ({ id: p.id, name: titleOf(p) }));
    const orders = orderPages.map((p) => ({ id: p.id, name: titleOf(p) }));

    let cards = [];
    if (CARDS_DB_ID) {
      const cardPages = await queryAll(CARDS_DB_ID, [
        { property: 'Created', direction: 'descending' },
      ]);
      cards = cardPages.slice(0, 50).map((p) => ({
        id: p.id,
        name: titleOf(p),
        status: p.properties?.Status?.select?.name || null,
        notes: (p.properties?.Notes?.rich_text || []).map((t) => t.plain_text).join(''),
        orderId: firstRelationId(p.properties?.Order),
        clientId: firstRelationId(p.properties?.Client),
        photoCount: (p.properties?.Photos?.files || []).length,
      }));
    }

    return res.status(200).json({ ok: true, clients, orders, cards });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
