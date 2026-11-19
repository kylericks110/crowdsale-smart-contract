import test from "node:test";
import assert from "node:assert/strict";
import { startServer } from "../src/server.mjs";

test("local demo APIs and privacy controls", async () => {
  const app = await startServer({ port: 0 });
  try {
    const home = await fetch(app.url + "/");
    assert.equal(home.status, 200);
    assert.match(home.headers.get("content-type"), /text\/html/);
    const html = await home.text();
    assert.match(html, /Apollo Leads/);
    assert.match(html, /id="sim-form"/);

    const css = await fetch(app.url + "/styles.css");
    assert.equal(css.status, 200);
    assert.match(await css.text(), /--gold:/);
    const script = await fetch(app.url + "/app.mjs");
    assert.equal(script.status, 200);
    assert.match(await script.text(), /renderSimulation/);

    const health = await fetch(app.url + "/api/health");
    assert.equal(health.status, 200);
    const info = await health.json();
    assert.equal(info.acceptsRealLeads, false);

    const leads = await fetch(app.url + "/api/leads");
    assert.equal(leads.status, 200);
    assert.equal(leads.headers.get("cache-control"), "no-store");
    const data = await leads.json();
    assert.equal(data.leads.length, 6);
    assert.equal(data.demo, true);
    assert.ok(!JSON.stringify(data).includes("@"));

    const consentless = await fetch(app.url + "/api/simulate", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({
        demoMode: true, category: "home_services", region: "Miami-Dade", intent: "ready", urgencyDays: 2,
        verifiedNeed: true, budgetConfirmed: true, sourceVerified: true,
        contactChannel: "email", consentGiven: false, approvedPartnerIds: []
      })
    });
    assert.equal(consentless.status, 200);
    assert.equal((await consentless.json()).eligible.length, 0);

    const realData = await fetch(app.url + "/api/simulate", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ demoMode: true, email: "real@person.example" })
    });
    assert.equal(realData.status, 400);

    const unknown = await fetch(app.url + "/missing");
    assert.equal(unknown.status, 404);
  } finally {
    await app.close();
  }
});
