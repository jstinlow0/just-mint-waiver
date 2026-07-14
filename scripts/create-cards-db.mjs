// scripts/create-cards-db.mjs
// One-time setup: creates the JMCC "Cards" database in Notion.
//
// Run once from Codespaces (or anywhere with the env vars set):
//   NOTION_TOKEN=ntn_xxx NOTION_PARENT_PAGE_ID=<page id> node scripts/create-cards-db.mjs
//
// NOTION_PARENT_PAGE_ID = a Notion PAGE you own (the DB will be created inside it).
// Copy it from the page URL: the 32-char hex string at the end.
//
// After it runs, it prints the new Cards database ID. Put that in Vercel as
// the CARDS_DB_ID env var.

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const PARENT_PAGE_ID = process.env.NOTION_PARENT_PAGE_ID;

// Existing JMCC databases (from project memory)
const CLIENT_DB_ID = '334bc09b-53ce-80a9-82ec-000b8cffc130';
const CARD_ORDERS_DB_ID = '334bc09b-53ce-8026-a631-000b683d4ef9';
const SIGNED_WAIVERS_DB_ID = '4e2e71c7-c056-421c-a58a-66914158dc7c';

const NOTION_VERSION = '2026-03-11';

if (!NOTION_TOKEN || !PARENT_PAGE_ID) {
  console.error('Missing env: NOTION_TOKEN and NOTION_PARENT_PAGE_ID are required.');
  process.exit(1);
}

const body = {
  parent: { type: 'page_id', page_id: PARENT_PAGE_ID },
  title: [{ type: 'text', text: { content: 'Cards' } }],
  properties: {
    'Card Name': { title: {} },
    'Order':  { relation: { database_id: CARD_ORDERS_DB_ID, single_property: {} } },
    'Client': { relation: { database_id: CLIENT_DB_ID, single_property: {} } },
    'Status': {
      select: {
        options: [
          { name: 'Intake',          color: 'gray'   },
          { name: 'Cleaning & Prep', color: 'yellow' },
          { name: 'Done',            color: 'green'  },
          { name: 'Returned',        color: 'blue'   },
        ],
      },
    },
    'Notes':  { rich_text: {} },
    'Photos': { files: {} },
    'Created': { created_time: {} },
    // ── Phase 2 seam: waiver attachment ──────────────────────────────────────
    // Relation in place now so wiring the signed-waiver PDF later is trivial.
    'Waiver': { relation: { database_id: SIGNED_WAIVERS_DB_ID, single_property: {} } },
  },
};

const res = await fetch('https://api.notion.com/v1/databases', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${NOTION_TOKEN}`,
    'Content-Type': 'application/json',
    'Notion-Version': NOTION_VERSION,
  },
  body: JSON.stringify(body),
});

const data = await res.json();
if (!res.ok) {
  console.error('Failed to create Cards database:');
  console.error(JSON.stringify(data, null, 2));
  process.exit(1);
}

console.log('✓ Cards database created.');
console.log('  CARDS_DB_ID =', data.id);
console.log('\nNext: add CARDS_DB_ID to your Vercel project env vars.');
