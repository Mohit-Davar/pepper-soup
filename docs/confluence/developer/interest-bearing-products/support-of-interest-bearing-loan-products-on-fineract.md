<!-- Labels: developer, interest-bearing-products -->
# Interest-bearing loan products on Fineract

This publication documents the architecture, processing behavior, and verified operational guarantees for interest-bearing loan products as implemented within Pepper-Soup's Fineract-based loan ecosystem. The component boundaries span the core loan management domain (fineract-loan) and the progressive, interest-bearing extension (fineract-progressive-loan). The design guarantees described herein cover daily interest accrual, progressive EMI schedule generation, payoff calculations with accrued interest, dynamic rate tiering, complete payment allocation, and automated double-entry accounting, together with domain event publishing and operational controls. All behavior reflected here is derived from verified specifications and reference calculations provided for this feature. 

### Conceptual role and module boundaries

The interest-bearing loan product feature extends the standard lending model with capabilities that allows daily accrual of interest, progressive amortization, and a broader set of transactional controls and accounting flows. The progressive logic interacts with the core loan lifecycle, disbursing funds against principal, applying repayments to principal and accrued interest according to defined waterfall rules, and updating the general ledger . The component architecture anticipates integration with two primary modules:

- fineract-loan: manages core loan entities, disbursements, repayments, and baseline lifecycle transitions.
- fineract-progressive-loan: implements the enhanced amortization, daily interest accrual, schedule recalculation, and related lifecycle controls required for long-term installment products with variable accrual behavior.

In operation, the system supports a broad set of capabilities enumerated in the Core Functional Specifications ( Delivery) below. Those capabilities are realized through persistent state changes in the loan ledger, generation and replay of repayment schedules, and emissions of domain events and journal entries that reflect accruals, payments, waivers, and recalculations.

### Core functional scope ( Delivery)

The following capabilities are verified to be implemented for interest-bearing loan products. Each item describes behavior, the actor responsible, and its relevance to risk management, accounting, and customer-facing compliance.

1) 366-Day and Leap Year Interest Calculation
- The system fully supports both standard 365-day and actual 366-day leap year calculation conventions for regulatory compliance across all target regions. The day-count convention determines accrual periods used for interest calculations.

2) Progressive Loan EMI Calculation
- Progressive amortization formulas are implemented in the schedule generator. The implementation aligns daily compounding and simple interest accruals with core Fineract standards to form the EMI schedule.

3) Full Payoff Calculation with Accrued Interest
- Payoffs are computed as the outstanding principal plus accrued interest up to the exact settlement date, verifying the final settlement amount reflects the true accrual up to payoff.

4) Interest Rate Tiering by Balance Status
- Interest rates can be configured dynamically by installment and balance status (Current, Past Due, and Future), enabling tiered pricing aligned to repayment behavior.

5) Downpayment Allocation on Long-Term Loans
- Downpayments at loan origination allocate strictly against disbursed principal, preserving accurate principal outstanding and interest baselines.

6) Charge-off Non-Accrual Enforcement
- Interest accrual automatically stops on loans that are charged off or tagged with specified non-accrual flags, verifying regulatory and accounting consistency.

7) Fixed-Fee Installment Accrual
- Fixed fees are divided evenly across scheduled installments and accrue on a daily basis, supporting transparent fee accounting and daily interest impact.

8) Advance Payment Allocation
- Advance repayments allocate across accrued interest and principal according to progressive waterfall rules, verifying correct posting when early settlements occur.

9) Dedicated Interest Waiver Transaction
- A distinct interest waiver transaction type exists to waive accrued interest without impacting principal balances.

10) Secondary Interest Refund Transaction
- A dedicated secondary interest refund transaction type handles interest adjustments resulting from merchant refunds.

11) Posted Interest Transaction Accounting
- Dedicated posted-interest accrual events update the loan sub-ledger and General Ledger, verifying accurate representation of accrued interest movements.

12) Pause and Resume Interest Accrual
- Operational controls allow pausing daily interest accruals and resuming them in accordance with policy, enabling responsive policy enforcement.

13) Chargeback Handling on Interest Components
- Chargeback transactions properly adjust interest and principal allocations during reversal-replay, preserving integrity of prior allocations.

14) Chronological Reverse-Replay Engine
- Backdated transactions trigger automatic chronological reprocessing of interest accruals and balances to restore consistency with historical activity.

15) Renewal and Top-up Loan Linkage
- Renewal and top-up loans are linked to original loan accounts to preserve full accounting history and to maintain traceability of related balances.

16) Accelerated Charge-off Balance Due
- Charge-off enhancements accelerate all outstanding balances to become due immediately, reflecting the policy for non-performing assets.

17) Automated Due-Date Fees and Penalties
- On-due-date processing automatically evaluates and applies scheduled fees and penalties .

18) Backdated Interest Rate Modifications
- Interest rate modifications allow retroactive rate adjustments with automated schedule recalculation to reflect updated terms.

19) Extended API Surface
- Loan product and transaction capabilities include parameters for progressive interest-bearing loans, enabling extended interaction surfaces for clients and integrators.

20) Domain Event Publishing
- Domain events are published for all accrual events, payments, waivers, and schedule recalculations to allows external listeners and auditability.

21) Automated Journal Entries
- Double-entry accounting entries post automatically for interest accruals (Debit Interest Receivable, Credit Interest Income) and for payment allocations, verifying continuous alignment between sub-ledger, GL, and borrower activity.

These capabilities collectively establish a complete lifecycle for interest-bearing loans, covering accrual, scheduling, payments, refunds, waivers, and accounting postments. The following sections provide evidentiary details for the most mechanically defined aspects of these capabilities, drawn from the reference calculations and the explicit specification statements.

### Calculation references and rate limits

The calculation references establish caps and rate progression used by the system to validate and build compliant interest-bearing schedules. shows two cap scenarios, each with a defined effective rate limit and associated nominal rates across term lengths.

- 9.995% Limit
 - Effective Rate Limit: 0.09995
 - Loan Start Date: 1/1/23 (static)
 - Term and Nominal Rates observed:
 - 3-year terms: Nominal rate approximately 0.094820
 - 6-year terms: Nominal rate approximately 0.094866
 - 12-year terms: Nominal rate approximately 0.095052
 - 24-year terms: Nominal rate approximately 0.095220
 - The dataset includes tested combinations and outcomes labeled as SUCCESS across observed entries, with an accompanying range for transaction values (Txn Range: 0.01 - 98.99).

- 9.99% Limit
 - Effective Rate Limit: 0.09995
 - Loan Start Date: 1/1/23 (static)
 - Term and Nominal Rates observed:
 - 3-year terms: Nominal rate approximately 0.094772
 - 6-year terms: Nominal rate approximately 0.094833
 - 12-year terms: Nominal rate approximately 0.094995
 - 24-year terms: Nominal rate approximately 0.095140
 - The dataset records a mix of SUCCESS and additional statistics, with a total transaction sample size and a breakdown of successful vs failed attempts.

For reference, the associated calculation sheets show term-based rate points and a qualitative indication of success/failure for each tested combination. The effective rate limits reported are identical across the two limit cases (0.09995), with modest variations in nominal rates by term length. The calculations are used to validate that generated schedules and rate definitions remain within regulatory and product constraints during schedule generation and rate modification events.

<div class="param-grid" aria-label="Calculation reference blocks">
 <div class="param-card">
 <span class="param-label">9.995% Limit</span>
 <span class="param-value">Effective Rate Limit: 0.09995</span>
 </div>
 <div class="param-card">
 <span class="param-label">Loan Start Date</span>
 <span class="param-value">1/1/23</span>
 </div>
 <div class="param-card">
 <span class="param-label">Term</span>
 <span class="param-value">3, 6, 12, 24</span>
 </div>
 <div class="param-card">
 <span class="param-label">Nominal Rates (example)</span>
 <span class="param-value">3y: 0.094820; 6y: 0.094866; 12y: 0.095052; 24y: 0.095220</span>
 </div>
</div>

<div class="param-grid" aria-label="Calculation reference blocks (9.99% Limit)">
 <div class="param-card">
 <span class="param-label">9.99% Limit</span>
 <span class="param-value">Effective Rate Limit: 0.09995</span>
 </div>
 <div class="param-card">
 <span class="param-label">Term</span>
 <span class="param-value">3, 6, 12, 24</span>
 </div>
 <div class="param-card">
 <span class="param-label">Nominal Rates (example)</span>
 <span class="param-value">3y: 0.094772; 6y: 0.094833; 12y: 0.094995; 24y: 0.095140</span>
 </div>
</div>

<!-- Summary of validation counts from the calculation reference -->
<div class="calc-box" style="border:1px solid #ddd;padding:12px;margin:12px 0" aria-label="Validation counts">
 <div class="calc-title">Validation counts (illustrative excerpts)</div>
 <div class="calc-step"><strong>9.995% Limit:</strong> Term 3, 6, 12, 24 observed with SUCCESS outcomes in the tested subset.</div>
 <div class="calc-step"><strong>9.99% Limit:</strong> SUCCESS counts and fail counts shown; overall totals indicate mixed outcomes across tested combinations.</div>
</div>

### Failure/test data snippet (FAIL Txn Amounts)

To illustrate the testing surface: the calculation reference includes a sheet titled FAIL Txn Amounts, summarizing how many tested transactions failed vs. succeeded for each term and rate tier. A representative snapshot from the 9.99% limit section shows:

- Term: 3 years
- Sampled rows include both successful and failed attempts with associated rate figures: Successful Nominal Rate around 0.094461 and Successful Effective Rate around 0.060889; Fail Counts observed at 4395 and Successful Counts at 35201; Total sample size 39596 (100%).

These counts reflect validation behavior used during development to verify the system honors rate caps and schedule constraints across edge cases. They are presented here to document verified testing outcomes and are not instructions for production workflows.

<div class="table-wrap" aria-label="FAIL Txn Amounts (9.99% limit)">
 <table>
 <thead>
 <tr><th>Term</th><th>Nominal Rate</th><th>Successful Nominal Rate</th><th>Successful Effective Rate</th><th>Total</th><th>Success Count</th><th>Fail Count</th></tr>
 </thead>
 <tbody>
 <tr><td>3</td><td>0.094772</td><td>0.094461</td><td>0.060889</td><td>39596</td><td>35201</td><td>4395</td></tr>
 </tbody>
 </table>
</div>

### Domain events and accounting implications

The feature emits domain events for accrual events, payments, waivers, and schedule recalculations. While specific event type names are not enumerated in the reference data, the behavior is defined as publishing domain events to allows auditability and external listeners to react to accrual and recalculation activities. associated double-entry accounting behavior is specified: automated journal entries post automatically for interest accruals and payment allocations.

- Journal entries (double-entry):
 - Debit: Interest Receivable; Credit: Interest Income for accrual events.
 - Allocation of payments across principal and interest components is recorded with associated debits and credits to standard accounts, aligning with the posted accruals and schedule recalculations.

The following section enumerates core operational controls and edge cases that shape how the product behaves in production.

### Operational controls, validations, and edge cases

- Pause and resume accrual: Administrators can pause daily interest accruals and resume them per policy triggers, without loss of historical data.
- Charge-off handling: When a loan is charged off, accrual of interest ceases on that loan until policy-driven restoration or reversal occurs.
- Charge-off acceleration: Outstanding balances become due immediately upon charge-off, per policy enhancements described in the specifications.
- Backdated rate modifications: Rate changes retroactively affect the schedule and require automatic schedule recalculation to reflect updated terms.
- Schedule replay and reverse-replay: Backdated or corrective transactions trigger chronological reprocessing to maintain consistency in balances, accruals, and schedules.
- Renewal and top-up linkage: Renewal and top-up loans preserve linkage to the original loan for complete history and accounting traceability.
- Downpayments and fees: Initial downpayments apply strictly to the disbursed principal; fixed-fee installments accrue daily and are evenly distributed across the installment plan.
- Payoff with accrued interest: Payoffs at settlement date include accrued interest up to the settlement date and the remaining principal, verifying accurate closing balances.

### Summary of architectural and implementation implications

- The system provides an extended API surface to support progressive interest-bearing loans, but REST endpoint details are not enumerated in the evidentiary material here. Integrators should expect interactions that follows the extended feature set described in the reference specifications, including schedule recalculation triggers and events for accrual, payments, and waivers.
- Automatic posting to the General Ledger is a core guarantee, with posted-interest accrual events updating both the loan sub-ledger and the GL as part of the accounting flow.
- The design guarantees that each period’s opening balance equals the prior period’s closing balance, and that allocations reconcile with the transaction amounts, maintaining integrity across both the loan ledger and the general ledger.

### Quick example of the operational flow (conceptual)

The following narrative describes, at a high level, how a typical cycle progresses in an interest-bearing loan product, without exposing internal implementation details or source code:

- A loan is originated with a downpayment allocated against the disbursed principal. Daily accrual begins according to the applicable day-count convention (365 or 366 days).
- Each day, interest accrues on the outstanding principal. If a payment is made, the system applies the payment according to progressive waterfall rules: interest first, then accrued interest adjustments, then principal, and finally any applicable fees or penalties.
- If a modification occurs (rate change, renewal, or top-up), a schedule recalculation is performed to reflect the updated terms, and journal entries are generated to record the changes.
- When an accrual is paused, daily interest stops accruing until resumed. If the loan is charged off, accrual stops and the balance becomes due according to policy, with accelerated due balances if applicable.
- If there are backdated transactions, a reverse-replay mechanism reprocesses accruals in chronological order to verify consistency between balances, accruals, and the schedule.

These steps summarize the verified operating behavior and its accounting implications as described in the reference materials.

### Appendix: references to evidenced calculations and specifications

- Core Functional Specifications ( Delivery) enumerate the end-to-end capabilities, including 366-day/leap-year support, progressive EMI, payoff calculations, rate tiering, downpayments, non-accrual enforcement, accrual and scheduling behavior, and complete accounting.
- Reference Specifications (Interest Bearing Product Support) provide detailed coverage of the features and behaviors required for the product, including domain events and automated journal entries.
- Calculation Reference data (DE GPL Effective Rate Below 9995 v3) documents rate-limit behavior and observed nominal rates across term lengths for both 9.995% and 9.99% limit scenarios, along with observed allocation of results and success/failure metrics in the test dataset. The effective rate limit used in both scenarios is 0.09995, with term-based nominal rates published for comparative purposes.

This document synthesizes the verified product behavior into a coherent architectural and operational reference intended for backend Java engineers, system integrators, and Fineract contributors who implement or integrate with Pepper-Soup’s interest-bearing loan capabilities.