# Apollo Insurance Leads: final expense + mortgage protection
**Stage:** synthetic local demo only. Not live, not deployed, and no consumer contact information is processed.

## Two distinct funnels
- **Final expense life insurance:** optional life insurance coverage intended to support final expenses. Policies can contain waiting periods, limitations, underwriting and exclusions. No government-program implication or guaranteed approval.
- **Mortgage protection life insurance:** optional life insurance that may support surviving beneficiaries with mortgage-related expenses. This is NOT private mortgage insurance (PMI), a mortgage loan, or a guarantee that an outstanding mortgage will be paid off.

Both funnels require verified licensed and appointed producers in the intended states, and insurer/carrier-approved advertising.

## Current demonstration
1. `/final-expense` and `/mortgage-protection`: two educational, non-collecting landing page previews.
2. Demo pipeline categories and two fictional insurance partners. `demoInsuranceQualified` is **not evidence of actual insurance licensing**.
3. Routing requires consumer's specifically expressed interest in that insurance product, provenance flag, explicit consent for each simulated partner and channel, product coverage, region and capacity.
4. The demo refuses personal identifiers and sends no messages. All example customers, insurance agents, pricing and opt-ins are fabricated fixtures.
5. GitHub CI executes syntax, engine, simulated API and landing page tests.

## Live intake blueprint (NOT YET ENABLED)
Create two insurer/agency-approved intake pages featuring:
- One clear CTA, short optional stepper, accessible mobile UI, privacy policy, licensed agency identity, and transparent insurance disclosures.
- Ask only name, verified telephone/email, city or ZIP, product interest and communication preference once **secure storage, privacy notices, consent capture and security review** exist. Do not request health histories, SSNs, policy numbers, credit scores, mortgage balances or government IDs through marketing landing pages.
- Prior express written consent as applicable to automated/telemarketing channels, with exact text/version, specifically identified parties, purpose, source URL, time, channel, revocation method, recording/audit evidence and lawful sharing. Avoid prechecked boxes. Assess TCPA, FTC TSR and the Florida Telephone Solicitation Act and applicable other-state laws.
- Authenticated, encrypted CRM storage, access controls, retention/deletion, source provenance checks, dedupe, revocation propagation and DNC/suppression before any outreach.
- Agent route only after independent license, appointment, state and product authorization verification. Do not claim a consumer is qualified, approved or insured based on a marketing form.

## Mortgage and new homeowner sourcing
- Start with self-initiated, consented homeowner inquiries and licensed data partners, with contractual permissions and auditable disclosures.
- If address autocomplete is added, use a reputable licensed provider triggered only by user entry. Do not expose a full address in URLs or conversion parameters.
- Public property records or a sale date do not constitute permission to call, text, or share a phone number. Do not scrape contact details and append phone numbers for blind autodialing.

## Meta (Facebook and Instagram) setup, not connected
- Insurance campaigns in the United States are generally treated under Meta's Financial products and services special ad category. Confirm business/advertiser eligibility and restrictions in Ads Manager before publishing.
- Only create Pixel and server-side CAPI `Lead` events after authorization and lawful tracking; use a shared `event_name` and `event_id` for deduplication.
- For a website source, document `action_source`, `event_source_url`, and `client_user_agent`; do not put personal financial, health, insurance, homeowner or household details into URLs or custom event data.
- Separate consumer contact/marketing consent from analytics/data sharing choices as legally required. Have privacy counsel approve consent notices, data minimization, Meta's restricted business tools rules and suppression before wiring real events.
- **No Meta Pixel, CAPI outbound connection, token, API credentials, campaign or ad spending is created in this branch.**

## First revenue validation
1. Verify actual life insurance agency license(s), producer appointments, service areas, approved copy, disclosure obligations, and who legally owns the lead relationship.
2. Interview at least 2-3 properly appointed potential buyers for each vertical. Obtain documented acceptance criteria and pricing tests.
3. Deploy secure, approved funnel only after compliance and security gates. A real lead must carry replayable consent evidence.
4. Measure actual consented CPL, qualified-contact rate, appointment rate, policies submitted, issued policies, refunds/disputes and net contribution margin. No forecasts shown as verified results.
5. Add post-consent lead verification, human-in-loop outreach and controlled routing. Enable Meta CAPI/CRM/dialer only after specific integrations and authorization are verified.

## Regulatory reminders
The FCC's proposed one-to-one consent rule was vacated by the Eleventh Circuit in 2025, but broader TCPA and state consent obligations still apply; using individual, clear recipient-specific consent remains an appropriate conservative design. The FTC's Telemarketing Sales Rule includes DNC/suppression requirements. Florida generally requires insurance solicitation and advertising by appropriately licensed/appointed participants, and restricts outcome-contingent referral compensation paid to unlicensed parties.

**No deployment, outreach, lead sale, token transaction, or carrier offer is authorized in this change.**
