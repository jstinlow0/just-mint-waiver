// api/update-status.js
// Fire-and-forget status updates on Restoration Batches pages
// when the owner advances an order in the app.
//
// App status  →  Notion batch status
//   pending      → Received
//   in_progress  → In Restoration
//   complete     → Ready
//   picked_up    → Complete

import { Client } from "@notionhq/client";

const STATUS_MAP = {
  pending:     "Received",
  in_progress: "In Restoration",
  complete:    "Ready",
  picked_up:   "Complete",
};

function extractPageId(url) {
  const m = (url || "").replace(/-/g, "").match(/([a-f0-9]{32})/i);
  return m ? m[1] : null;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const notion = new Client({ auth: process.env.NOTION_TOKEN });
  const { orderUrls, status } = req.body;

  const ids = (orderUrls || []).map(extractPageId).filter(Boolean);
  if (!ids.length) return res.json({ ok: true, skipped: true });

  const notionStatus = STATUS_MAP[status] || "Received";
  const isDone       = status === "picked_up";

  try {
    await Promise.all(ids.map(id =>
      notion.pages.update({
        page_id: id,
        properties: {
          "Status": { select: { name: notionStatus } },
          ...(isDone ? {
            "Completed Date": { date: { start: new Date().toISOString() } },
          } : {}),
        },
      })
    ));
    res.json({ ok: true });
  } catch (err) {
    console.error("Status update error:", err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
};
