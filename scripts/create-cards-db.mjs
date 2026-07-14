// scripts/create-cards-db.mjs
// ─────────────────────────────────────────────────────────────────────────────
// ⚠️  YOU PROBABLY DON'T NEED TO RUN THIS.
//
// The Cards database ALREADY EXISTS in the new "Card Restoration HQ" page:
//
//   CARDS_DB_ID = f38bd223-1bef-47f1-b23e-1521ef70ddc4
//
// api/sync-card.js already has that ID built in, so no env var is required.
// This script exists only as a rebuild tool: if the Cards database is ever
// deleted, running this recreates it with the exact same schema, pointed at
// the NEW system's databases.
//
// It is safe by default: it checks whether the existing Cards DB is still
// reachable and refuses to create a duplicate unless you pass --force.
//
// Run (only if rebuilding):
//   NOTION_TOKEN=ntn_xxx NOTION_PARENT_PAGE_ID=<HQ page id> node scripts/create-cards-db.mjs --force
//
// NOTION_PARENT_PAGE_ID for Card Restoration HQ: 39dbc09b53ce81abae86e5630229979d
// ─────────────────────────────────────────────────────────────────────────────

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const PARENT_PAGE_ID = process.env.NOTION_PARENT_PAGE_ID || '39dbc09b53ce81abae86e5630229979d';

// ── NEW SYSTEM databases (Card Restoration HQ) ───────────────────────────────
const EXISTING_CARDS_DB_ID = 'f38bd223-1bef-47f1-b23e-1521ef70ddc4';
const CLIENTS_DB_ID        = '1292d2fb-cf2d-4e0c-b2d3-7d5ed07335e8'; // Clients
const BATCHES_DB_ID        = '378f4ca1-a2ac-4403-8456-7be887514e68'; // Restoration Batches

const NOTION_VERSION = '2026-03-11';

if (!NOTION_TOKEN) {
  console.error('Missing env: NOTION_TOKEN is required.');
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${NOTION_TOKEN}`,
  'Content-Type': 'application/json',
  'Notion-Version': NOTION_VERSION,
};

// ── Safety check: does the Cards DB already exist? ───────────────────────────
const check = await fetch(`https://api.notion.com/v1/databases/${EXISTING_CARDS_DB_ID}`, { headers });
if (check.ok) {
  console.log('✓ Cards database already exists and is reachable.');
  console.log('  CARDS_DB_ID =', EXISTING_CARDS_DB_ID);
  if (!process.argv.includes('--force')) {
    console.log('\nNothing to do. (Pass --force to create a fresh copy anyway.)');
    process.exit(0);
  }
  console.log('\n--force passed — creating a fresh copy…');
}

// ── Create (schema matches the existing Cards DB in Card Restoration HQ) ─────
const body = {
  parent: { type: 'page_id', page_id: PARENT_PAGE_ID },
  title: [{ type: 'text', text: { content: 'Cards' } }],
  properties: {
    'Card Name': { title: {} },
    'Order':  { relation: { database_id: BATCHES_DB_ID, single_property: {} } },
    'Client': { relation: { database_id: CLIENTS_DB_ID, single_property: {} } },
    'Status': {
      select: {
        options: [
          { name: 'Intake',          color: 'gray'   },
          { name: 'Cleaning & Prep', color: 'blue'   },
          { name: 'Done',            color: 'green'  },
          { name: 'Returned',        color: 'purple' },
        ],
      },
    },
    'Service': {
      select: {
        options: [
          { name: 'Clean + Polish', color: 'green'  },
          { name: 'Lift',           color: 'blue'   },
          { name: 'Dent',           color: 'orange' },
          { name: 'Crease',         color: 'red'    },
        ],
      },
    },
    'Condition (Before)': {
      select: {
        options: [
          { name: 'NM',  color: 'green'  },
          { name: 'LP',  color: 'yellow' },
          { name: 'MP',  color: 'orange' },
          { name: 'HP',  color: 'red'    },
          { name: 'DMG', color: 'gray'   },
        ],
      },
    },
    'Notes':  { rich_text: {} },
    'Photos': { files: {} },
    'Created': { created_time: {} },
    // NOTE: the old 'Waiver' relation is gone on purpose — the new system
    // attaches the signed PDF directly to the Client page ("Signed PDF"
    // property) via api/send-waiver.js, so no separate waivers DB is needed.
  },
};

const res = await fetch('https://api.notion.com/v1/databases', {
  method: 'POST',
  headers,
  body: JSON.stringify(body),
});

const data = await res.json();
if (!res.ok) {
  console.error('Failed to create Cards database:');
  console.error(JSON.stringify(data, null, 2));
  process.exit(1);
}

console.log('✓ Cards database created.');
console.log('  New CARDS_DB_ID =', data.id);
console.log('\nNext: set CARDS_DB_ID in Vercel env vars so api/sync-card.js uses the new copy.');