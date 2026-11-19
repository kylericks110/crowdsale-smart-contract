/**
 * Apollo Leads matching engine.
 * This is deterministic rules-based research, NOT a trained AI prediction.
 * It does not collect, store, or transmit real lead identity or contact details.
 */
export const CATEGORIES = Object.freeze([
  { id: "real_estate", name: "Real estate" },
  { id: "home_services", name: "Home services" },
  { id: "business_services", name: "Business services" }
]);
export const REGIONS = Object.freeze(["Miami-Dade", "Broward", "Palm Beach"]);
export const INTENTS = Object.freeze(["exploring", "comparing", "ready"]);
export const CHANNELS = Object.freeze(["email", "phone"]);
export const CONSENT_PURPOSE = "partner_referral";
export const CONSENT_POLICY = "apollo-marketplace-v1";
const MS_DAY = 86400000;
const CONSENT_MAX_DAYS = 90;

export function scoreLead(lead) {
  const factors = [
    { label: "Buying intent", points: { exploring: 10, comparing: 23, ready: 36 }[lead.intent] ?? 0 },
    { label: "Timing", points: lead.urgencyDays <= 7 ? 24 : lead.urgencyDays <= 30 ? 16 : 5 },
    { label: "Need verified", points: lead.verifiedNeed === true ? 18 : 0 },
    { label: "Budget confirmed", points: lead.budgetConfirmed === true ? 12 : 0 },
    { label: "Source verified", points: lead.sourceVerified === true ? 10 : 0 }
  ];
  const score = Math.min(100, factors.reduce((sum, item) => sum + item.points, 0));
  return { score, tier: score >= 80 ? "HOT" : score >= 55 ? "WARM" : "NURTURE", factors };
}

/** Explicit sharing permission is assessed separately from lead quality. */
export function consentStatus(lead, now = new Date()) {
  const consent = lead.consent;
  if (!consent || consent.status !== "granted") return { valid: false, reason: "No affirmative consent recorded" };
  if (consent.revokedAt) return { valid: false, reason: "Consent withdrawn" };
  if (consent.policyVersion !== CONSENT_POLICY || consent.purpose !== CONSENT_PURPOSE) {
    return { valid: false, reason: "Consent scope is not approved for referrals" };
  }
  if (consent.source !== "direct_demo_form") return { valid: false, reason: "Consent source is unverified" };
  if (!Array.isArray(consent.approvedPartnerIds) || consent.approvedPartnerIds.length === 0) {
    return { valid: false, reason: "No partners explicitly selected" };
  }
  if (!Array.isArray(consent.channels) || !consent.channels.includes(lead.contactChannel)) {
    return { valid: false, reason: "Contact channel not authorized" };
  }
  const recorded = new Date(consent.recordedAt);
  const timestamp = now instanceof Date ? now.getTime() : new Date(now).getTime();
  if (!Number.isFinite(recorded.getTime()) || !Number.isFinite(timestamp)) {
    return { valid: false, reason: "Consent evidence invalid" };
  }
  const age = timestamp - recorded.getTime();
  if (age < 0 || age > CONSENT_MAX_DAYS * MS_DAY) {
    return { valid: false, reason: "Consent outside permitted demo validity period" };
  }
  return { valid: true, reason: "Explicit simulated approval recorded" };
}

export function evaluatePartner(lead, partner, now = new Date()) {
  const problems = [];
  const consent = consentStatus(lead, now);
  if (!consent.valid) problems.push(consent.reason);
  if (!partner.active) problems.push("Partner is inactive");
  if (!partner.categories.includes(lead.category)) problems.push("Service category mismatch");
  if (!partner.regions.includes(lead.region)) problems.push("Outside service area");
  if (!partner.channels.includes(lead.contactChannel)) problems.push("Partner does not accept selected channel");
  if (partner.openSlots <= 0) problems.push("Partner capacity reached");
  if (!lead.consent?.approvedPartnerIds?.includes(partner.id)) {
    problems.push("Partner was not explicitly approved");
  }
  return { partnerId: partner.id, eligible: problems.length === 0, reasons: problems };
}

export function matchLead(lead, partners, now = new Date()) {
  const quality = scoreLead(lead);
  const reviews = partners.map(partner => ({ ...evaluatePartner(lead, partner, now), partner }));
  const eligible = reviews.filter(result => result.eligible)
    .map(result => ({
      partnerId: result.partner.id,
      partnerName: result.partner.name,
      category: lead.category,
      region: lead.region,
      leadScore: quality.score,
      tier: quality.tier,
      demoLeadPriceUsd: result.partner.demoLeadPriceUsd,
      notes: ["Approved by simulated customer", "Category and region match", "Capacity available"]
    }))
    .sort((a, b) => a.demoLeadPriceUsd - b.demoLeadPriceUsd || a.partnerName.localeCompare(b.partnerName));
  const excluded = reviews.filter(result => !result.eligible)
    .map(result => ({ partnerId: result.partnerId, partnerName: result.partner.name, reasons: result.reasons }));
  return { quality, eligible, excluded, consent: consentStatus(lead, now) };
}

export function summarize(leads, partners, now = new Date()) {
  const outcomes = leads.map(lead => matchLead(lead, partners, now));
  return {
    demo: true,
    leads: leads.length,
    partners: partners.length,
    hot: outcomes.filter(x => x.quality.tier === "HOT").length,
    eligiblePairs: outcomes.reduce((sum, x) => sum + x.eligible.length, 0),
    consentBlocked: outcomes.filter(x => !x.consent.valid).length,
    modelRevenueUsd: outcomes.reduce((sum, x) => sum + (x.eligible[0]?.demoLeadPriceUsd ?? 0), 0),
    disclaimer: "Synthetic examples only. Model value is not actual or forecast revenue."
  };
}

export function makeDemoLead(input, partners, now = new Date()) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Expected a demo lead object");
  }
  const allowed = new Set([
    "demoMode", "category", "region", "intent", "urgencyDays", "verifiedNeed",
    "budgetConfirmed", "sourceVerified", "contactChannel", "consentGiven", "approvedPartnerIds"
  ]);
  if (Object.keys(input).some(key => !allowed.has(key))) {
    throw new Error("Unknown fields refused; do not submit personal information");
  }
  if (input.demoMode !== true) throw new Error("Explicit demoMode required");
  if (!CATEGORIES.some(x => x.id === input.category)) throw new Error("Invalid category");
  if (!REGIONS.includes(input.region)) throw new Error("Invalid region");
  if (!INTENTS.includes(input.intent)) throw new Error("Invalid intent");
  if (!Number.isInteger(input.urgencyDays) || input.urgencyDays < 1 || input.urgencyDays > 180) {
    throw new Error("Invalid urgency");
  }
  for (const field of ["verifiedNeed", "budgetConfirmed", "sourceVerified", "consentGiven"]) {
    if (typeof input[field] !== "boolean") throw new Error("Invalid boolean for " + field);
  }
  if (!CHANNELS.includes(input.contactChannel)) throw new Error("Invalid channel");
  if (!Array.isArray(input.approvedPartnerIds) || input.approvedPartnerIds.length > partners.length) {
    throw new Error("Invalid approved partners");
  }
  const known = new Set(partners.map(partner => partner.id));
  if (new Set(input.approvedPartnerIds).size !== input.approvedPartnerIds.length ||
      input.approvedPartnerIds.some(id => typeof id !== "string" || !known.has(id))) {
    throw new Error("Unknown or repeated partner approval");
  }
  if (input.consentGiven !== true && input.approvedPartnerIds.length) {
    throw new Error("Partner approvals require affirmative simulated consent");
  }

  return {
    id: "SIMULATION",
    title: "Synthetic opportunity",
    category: input.category,
    region: input.region,
    intent: input.intent,
    urgencyDays: input.urgencyDays,
    verifiedNeed: input.verifiedNeed,
    budgetConfirmed: input.budgetConfirmed,
    sourceVerified: input.sourceVerified,
    contactChannel: input.contactChannel,
    consent: input.consentGiven ? {
      status: "granted",
      source: "direct_demo_form",
      purpose: CONSENT_PURPOSE,
      policyVersion: CONSENT_POLICY,
      recordedAt: now.toISOString(),
      revokedAt: null,
      channels: [input.contactChannel],
      approvedPartnerIds: input.approvedPartnerIds
    } : null
  };
}
