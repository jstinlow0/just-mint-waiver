// api/sync-order.js
// Vercel serverless function — syncs a new order to the NEW Notion system:
//   • Clients (finds existing client by email, creates if new)
//   • Restoration Batches (ONE row per batch — Notion auto-assigns Order #)
// Requires NOTION_TOKEN environment variable set in Vercel project settings

import { Client } from "@notionhq/client";

// New databases under "Card Restoration HQ"
const CLIENTS_DB = "1292d2fb-cf2d-4e0c-b2d3-7d5ed07335e8";
const BATCHES_DB = "378f4ca1-a2ac-4403-8456-7be887514e68";

const SERVICE_PRICES = {
  "Clean + Polish": 8,
  "Lift":           30,
  "Dent":           40,
  "Crease":         50,
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const notion = new Client({ auth: process.env.NOTION_TOKEN });
  const order  = req.body;

  if (!order?.clientName || !Array.isArray(order.cards) || order.cards.length === 0) {
    return res.status(400).json({ error: "Invalid order payload" });
  }

  try {
    // ── Step 1: Find existing client by email (fallback: exact name) ─────────
    let clientPage = null;
    const filter = order.clientEmail
      ? { property: "Email", email: { equals: order.clientEmail } }
      : { property: "Name", title: { equals: order.clientName } };

    const found = await notion.databases.query({
      database_id: CLIENTS_DB,
      filter,
      page_size: 1,
    });
    if (found.results.length) clientPage = found.results[0];

    // ── Step 2: Create client if new ──────────────────────────────────────────
    if (!clientPage) {
      clientPage = await notion.pages.create({
        parent: { database_id: CLIENTS_DB },
        properties: {
          "Name":   { title: [{ text: { content: order.clientName } }] },
          ...(order.clientEmail && { "Email": { email: order.clientEmail } }),
          ...(order.clientPhone && { "Phone": { phone_number: order.clientPhone } }),
          "Status":      { select: { name: "Active" } },
          "Source":      { select: { name: "Vite Form" } },
          "Vite Synced": { checkbox: true },
          ...(order.waiverSignedAt && {
            "Signature Date": { date: { start: order.waiverSignedAt } },
          }),
          "Notes": {
            rich_text: [{
              text: { content: `Prefers: ${order.contactMethod || "?"} · Pays: ${order.paymentType || "?"}` },
            }],
          },
        },
      });
    }

    // ── Step 3: Create ONE batch for the whole order ──────────────────────────
    const total    = order.cards.reduce((s, c) => s + (SERVICE_PRICES[c.service] ?? 0), 0);
    const lastName = order.clientName.trim().split(/\s+/).slice(-1)[0];
    const monthYr  = new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" });

    const cardList = order.cards.map((c, i) => {
      const num  = c.cardNumber ? ` #${c.cardNumber}` : "";
      const year = c.year ? ` (${c.year})` : "";
      return `${i + 1}. ${c.cardName}${year}${num} — ${c.condition} — ${c.service} ($${SERVICE_PRICES[c.service] ?? "?"})`;
    }).join("\n").slice(0, 1900);

    const batchPage = await notion.pages.create({
      parent: { database_id: BATCHES_DB },
      properties: {
        "Batch":         { title: [{ text: { content: `${lastName} — ${order.cards.length} cards — ${monthYr}` } }] },
        "Client":        { relation: [{ id: clientPage.id }] },
        "Status":        { select: { name: "Received" } },
        "Priority":      { select: { name: "Standard" } },
        "Card Count":    { number: order.cards.length },
        "Price":         { number: total },
        "Received Date": { date: { start: new Date().toISOString() } },
        "Sync Source":   { select: { name: "Vite" } },
        "Notes":         { rich_text: [{ text: { content: cardList } }] },
      },
    });

    // Notion assigns the real order number automatically — read it back
    const uid = batchPage.properties?.["Order #"]?.unique_id;
    const orderNumber = uid ? `${uid.prefix}-${uid.number}` : null;

    console.log(`✓ Synced ${orderNumber || order.id} — ${order.cards.length} card(s) for ${order.clientName}`);

    // orderUrls kept for compatibility: update-status.js extracts page IDs from it.
    // It now contains the single batch page URL instead of per-card URLs.
    res.json({
      success:     true,
      clientUrl:   clientPage.url,
      orderUrls:   [batchPage.url],
      orderNumber,
      cardIds:     [],
    });

  } catch (err) {
    console.error("Sync error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};