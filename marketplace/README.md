# Apollo Leads | Consent-first lead marketplace MVP

**Status: runnable local prototype, synthetic data only. Not production, not a deployed service, not a cryptocurrency.**

### Mission

Start with a useful business: help companies qualify inbound purchase intent and match it with *explicitly approved* partners. Monetization is a business hypothesis, not measured sales. An on-chain token is intentionally **out of the transaction path** until there is a justified, lawful use case.

### Try it locally

Requires Node.js 22+; no npm install or external credentials.

```bash
cd marketplace
npm test
npm run check
npm start
# Open http://127.0.0.1:3000
```

The server binds to loopback only and supplies synthetic example records. It does not send emails, SMS, make calls, buy ads, connect a CRM, collect real personal information or persist any lead data.

### MVP features

- Apollo dark/gold operations dashboard for sample leads and fictional partner companies.
- Explainable *rules-based* qualification score from buyer intent, urgency, need verification, budget and source verification. **Not real AI, not predictive performance, not validated on customer outcomes.**
- Category, service-area, partner capacity and contact-channel eligibility checks.
- Explicit simulated approval for each eligible recipient plus recorded scope/source, revocation and expiration gates.
- Interactive lead simulation with NO personal identity/contact fields; server rejects unknown fields.
- Local demo read-only API: `GET /api/health`, `GET /api/summary`, `GET /api/leads`, `GET /api/partners`, `GET /api/matches?leadId=L-1042`. `POST /api/simulate` evaluates an in-memory synthetic example.
- Tests via Node built-in runner and a separate GitHub Action.

### What is not implemented

Authentication, tenant isolation, encrypted persistent storage, consent capture suitable for actual outreach, payments, invoicing, billing disputes, CRM sync, verified lead-source acquisition, demand validation, production observability, AI models, or live partner messaging. Do **not** deploy the demo server publicly or enter actual lead data.

### Business-model starting hypothesis

Target narrowly: B2B real-estate, home-services and business-service partners. Sell leads only after obtaining verifiable consumer consent and ensuring partner-specific compliance. Test a flat monthly SaaS fee versus per-qualified-lead fees with legitimate buyers and proof of outcome, **not** fabricated revenue metrics. Displayed demo values and organizations are fictional.

### Regulatory gate

Lead routing, telemarketing, calls/texts, consent, Do Not Call, privacy and advertising require jurisdiction- and channel-specific legal review. The U.S. FCC's previously proposed one-to-one consent rule was vacated in 2025, but existing TCPA, TSR and state obligations still apply. Never infer that a simulated checkbox is legally sufficient. Integrations with Apollo Signals trading-client accounts and financial payouts are out of scope.

### Project boundaries

This app lives in an isolated `marketplace/` folder of a fork of the historical LeadCoin crowdsale repository. This does not grant trademark rights over LeadCoin or ownership of the original LDC token. The previous `apollo-v2/` token prototype is independent, and the original `master` legacy smart contracts remain unchanged.

Read `docs/PRODUCTION_GATES.md` and `docs/GO_TO_MARKET.md` before proceeding.
