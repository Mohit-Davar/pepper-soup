<!-- Labels: user, settlement -->
# Settlement Plan

Settlement Plan is a feature within the Charge-off, Write-off and Settlement workflow that allows re-aging of loans and generation of revised repayment schedules when accounts qualify for settlement. It supports multiple re-aging scenarios, including simple re-aging, chargebacks, reverse replay (backdated repayments), and undo repayment flows. The feature is designed to produce a transparent, auditable sequence of transactions and a refreshed repayment plan that follows the remaining balance and policy constraints. Users across operations, loan officers, branch managers, and credit agents benefit from a consistent, rule-based approach to resolving aged loans through settlement.

### How Settlement Plan fits into the workflow
- The Settlement Plan operates on a re-aging premise: it resets the aging status of an account and creates a new amortization schedule targeted to the outstanding balance.
- The inputs that drive the new plan are exposed in the settlement interface as re-aging parameters, including the start date, the number of installments, and the monthly cadence.
- The system supports several known working patterns (as evidenced in the reference data):
 - Simple re-aging, yielding evenly spaced installments that cover the remaining principal.
 - Re-aging after a chargeback event, which adjusts the installment amount to reflect revised indebtedness.
 - Reverse replay scenarios, which model backdated repayments and subsequent re-aging to restore a current-valuation repayment path.
 - Undo repayment paths, which reflect reversal events and their impact on the landing schedule.

### Access and navigation
To access Settlement Plan, follow the navigation path used in the application: Charge-off, Write-off and Settlement > Settlement > Settlement Plan. Once opened, you work with the re-aging parameters to create or adjust a settlement-based repayment plan. The following steps describe typical interactions and the visible outcomes you should expect after each action.

1) Open the Settlement Plan page from the navigation path. The system presents the Settlement Plan interface with a section labeled Re-aging parameters and a repayment schedule area.
- Expected outcome: The page loads with the current loan state and a draft re-aging configuration area ready for entry.

2) In the Re-aging parameters section, enter the core inputs:
- **re-age start date**: e.g., 3/1/22
- **No of Installments**: e.g., 6
- **Frequency**: e.g., every 1 Month
- Confirmed entries populate the related fields in the schedule area.
- Expected outcome: The system derives a new installment plan cadence based on the inputs and displays the calculated schedule skeleton.

3) Review or adjust the Installment Dates and Principal allocations as presented in the generated repayment schedule. The schedule reflects a monthly cadence aligned to the start date and number of installments.
- Expected outcome: The per-installment principal allocation, EMI, and due dates are visible for review. For a simple re-aging example, the reference shows six installments aimed to cover the outstanding balance after downpayment.

4) Save or confirm the Settlement Plan configuration. The system commits the new repayment plan and updates the customer’s account to reflect the refreshed schedule.
- Expected outcome: The updated repayment schedule is visible in the customer’s loan view, with opening balances, principal allocations, and the final closing balance reconciled to zero .

5) If an edge condition applies (for example, a chargeback or a backdated repayment), follow the platform’s flow for that scenario as standard for the case:
- Chargeback: the settlement pathway updates the re-aging parameters to reflect the revised indebtedness, typically altering the installment amount to maintain coverage of the revised balance.
- Reverse replay / Undo repayment: the system shows alternative timelines and installment allocations consistent with the backdated or reversed events.
- Expected outcome: The repayment schedule and all associated transaction lines reflect the scenario-specific changes and continue to balance against the remaining obligation.

### What the reference calculations show (Re-aging use cases)
The Calculation Reference provides concrete examples of how re-aging behaves across several scenarios. The examples center on the re-aging of a previously disbursed loan with a down payment, followed by a re-aged plan that redefines monthly installments to cover the outstanding balance under different conditions.

- Simple re-aging scenario (Settlement)
 - Highlights a start date of 3/1/22 with 6 installments and a monthly cadence.
 - The re-aging parameter expressed in the reference is 62.50 (per installment), and the installment dates appear in monthly succession after the start date.
 - In this scenario, the outstanding balance after the down payment is 375, and six installments of 62.50 each fully amortize that amount (6 × 62.50 = 375).
 - EMI values associated to each installment are shown as 62.50 with no separate Interest or Fees components in the reference, indicating a straight principal repayment schedule.
 - Result: The new repayment schedule covers the remaining balance with six equal principal payments, reconciling to zero at the end of the term.

- Chargeback scenario
 - After the same initial structure (start date 3/1/22, 6 installments), a chargeback of 125 is introduced on 2/28/22, altering the balance dynamic.
 - The re-aging parameters in this scenario are 187.50 per installment with six installments (187.50 × 6 = 1,125).
 - Result: The updated plan creates a larger monthly installment amount to cover the revised indebtedness resulting from the chargeback event, while maintaining the cadence and number of installments.

- Reverse replay scenarios (scenario-1 and scenario-2)
 - These scenarios demonstrate backdated repayment events and their impact on re-aging. They show per-installment allocations around 83.33 in parts of the timeline, with subsequent adjustments (for example, 41.67 in later periods) as the plan accommodates the backdated and subsequent events.
 - The reference marks the re-aging start date as 3/1/22 with six installments and monthly cadence, but the installment amounts vary across the sequences to reflect the reverse replay adjustments.
 - Result: The settlement plan adapts the installment flow to reflect backdated payments and re-aging, producing a revised schedule that maintains overall balance reconciliation while capturing the timing changes.

- Undo repayment / reverse replay (additional variant)
 - Another variant demonstrates undoing a payment and then applying a reverse replay re-aging, where the per-installment allocations exhibit alternating patterns (e.g., 83.33 then 41.67 in successive periods), all under the same six-installment, monthly cadence.
 - Result: The plan accommodates the reversal and re-aging events while preserving the requirement that the sum of installments equals the revised outstanding balance.

To illustrate these patterns, the reference uses explicit numbers for the per-installment amounts in each scenario (for example, 62.50, 187.50, 83.33, and 41.67) and shows how the cadence and counts of installments remain constant while the allocation and total numbers shift with each scenario.

### Calculation and integrity notes
The Settlement Plan’s calculations are governed by the scenario inputs and the resulting repayment schedule must satisfy core integrity rules. The reference data emphasizes the following financial integrity principles:
- Each period’s opening balance must equal the previous period’s closing balance.
- Payment allocations must reconcile with the transaction amount that created or modified the balance.
- Remaining cash and outstanding dues must reconcile as the plan advances through installments.
- Where available, journal entries must balance when debit and credit data are present for settlement-related events.
- Intermediate calculations, running balances, totals, precision, and rounding must be verified against the documented rules; use standard rounding conventions such as HALF_UP or HALF_EVEN as evidenced by the data.
- Do not introduce figures, dates, or scenarios that are not supported by the reference data.
- If numerical is incomplete or ambiguous, describe the verified rule in prose rather than inventing a figure.

#### Calculation representation examples seen in the reference
<div class="calc-box">
 <div class="calc-title">Simple re-aging calculation (illustrative)</div>
 <div class="calc-step"><strong>Scenario:</strong> Re-age start date 3/1/22, 6 installments, monthly cadence</div>
 <div class="calc-step"><strong>Inputs:</strong> Start date 3/1/22; No of Installments 6; Frequency every 1 Month</div>
 <div class="calc-step"><strong>Per-installment amount:</strong> 62.50</div>
 <div class="calc-step"><strong>Installment dates (example pattern):</strong> monthly after start date</div>
 <div class="calc-step calc-result"><strong>Result:</strong> 6 × 62.50 = 375.00 total to be collected, covering the outstanding balance after down payment</div>
</div>

#### Summary table of representative parameters
<table>
 <tr><th>Scenario</th><th>Start date</th><th>Installments</th><th>Frequency</th><th>Per-installment</th><th>Total</th></tr>
 <tr><td>Simple re-aging</td><td>3/1/22</td><td>6</td><td>Every 1 Month</td><td>62.50</td><td>375.00</td></tr>
 <tr><td>Chargeback</td><td>3/1/22</td><td>6</td><td>Every 1 Month</td><td>187.50</td><td>1,125.00</td></tr>
</table>

### Edge cases and exception scenarios evidenced in the reference
The reference data includes several non-standard flows that operations staff may encounter:
- Chargeback scenarios that adjust the re-aging parameters to reflect revised indebtedness after a chargeback event.
- Reverse replay scenarios that model backdating of repayments and subsequent re-aging to restore a contemporary repayment path.
- Undo repayment scenarios that reflect the reversal of a repayment and the associated re-aging adjustments.

In all cases, the settlement plan must maintain coherence across the timeline, preserve the integrity rules described above, and provide a clear, auditable trail of transactions and schedule generations.

### Integrity and validation quick reference
- Each period’s opening balance must equal the previous period’s closing balance.
- Payment allocations must reconcile with the transaction amount.
- Remaining cash and outstanding dues must reconcile.
- Journal entries must balance when debit and credit data are available.
- Verify intermediate calculations, running balances, totals, precision, and rounding.
- Use rounding conventions as evidenced, such as HALF_UP or HALF_EVEN.
- Never invent figures, rates, dates, balances, or dummy scenarios.
- When numerical is insufficient, explain the verified rule in prose.

### Diagram: Settlement Plan decision and flow (high level)
```
stateDiagram-v2
 [*] --> SettlementPlan
 SettlementPlan --> SimpleReaging
 SettlementPlan --> ChargebackScenario
 SettlementPlan --> ReverseReplay
 SettlementPlan --> UndoRepayment
 SimpleReaging --> [*]
 ChargebackScenario --> [*]
 ReverseReplay --> [*]
 UndoRepayment --> [*]
```

This diagram summarizes the operational pathways evidenced in the reference data. Each node represents a known, documented path through the Settlement Plan when invoked under the associated conditions.