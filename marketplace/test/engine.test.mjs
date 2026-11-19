import test from "node:test";
import assert from "node:assert/strict";
import { partners, leads } from "../src/data.mjs";
import { scoreLead, matchLead, evaluatePartner, consentStatus, makeDemoLead, summarize, CONSENT_POLICY } from "../src/engine.mjs";

const now = new Date();
const lead = leads[0];

test("high intent lead scores HOT with explainable factors", () => {
  const score = scoreLead(lead);
  assert.equal(score.score, 100);
  assert.equal(score.tier, "HOT");
  assert.equal(score.factors.reduce((n, x) => n + x.points, 0), 100);
});

test("correct partners and region match when explicitly approved", () => {
  const result = matchLead(lead, partners, now);
  assert.deepEqual(result.eligible.map(x => x.partnerId), ["P-CROWN", "P-ATLAS"]);
  assert.equal(result.eligible.length, 2);
});

test("mismatched service is never eligible", () => {
  const result = evaluatePartner(lead, partners[2], now);
  assert.equal(result.eligible, false);
  assert.ok(result.reasons.includes("Service category mismatch"));
});

test("missing consent blocks every match", () => {
  const result = matchLead(leads[4], partners, now);
  assert.equal(result.eligible.length, 0);
  assert.match(result.consent.reason, /No affirmative/);
});

test("withdrawn consent blocks every match", () => {
  const result = matchLead(leads[3], partners, now);
  assert.equal(result.eligible.length, 0);
  assert.match(result.consent.reason, /withdrawn/);
});

test("unapproved partner cannot receive a lead despite a strong score", () => {
  const switched = { ...lead, consent: { ...lead.consent, approvedPartnerIds: ["P-CROWN"] } };
  const result = matchLead(switched, partners, now);
  assert.deepEqual(result.eligible.map(x => x.partnerId), ["P-CROWN"]);
});

test("stale consent expires", () => {
  const stale = { ...lead, consent: { ...lead.consent, recordedAt: new Date(now.getTime() - 91 * 86400000).toISOString() } };
  assert.equal(consentStatus(stale, now).valid, false);
});

test("unsupported consent policy blocks routing", () => {
  const broken = { ...lead, consent: { ...lead.consent, policyVersion: "legacy" } };
  assert.equal(consentStatus(broken, now).valid, false);
  assert.equal(CONSENT_POLICY, "apollo-marketplace-v1");
});

test("partner without capacity is excluded", () => {
  const partner = { ...partners[1], openSlots: 0 };
  assert.equal(evaluatePartner(lead, partner, now).eligible, false);
});

test("demo engine rejects unknown personal data fields", () => {
  assert.throws(() => makeDemoLead({ demoMode: true, email: "person@example.test" }, partners), /Unknown fields/);
});

test("demo lead cannot claim partner approvals without simulated consent", () => {
  const input = { demoMode: true, category: "real_estate", region: "Miami-Dade", intent: "ready", urgencyDays: 5,
    verifiedNeed: true, budgetConfirmed: true, sourceVerified: true,
    contactChannel: "email", consentGiven: false, approvedPartnerIds: ["P-CROWN"] };
  assert.throws(() => makeDemoLead(input, partners), /affirmative/);
});

test("demo lead produces a permitted match only after affirmative opt-in", () => {
  const input = { demoMode: true, category: "real_estate", region: "Miami-Dade", intent: "ready", urgencyDays: 5,
    verifiedNeed: true, budgetConfirmed: true, sourceVerified: true,
    contactChannel: "email", consentGiven: true, approvedPartnerIds: ["P-CROWN"] };
  const synthetic = makeDemoLead(input, partners, now);
  assert.deepEqual(matchLead(synthetic, partners, now).eligible.map(x => x.partnerId), ["P-CROWN"]);
});

test("summary labels modeled revenue as simulated", () => {
  const result = summarize(leads, partners, now);
  assert.equal(result.demo, true);
  assert.equal(result.leads, 6);
  assert.ok(result.consentBlocked >= 2);
  assert.match(result.disclaimer, /not actual/);
});
