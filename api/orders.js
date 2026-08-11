// api/orders.js
// Returns batch status from Notion so the app can pull changes back in.
// Notion is the source of truth for status.

import { Client } from "@notionhq/client";

const BATCHES_DB = "378f4ca1-a2ac-4403-8456-7be887514e68";

// Notion status → app status
const STATUS_MAP = {
  "Received":       "pending",
  "On Hold":        "pending",
  "Assessing":      "in_progress",
  "In Restoration": "in_progress",
  "Quality Check":  "in_progress",
  "Ready":          "complete",
  "Complete":       "complete",
  "Shipped":        "picked_up",
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  if (!process.env.NOTION_TOKEN) {
    return res.status(500).json({ error: "NOTION_TOKEN not configured" });
  }

  const notion = new Client({ auth: process.env.NOTION_TOKEN });

  try {
    const out = [];
    let cursor;

    do {
      const page = await notion.databases.query({
        database_id: BATCHES_DB,
        page_size: 100,
        ...(cursor && { start_cursor: cursor }),
      });

      for (const row of page.results) {
        const notionStatus = row.properties?.["Status"]?.select?.name || null;
        const uid          = row.properties?.["Order #"]?.unique_id;
         
        

        out.push({
          pageId:      row.id.replace(/-/g, ""),
          appStatus:   notionStatus ? (STATUS_MAP[notionStatus] || null) : null,
          orderNumber: uid ? `${uid.prefix}-${uid.number}` : null,
        });
      }

      cursor = page.has_more ? page.next_cursor : null;
    } while (cursor);

    return res.status(200).json(out);

  } catch (err) {
    console.error("orders error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}