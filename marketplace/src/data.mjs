import { CONSENT_POLICY, CONSENT_PURPOSE } from "./engine.mjs";

export const partners = Object.freeze([
  { id: "P-ATLAS", name: "Atlas Property Studio", categories: ["real_estate"], regions: ["Miami-Dade", "Broward"], channels: ["email"], active: true, openSlots: 5, demoLeadPriceUsd: 75 },
  { id: "P-CROWN", name: "Crown Realty Desk", categories: ["real_estate"], regions: ["Miami-Dade", "Palm Beach"], channels: ["email", "phone"], active: true, openSlots: 4, demoLeadPriceUsd: 60 },
  { id: "P-ORBIT", name: "Orbit Home Services", categories: ["home_services"], regions: ["Miami-Dade", "Broward", "Palm Beach"], channels: ["email", "phone"], active: true, openSlots: 8, demoLeadPriceUsd: 35 },
  { id: "P-HELIX", name: "Helix Business Systems", categories: ["business_services"], regions: ["Miami-Dade", "Broward"], channels: ["email"], active: true, openSlots: 3, demoLeadPriceUsd: 90 },
  { id: "P-SOL", name: "Sol Coverage Desk [Fictional]", categories: ["final_expense"], regions: ["Miami-Dade", "Broward", "Palm Beach"], channels: ["email", "phone"], active: true, openSlots: 6, demoLeadPriceUsd: 48, demoInsuranceQualified: true, demoInsuranceStates: ["FL"], demoInsuranceProducts: ["final_expense"] },
  { id: "P-HOME", name: "Homestead Protection Desk [Fictional]", categories: ["mortgage_protection"], regions: ["Miami-Dade", "Broward", "Palm Beach"], channels: ["email", "phone"], active: true, openSlots: 6, demoLeadPriceUsd: 65, demoInsuranceQualified: true, demoInsuranceStates: ["FL"], demoInsuranceProducts: ["mortgage_protection"] }
]);

const recentDate = (daysAgo) => new Date(Date.now() - daysAgo * 86400000).toISOString();
const approval = (ids, channels = ["email"], daysAgo = 2, revokedAt = null) => ({
  status: "granted",
  source: "direct_demo_form",
  purpose: CONSENT_PURPOSE,
  policyVersion: CONSENT_POLICY,
  recordedAt: recentDate(daysAgo),
  revokedAt,
  channels,
  approvedPartnerIds: ids
});

export const leads = Object.freeze([
  { id: "L-1042", title: "Condo relocation inquiry", category: "real_estate", region: "Miami-Dade", intent: "ready", urgencyDays: 5, verifiedNeed: true, budgetConfirmed: true, sourceVerified: true, contactChannel: "email", consent: approval(["P-ATLAS", "P-CROWN"]) },
  { id: "L-1043", title: "Home AC replacement quote", category: "home_services", region: "Broward", intent: "ready", urgencyDays: 3, verifiedNeed: true, budgetConfirmed: false, sourceVerified: true, contactChannel: "phone", consent: approval(["P-ORBIT"], ["phone"]) },
  { id: "L-1044", title: "CRM automation evaluation", category: "business_services", region: "Miami-Dade", intent: "comparing", urgencyDays: 15, verifiedNeed: true, budgetConfirmed: true, sourceVerified: true, contactChannel: "email", consent: approval(["P-HELIX"]) },
  { id: "L-1045", title: "Renovation discovery", category: "home_services", region: "Palm Beach", intent: "ready", urgencyDays: 7, verifiedNeed: true, budgetConfirmed: true, sourceVerified: true, contactChannel: "email", consent: approval(["P-ORBIT"], ["email"], 7, recentDate(1)) },
  { id: "L-1046", title: "Commercial lease research", category: "real_estate", region: "Broward", intent: "exploring", urgencyDays: 90, verifiedNeed: false, budgetConfirmed: false, sourceVerified: true, contactChannel: "email", consent: null },
  { id: "L-1047", title: "Business growth consultation", category: "business_services", region: "Broward", intent: "ready", urgencyDays: 10, verifiedNeed: true, budgetConfirmed: false, sourceVerified: true, contactChannel: "email", consent: approval(["P-HELIX"]) },
  { id: "L-1048", title: "Final expense information inquiry [Synthetic]", category: "final_expense", region: "Miami-Dade", intent: "ready", urgencyDays: 10, verifiedNeed: true, budgetConfirmed: false, sourceVerified: true, contactChannel: "email", insuranceInterestConfirmed: true, consent: approval(["P-SOL"], ["email"]) },
  { id: "L-1049", title: "Mortgage protection inquiry [Synthetic]", category: "mortgage_protection", region: "Broward", intent: "comparing", urgencyDays: 21, verifiedNeed: true, budgetConfirmed: true, sourceVerified: true, contactChannel: "email", insuranceInterestConfirmed: true, consent: approval(["P-HOME"], ["email"]) }
]);

// All companies, opportunities, values, and consent events above are fictional demo fixtures.
