# OWC Procurement and Publication Source Reconciliation

**Reconciliation date:** 14 September 2026  
**Scope:** OWC website / integrated digital platform procurement sources, CPPS/OWC public articles, and the previously referenced distinct OWC RFI.

## Purpose

This register separates primary OWC procurement documents from supporting public reporting and from derived technical-design material. It exists to prevent an EOI/TOR, RFQ, public article, internal design document or unrelated RFI from being silently relabelled as another source type.

The governing evidence rule is simple: where a source is not located, record the gap. Do not invent its content and do not infer that another document is equivalent merely because it covers similar subject matter.

## Reconciled source register

| Source | Classification | Evidence status | Reconciliation position |
|---|---|---|---|
| `Terms of Reference.docx` — *Development of Office of Workers Compensation (OWC) Website* | **Primary OWC procurement source — TOR / EOI-stage requirements** | **LOCATED and reviewed** | The document is headed `TERMS OF REFERENCE`, but its procurement function is expressly the EOI/shortlisting stage. Section 6 requires interested companies/professionals to submit an **EOI package**, gives the filename convention `CompanyName_OWC_EOI_WEB_2026.pdf`; Section 8 gives the June 2026 EOI timetable; Section 9 says the EOI is for shortlisting only and shortlisted vendors will later submit detailed technical and financial proposals. It must therefore be cited as the OWC TOR supporting the EOI stage, **not as an RFI**. |
| June 2026 public EOI notice — *Expression of Interest / Development of OWC Website* | **Public procurement notice supporting the EOI stage** | **PUBLICLY CORROBORATED** | Publicly indexed reposts of the notice describe the same project, 30 June 2026 closing date, `wsproject@owc.gov.pg`, Eruel William contact and the same OWC approving officers. The repost states its reference was The National newspaper. The original newspaper notice was not independently retrieved from The National's searchable web archive in this reconciliation, so the repost is supporting evidence rather than the primary procurement authority. The primary requirements remain the located OWC TOR. |
| `Expression of interest announcement design.png` | **Bidder/submission collateral** | **LOCATED and reviewed** | A Lagoon Technologies PNG Limited submission graphic dated 29 May 2026. It demonstrates Lagoon's EOI response/presentation history, but it is **not** an OWC-issued procurement notice and must not be used as primary procurement authority. |
| `OWC_Website_Development_RFQ.docx` — Ref. `OWC/RFQ/Website Development 2026` | **Primary OWC procurement source — RFQ / shortlisted stage** | **LOCATED and reviewed** | Explicitly headed `Request For Quotation (RFQ)`, dated 10 September 2026 and marked `Closed Procurement (Shortlisted Bidders Only)`. It defines the five workstreams, presentation requirements, commercial matrix and evaluation weighting. It is a later shortlisted-bidder procurement stage and is not the EOI/TOR or an RFI. |
| NBC PNG — *OWC launches Claims Processing and Payment System* (10 September 2025) | **Public article / CPPS current-state evidence** | **LOCATED and reviewed** | Supports the historical/current-state fact that OWC publicly launched CPPS as an online claims-processing/tracking initiative and described its purpose as reducing paper-based delays, inefficiencies and fraud. URL: https://www.nbc.com.pg/post/26324/owc-launches-claims-processing-and-payment-system |
| The National — *Office launches website, new computerised system* (11 March 2015) | **Historical public article / earlier system evidence** | **LOCATED and reviewed** | Shows that OWC had an earlier website and computerised processing/payment initiative in 2015. This is historical context only and must not be treated as evidence that the current 2026 CPPS/API/hosting environment is unchanged or production-verified. URL: https://www.thenational.com.pg/office-launches-website-new-computerised-system/ |
| Department of Labour & Industrial Relations — OWC statutory-office page | **Official institutional background** | **LOCATED and reviewed** | Confirms OWC's statutory role and core workers-compensation functions. It supports institutional context, not the technical contract of the 2026 platform. URL: https://www.labour.gov.pg/statutory-offices/office-of-the-workers-compensation/ |
| `OWC_Integrated_System_Formal_Design_Proposal.docx` | **Derived technical design** | **LOCATED** | Derived from the TOR, RFQ, repository and technical review. Useful as design evidence, but it is not an original procurement source. Its source register already identifies the TOR and RFQ as primary inputs. |
| `OWC_Integrated_Enterprise_Architecture_Design_v2_Drupal.docx` | **Derived consolidated architecture** | **LOCATED** | Derived technical baseline. Its earlier source register recorded a distinct OWC RFI and recent articles as gaps. This reconciliation now resolves the article/write-up gap but **does not resolve the distinct RFI source itself**. |
| Separately identifiable OWC `Request for Information (RFI)` for this website/platform | **Potential primary procurement/market-research source** | **NOT LOCATED — EXTERNAL SOURCE GAP** | No separate OWC RFI was found in the accessible Library/conversation set, repository search, or targeted public-web search. Library title search for `RFI` returned an unrelated **Magisterial Services Request for Information**, which is excluded. Broad Library results mentioning RFI were predominantly unrelated e-Government Procurement material. Public web searches for an OWC PNG RFI returned unrelated U.S. DOL/OWCP RFIs and no matching PNG OWC source. The absence of a located copy does **not** prove that no RFI ever existed; it means its contents cannot be reconciled or relied upon until an identifiable source is supplied or recovered. |

## Procurement-stage relationship

The evidence supports the following sequence without requiring any source relabelling:

1. **TOR / EOI stage — June 2026.** The located TOR defines the business/technical requirements and explicitly instructs bidders to submit an EOI package for shortlisting.
2. **Shortlisting.** The TOR states that shortlisted vendors will be invited to submit detailed technical and financial proposals.
3. **RFQ / shortlisted bidder stage — September 2026.** The located RFQ is explicitly restricted to shortlisted bidders and expands the delivery into five enterprise workstreams with a commercial/evaluation framework.
4. **Implementation/design response.** The repository architecture and formal design documents translate the TOR/RFQ into implementation controls. They are derived evidence, not procurement authority.

A separate RFI is **not required to explain this evidenced EOI → RFQ progression**, but because prior OWC technical documents explicitly referenced a separate RFI, that reference remains an unresolved source dependency until the document is identified.

## Public article reconciliation

The earlier architecture source gap for “recent OWC published articles/write-ups” is now materially resolved:

- NBC PNG provides a dated public report on the 2025 CPPS launch and its intended online claims/tracking role.
- The National provides historical evidence of an earlier OWC website/computerised processing and payment system in 2015.
- The Department of Labour & Industrial Relations provides official institutional/mandate context.

These sources are appropriate for **context and current-state discovery**, but none should be used to invent the live 2026 CPPS schema, API contract, credentials, payment logic, database topology or production authorization. Those still require direct authoritative discovery/acceptance.

## Distinct RFI search record

The reconciliation included:

- Library semantic/content search for `Office of Workers Compensation`, `Request for Information`, `RFI`, `OWC`, `CPPS` and website terms;
- Library title-only searches for `RFI` and `Request for Information`;
- repository search for `RFI`;
- targeted public-web searches for `Office of Workers Compensation` + `RFI` / `Request for Information` / website / 2026;
- cross-checking the existing enterprise-architecture source register and outstanding-task record.

Result: **no separately identifiable PNG OWC RFI for this website/platform was located**. Unrelated NPC/e-GP RFIs, Magisterial Services RFI material and U.S. Department of Labor OWCP RFIs were deliberately excluded.

## Final reconciliation decision

**Repository reconciliation status: COMPLETE.**  
**External source status: DISTINCT OWC RFI NOT LOCATED.**

The TOR/EOI, RFQ and public article classes are now distinguished and reconciled. No OWC design or implementation claim should depend on the missing RFI. If a genuine RFI is later supplied, it must be appended to this register and checked for deltas against the TOR, RFQ, architecture, implementation backlog and acceptance requirements before its content is treated as authoritative.
