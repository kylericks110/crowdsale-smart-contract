import http from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { partners, leads } from "./data.mjs";
import { matchLead, makeDemoLead, scoreLead, summarize, consentStatus } from "./engine.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const assets = new Map([
  ["/", ["public/index.html", "text/html; charset=utf-8"]],
  ["/styles.css", ["public/styles.css", "text/css; charset=utf-8"]],
  ["/app.mjs", ["public/app.mjs", "text/javascript; charset=utf-8"]]
]);
const securityHeaders = {
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
  "referrer-policy": "no-referrer",
  "x-frame-options": "DENY",
  "content-security-policy": "default-src 'none'; connect-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"
};

function send(res, status, payload, mime = "application/json; charset=utf-8") {
  res.writeHead(status, { ...securityHeaders, "content-type": mime });
  res.end(mime.startsWith("application/json") ? JSON.stringify(payload) : payload);
}

async function readDemoBody(req) {
  let size = 0;
  let body = "";
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 4096) throw new Error("Payload too large");
    body += chunk.toString("utf8");
  }
  if (!req.headers["content-type"]?.startsWith("application/json")) throw new Error("JSON content type required");
  try { return JSON.parse(body); } catch { throw new Error("Invalid JSON"); }
}

export function requestHandler(req, res) {
  (async () => {
    const url = new URL(req.url || "/", "http://localhost");
    if (req.method === "GET" && url.pathname === "/api/health") {
      return send(res, 200, { ok: true, environment: "local_demo", acceptsRealLeads: false, outboundMessaging: false });
    }
    if (req.method === "GET" && url.pathname === "/api/summary") {
      return send(res, 200, summarize(leads, partners));
    }
    if (req.method === "GET" && url.pathname === "/api/partners") {
      return send(res, 200, { demo: true, partners });
    }
    if (req.method === "GET" && url.pathname === "/api/leads") {
      return send(res, 200, {
        demo: true,
        leads: leads.map(lead => ({
          id: lead.id, title: lead.title, category: lead.category, region: lead.region,
          intent: lead.intent, urgencyDays: lead.urgencyDays,
          contactChannel: lead.contactChannel,
          ...scoreLead(lead),
          consent: consentStatus(lead),
          eligibleMatches: matchLead(lead, partners).eligible.length
        }))
      });
    }
    if (req.method === "GET" && url.pathname === "/api/matches") {
      const lead = leads.find(item => item.id === url.searchParams.get("leadId"));
      return lead ? send(res, 200, { demo: true, leadId: lead.id, title: lead.title, ...matchLead(lead, partners) })
        : send(res, 404, { error: "Unknown demo lead" });
    }
    if (req.method === "POST" && url.pathname === "/api/simulate") {
      let input;
      try { input = await readDemoBody(req); }
      catch (error) { return send(res, 400, { error: error.message }); }
      try {
        const lead = makeDemoLead(input, partners);
        return send(res, 200, { demo: true, ...matchLead(lead, partners), notice: "No lead saved or transmitted. No marketing permission created." });
      } catch (error) { return send(res, 400, { error: error.message }); }
    }
    if (req.method === "GET" && assets.has(url.pathname)) {
      const [file, mime] = assets.get(url.pathname);
      const content = await readFile(join(root, file), "utf8");
      return send(res, 200, content, mime);
    }
    return send(res, 404, { error: "Not found" });
  })().catch(() => { if (!res.headersSent) send(res, 500, { error: "Internal demo error" }); else res.destroy(); });
}

export async function startServer({ port = 3000, host = "127.0.0.1" } = {}) {
  const server = http.createServer(requestHandler);
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, resolve);
  });
  const address = server.address();
  return { server, url: `http://${host}:${address.port}`, close: () => new Promise(resolve => server.close(resolve)) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startServer({ port: Number(process.env.PORT || 3000) }).then(app => {
    console.log(`Apollo Leads LOCAL DEMO: ${app.url}`);
    console.log("Synthetic opportunities only; no external connections or real customer data.");
  }).catch(error => { console.error(error.message); process.exitCode = 1; });
}
