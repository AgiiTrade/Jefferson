# Siebel → Oracle OCI Cloud Modernization
### A one-page brief from Agii.ca AI Modernizer

---

## The opportunity

Siebel CRM is end-of-life on most upgrade roadmaps. Customers who already run on Oracle have two practical OCI destinations:

| Path | Target on OCI | Best when… |
|---|---|---|
| **Lift & shift** | Siebel CRM on OCI Compute (Marketplace image) | You need to retire on-prem data centres fast, keep Siebel as-is for now, and pay only OCI consumption. |
| **Replatform** | Oracle APEX + Autonomous Database on OCI, integrated via OIC | Custom Siebel extensions / public-sector case workflows that need to stay Oracle-native but ditch the Siebel runtime. |
| **Replace** | Oracle Fusion CX (Sales / Service Cloud) on OCI | Standard CRM use cases — sales, service, marketing — where you can adopt SaaS and retire customization. |

Most real engagements end up as a **mix**: lift-and-shift the runtime to OCI on day 1, then incrementally retire modules into Fusion CX or APEX over 12–24 months.

---

## Why OCI specifically (not AWS/Azure)

1. **Native Oracle DB + Autonomous DB** on OCI = no data-egress tax, zero re-licensing of Oracle DB, BYOL credits apply.
2. **"Siebel on OCI" Marketplace image** is a supported, Oracle-blessed lift-and-shift target — no platform-port risk.
3. **OIC (Oracle Integration Cloud)** has out-of-the-box Siebel adapters — fastest integration glue for hybrid cutover.
4. **Public-sector compliance**: OCI Government Regions (Canada included) cover federal/provincial workloads that AWS GovCloud doesn't.
5. **Cost**: Oracle Universal Credits + Support Rewards typically beat AWS/Azure for Oracle-heavy estates by 25–40%.

---

## What Agii AI Modernizer does for this path

Same 4-phase pipeline we use for AS/400 → AWS, applied to Siebel → OCI:

1. **Discover** — parse SIF, eScript, configuration trees, integration objects, workflows → structured AST.
2. **Map** — AI-assisted target mapping: workflow → OIC integration, eScript → APEX/PLSQL or Fusion CX customization, repository objects → Autonomous DB schema.
3. **Transform** — generate OCI-ready artifacts: APEX apps, OIC flows, Autonomous DB DDL, Terraform for the OCI tenancy, Fusion CX configuration packs.
4. **Verify** — side-by-side regression suite + evidence pack for Oracle license / audit / steering committee.

Pilot deliverable in 30 days: working OCI tenancy, 1 representative Siebel module migrated end-to-end, ROI + cutover plan.

---

## Q&A — what stakeholders usually ask

**Q. Is Oracle OCI actually a real, current product?**
Yes. OCI = Oracle Cloud Infrastructure, Oracle's IaaS/PaaS competitor to AWS/Azure/GCP. Toronto and Montreal regions are GA; Canadian Government region also available.

**Q. Will Oracle support Siebel on OCI?**
Yes — Oracle publishes Siebel reference architectures on OCI and ships supported Marketplace images. Premier Support continues; Sustaining Support runs through 2034 per current Oracle policy.

**Q. Do we have to re-license Oracle Database?**
No. BYOL applies, and Universal Credits / Support Rewards typically reduce net cloud spend on Oracle-heavy estates.

**Q. How is this different from your existing "Siebel → Salesforce" track?**
Salesforce is a *replacement* track (rip-and-replace SaaS). OCI is the *Oracle-native modernization* track — same data, same compliance posture, modern runtime. Customers who can't or won't leave Oracle pick this one.

**Q. What about Siebel → Oracle PCO Cloud (public-sector case management)?**
PCO is a Fusion application running on OCI. So "Siebel → PCO" is a *specialization of* Siebel → OCI, focused on public-sector case workflows (e.g. ServiceOntario, MPBSD). We treat PCO as one of the target options inside the OCI track.

**Q. How long does a real migration take?**
30-day pilot. 6–9 months for a mid-size Siebel estate (≤2,000 business components) to first production cutover. 12–24 months for the full retirement.

**Q. What's the typical ROI story?**
- Eliminate on-prem Siebel infrastructure: $400K–$1.2M/yr depending on footprint
- Cut Siebel customization maintenance: 40–60% reduction in BAU dev hours
- Avoid forced Salesforce re-licensing for departments that don't need it
- OCI Universal Credits offset 25–40% of net new cloud cost vs AWS/Azure

**Q. Who on the customer side needs to be at the table?**
CIO/CTO sponsor, Siebel platform lead, Oracle license/procurement, security/compliance, and one business owner per Siebel module in scope.

---

## Use cases we'll lead with

1. **Insurance — Atlantic Insurance pattern** — Siebel claims + customer 360 → Fusion Service Cloud on OCI, Autonomous DB for analytics, OIC for legacy adapters.
2. **Public sector — ServiceOntario / MPBSD pattern** — Siebel Public Sector → Oracle PCO (case management) on OCI, with Canadian sovereign region.
3. **Telco / Utilities** — Siebel CRM + order management → Fusion CX + Oracle OIC, lift-and-shift Siebel runtime to OCI as bridge during the 18-month transition.
4. **Financial services** — Siebel Wealth/Banking custom extensions → APEX on Autonomous DB, retire Siebel workflow engine, keep Oracle compliance posture.

---

## Next step

30-day paid pilot: 1 Siebel module, migrated end-to-end to OCI, with evidence pack and ROI model. Fixed scope, fixed price.

*Contact: accounts@agii.ca · https://agii.ca/ai-modernizer*
