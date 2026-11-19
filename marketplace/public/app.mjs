const api = async (path, options = {}) => {
  const response = await fetch(path, { cache: "no-store", ...options });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Unable to load demo data");
  return data;
};

const state = { leads: [], partners: [], current: null, summary: null };
const $ = selector => document.querySelector(selector);

function node(tag, className = "", text = "") {
  const result = document.createElement(tag);
  if (className) result.className = className;
  result.textContent = text;
  return result;
}
function append(parent, ...children) { children.forEach(item => parent.append(item)); return parent; }
function row(label, value, kind = "") {
  const wrap = node("div", "detail-row");
  const key = node("span", "", label), val = node("strong", kind, String(value));
  append(wrap, key, val);
  return wrap;
}
function textLabel(category) {
  return ({ real_estate: "Real estate", home_services: "Home services", business_services: "Business services", final_expense: "Final expense", mortgage_protection: "Mortgage protection" })[category] || category;
}
function toast(message) {
  const el = $("#toast"); el.textContent = message; el.classList.add("show");
  window.setTimeout(() => el.classList.remove("show"), 5000);
}
function setTab(tab) {
  document.querySelectorAll("[data-view]").forEach(item => item.classList.toggle("hidden", item.dataset.view !== tab));
  document.querySelectorAll("[data-tab]").forEach(item => {
    item.classList.toggle("active", item.dataset.tab === tab);
    item.setAttribute("aria-current", item.dataset.tab === tab ? "page" : "false");
  });
}
function renderMetrics(data) {
  const items = [
    { label: "DEMO OPPORTUNITIES", value: data.leads, caption: "Synthetic inbound requests" },
    { label: "HIGH-INTENT EXAMPLES", value: data.hot, caption: "Score ≥ 80, rules-based", css: "highlight" },
    { label: "APPROVED PAIRINGS", value: data.eligiblePairs, caption: "Consent + partner fit", css: "emphasis" },
    { label: "ILLUSTRATIVE VALUE", value: "$" + data.modelRevenueUsd, caption: "NOT earned or forecast revenue", css: "highlight" }
  ];
  const dest = $("#metrics"); dest.replaceChildren();
  items.forEach(item => {
    const card = node("div", "metric-card " + (item.css || ""));
    append(card, node("span", "", item.label), node("strong", "", String(item.value)), node("small", "", item.caption));
    dest.append(card);
  });
}
function renderPipeline() {
  const tbody = $("#pipeline-rows"); tbody.replaceChildren();
  state.leads.forEach(lead => {
    const tr = document.createElement("tr"); tr.dataset.id = lead.id;
    tr.classList.toggle("selected", lead.id === state.current);
    tr.tabIndex = 0;
    tr.setAttribute("role", "button");
    tr.setAttribute("aria-label", "Inspect " + lead.title);
    const name = node("td");
    append(name, node("span", "lead-name", lead.title), node("span", "lead-id", lead.id + " / " + textLabel(lead.category)));
    const region = node("td", "", lead.region);
    const quality = node("td"); quality.append(node("span", "score-pill " + lead.tier, lead.score + " · " + lead.tier));
    const matches = node("td"); matches.append(node("span", lead.eligibleMatches > 0 ? "match-num" : "no", String(lead.eligibleMatches)));
    append(tr, name, region, quality, matches);
    const inspect = () => inspectLead(lead.id).catch(error => toast(error.message));
    tr.addEventListener("click", inspect);
    tr.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); inspect(); } });
    tbody.append(tr);
  });
}
async function inspectLead(id) {
  state.current = id;
  renderPipeline();
  const result = await api("/api/matches?leadId=" + encodeURIComponent(id));
  const lead = state.leads.find(item => item.id === id);
  const box = $("#lead-detail");
  box.replaceChildren();
  append(box, node("h3", "", lead.title), node("p", "inspector-description", lead.region + " · " + textLabel(lead.category)));
  const score = node("div", "score-main");
  append(score, node("strong", "", String(result.quality.score)), node("span", "", "/100 QUALIFICATION SCORE"));
  box.append(score);
  const meter = node("div", "meter"); const bar = node("div", "meter-bar");
  bar.style.width = result.quality.score + "%"; meter.append(bar); box.append(meter);
  box.append(node("div", "inspector-rule"));
  append(box, row("Urgency", lead.urgencyDays + " days"),
    row("Verified intent", lead.intent.toUpperCase()),
    row("Consent status", result.consent.valid ? "VALID FOR DEMO" : "BLOCKED", result.consent.valid ? "yes" : "no"),
    row("Eligible recipients", result.eligible.length));
  const tags = node("div", "tag-stack");
  result.eligible.forEach(match => tags.append(node("span", "mini-tag", match.partnerName)));
  if (result.eligible.length === 0) tags.append(node("span", "mini-tag", "No eligible routing"));
  box.append(tags);
  if (!result.consent.valid) box.append(node("div", "warning", result.consent.reason));
  box.append(node("p", "inspector-description", "No contact records, emails, calls or purchases are processed in this demo."));
}
function renderPartners() {
  const grid = $("#partners-grid"); grid.replaceChildren();
  state.partners.forEach(partner => {
    const card = node("article", "panel partner-card");
    append(card, node("span", "partner-category", partner.categories.map(textLabel).join(" / ")),
      node("h3", "partner-name", partner.name), node("span", "partner-status", "● " + partner.openSlots + " demo capacity slots"));
    const tags = node("div", "tag-stack");
    partner.regions.forEach(region => tags.append(node("span", "mini-tag", region)));
    card.append(tags);
    const meta = node("div", "partner-meta");
    append(meta, row("Accepted channels", partner.channels.join(" / ")),
      row("Sample price", "$" + partner.demoLeadPriceUsd + " / lead"));
    card.append(meta);
    grid.append(card);
  });
}
function selectOptions(element, values) {
  values.forEach(entry => {
    const option = document.createElement("option");
    option.value = typeof entry === "string" ? entry : entry.id;
    option.textContent = typeof entry === "string" ? entry : entry.name;
    element.append(option);
  });
}
function renderApprovalChoices() {
  const dest = $("#approved-partners"); dest.replaceChildren();
  state.partners.forEach(partner => {
    const label = node("label");
    const input = document.createElement("input");
    input.type = "checkbox"; input.name = "approvedPartner"; input.value = partner.id;
    input.disabled = !$("#consentGiven").checked;
    append(label, input, node("span", "", partner.name));
    dest.append(label);
  });
}
function renderSimulation(result) {
  const box = $("#simulation-result"); box.replaceChildren();
  append(box, node("h3", "result-title", "Qualification score"), node("div", "result-highlight", result.quality.score + " / 100"));
  append(box, node("p", "result-sub", "Tier: " + result.quality.tier + ". This is an explainable heuristic, not AI-predicted conversion."));
  box.append(node("div", "inspector-rule"));
  result.quality.factors.forEach(factor => box.append(row(factor.label, "+" + factor.points)));
  box.append(node("div", "inspector-rule"));
  box.append(node("h3", "", "Authorized matches (" + result.eligible.length + ")"));
  if (result.eligible.length === 0) {
    box.append(node("div", "warning", "No routing authorized. " + (result.consent.valid ? "Review partner eligibility, category and coverage." : result.consent.reason)));
  } else {
    result.eligible.forEach(match => {
      const card = node("div", "match-card");
      const info = node("div");
      append(info, node("strong", "", match.partnerName), node("small", "", "Explicitly approved · matches service and region"));
      append(card, info, node("span", "match-price", "$" + match.demoLeadPriceUsd + " DEMO"));
      box.append(card);
    });
  }
  box.append(node("p", "result-sub", "No real contact, consent, sale or payment was created. All pricing is hypothetical."));
}
async function simulate(event) {
  event.preventDefault();
  const form = $("#sim-form"), submit = form.querySelector("button[type=submit]");
  const approvedPartnerIds = [...form.querySelectorAll('input[name="approvedPartner"]:checked')].map(x => x.value);
  const payload = {
    demoMode: true,
    category: $("#category").value,
    region: $("#region").value,
    intent: $("#intent").value,
    urgencyDays: Number($("#urgency").value),
    contactChannel: $("#channel").value,
    verifiedNeed: $("#verifiedNeed").checked,
    budgetConfirmed: $("#budgetConfirmed").checked,
    sourceVerified: $("#sourceVerified").checked,
    insuranceInterestConfirmed: $("#insuranceInterestConfirmed").checked,
    consentGiven: $("#consentGiven").checked,
    approvedPartnerIds
  };
  submit.disabled = true; submit.textContent = "Evaluating…";
  try {
    const result = await api("/api/simulate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    renderSimulation(result);
  } catch (error) { toast(error.message); }
  finally { submit.disabled = false; submit.textContent = "Evaluate matching rules ↗"; }
}

async function boot() {
  document.querySelectorAll("[data-tab]").forEach(button => button.addEventListener("click", () => setTab(button.dataset.tab)));
  $("#hero-simulate").addEventListener("click", () => setTab("simulation"));
  $("#consentGiven").addEventListener("change", renderApprovalChoices);
  const queryProduct = new URLSearchParams(window.location.search).get("product");
  if (queryProduct === "final_expense" || queryProduct === "mortgage_protection") setTab("simulation");
  $("#sim-form").addEventListener("submit", simulate);
  const [summary, leadData, partnerData] = await Promise.all([
    api("/api/summary"), api("/api/leads"), api("/api/partners")
  ]);
  state.summary = summary; state.leads = leadData.leads; state.partners = partnerData.partners;
  renderMetrics(summary);
  renderPartners();
  selectOptions($("#category"), [
    { id: "real_estate", name: "Real estate" },
    { id: "home_services", name: "Home services" },
    { id: "business_services", name: "Business services" },
    { id: "final_expense", name: "Final expense life insurance" },
    { id: "mortgage_protection", name: "Mortgage protection life insurance" }
  ]);
  selectOptions($("#region"), ["Miami-Dade", "Broward", "Palm Beach"]);
  if (queryProduct === "final_expense" || queryProduct === "mortgage_protection") {
    $("#category").value = queryProduct;
    $("#insuranceInterestConfirmed").checked = true;
  }
  renderApprovalChoices();
  if (state.leads.length) await inspectLead(state.leads[0].id);
}
boot().catch(error => toast("Unable to load local demo: " + error.message));
