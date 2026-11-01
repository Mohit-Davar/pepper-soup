<!-- Labels: user, interest-transactions -->
# Interest Waiver/Interest Payment Waiver transaction type

This page documents the Interest Waiver and Interest Payment Waiver transaction type as implemented in Pepper-Soup. It describes what the feature does, how it behaves in common cases, the business rules that govern it, and verified sample calculations and workflows that operations staff, loan officers, branch managers, and credit agents observe in daily servicing. The feature is accessed under the navigation path: Interest and Accrual > Interest transactions > Interest Waiver/Interest Payment Waiver transaction type.

### What the feature does and why it matters

The system supports waiver transactions that reduce or reallocate the interest component of a payment, potentially along with principal in a controlled manner. This capability helps agents respond to customer service needs by adjusting how a scheduled installment is applied to a loan’s outstanding balance. In practice, a waiver transaction is recorded as a payment event with an amount and a specified allocation between interest and principal, and it updates both the repayment schedule and the loan balance . The feature applies to the servicing workflow and is visible in the loan’s repayment schedule and balance after the transaction posts.

The reference material demonstrates multiple waiver scenarios, illustrating how the waiver amount is allocated between interest and principal, how the balance changes over time, and how subsequent installments are processed. The scenarios also show that waivers can be accompanied by other actions (such as adding charges or reversing a waiver) and that the system maintains a consistent, trackable sequence of events in the repayment schedule.

### Roles and benefits

- Credit customer service agents can apply approved waivers to help customers manage payments and keep accounts current.
- Loan officers and operations staff gain a verified mechanism to reflect negotiated adjustments in the borrower’s repayment schedule.
- Branch managers and portfolio managers see the resulting impact on balances, installments, and the schedule for reporting and reconciliation.

### How the waiver works (concepts and rules)

- A waiver transaction is posted against a loan with a specific date and amount. The transaction is categorized as a waiver type (Interest Waiver or Interest Payment Waiver) and contributes to the loan’s repayment schedule.
- The allocation of the waiver amount can follow different orders, affecting how much is applied to interest versus principal. In the reference scenarios, two common allocation orders are shown:
 - Allocation order: interest, then principal.
 - Allocation order: principal, then interest.
 The order chosen affects which portion of the waiver reduces the principal and which portion covers (or waives) interest within the same payment, and it changes the timing of how the loan balance declines.
- After posting, the system updates:
 - The repayment schedule entries for the affected installment dates (principal, interest, EMI, due, and amounts paid).
 - The outstanding loan balance is adjusted to reflect principal reductions and any interest payments made through the waiver.
- The reference material demonstrates a sequence where the initial disbursement is followed by a waiver that applies to principal and interest, then subsequent standard installments that continue to reduce the balance until payoff.

### Worked example: Scenario 1 from Payment Waiver scenarios (v2)

The following example is grounded in the Calculation Reference: Payment Waiver scenarios_v2. It demonstrates a waiver on the first period’s payment, followed by standard installments until the loan is fully paid. All figures are taken from the referenced data and shown with two-decimal precision as in the source.

<div class="param-grid">
 <div class="param-card"><span class="param-label">Initial balance</span><span class="param-value">$690.00</span></div>
 <div class="param-card"><span class="param-label">Waiver date</span><span class="param-value">2/1/22</span></div>
 <div class="param-card"><span class="param-label">Waiver amount</span><span class="param-value">$250.00</span></div>
 <div class="param-card"><span class="param-label">Allocation</span><span class="param-value">Principal 230 | Interest 20</span></div>
</div>

<div class="calc-box">
 <div class="calc-title">Calculation</div>
 <div class="calc-step"><strong>Formula:</strong> Allocation of waiver amount to interest and principal per the configured order, updating the repayment schedule and balance.</div>
 <div class="calc-step"><strong>Substitution:</strong> Disbursement of $690.00 on 1/1/22; Waiver posted on 2/1/22 for $250.00 with $230.00 applied to principal and $20.00 to interest; subsequent installments of $250.00 posted on 3/1/22 and 4/1/22 with $230.00 to principal and $20.00 to interest each period.</div>
 <div class="calc-step calc-result"><strong>Result:</strong> Loan balance progression and payments:
 <ul>
 <li>2/1/22: Balance reduces from $690.00 to $460.00 after paying $230.00 principal and $20.00 interest as part of the $250.00 installment.</li>
 <li>3/1/22: Balance reduces from $460.00 to $230.00 with another $230.00 principal and $20.00 interest portion of the $250.00 EMI.</li>
 <li>4/1/22: Balance reduces from $230.00 to $0.00 with the final $230.00 principal and $20.00 interest portion of the $250.00 EMI.</li>
 </ul>
 Total principal repaid: $690.00. Total interest paid: $60.00. Three installments of $250.00 each were posted, all allocated as described above, fully amortizing the loan in this example.
 </div>
</div>

### Worked example visuals (summary schedule)

- 1/1/22 | Disbursement | amount $690.00 | principal $690.00 | interest $0.00 | Installment Date 1/1/22 | Principal paid $0.00 | Interest paid $0.00 | Loan balance $690.00
- 2/1/22 | Payment Waiver | amount $250.00 | principal $230.00 | interest $20.00 | Installment Date 2/1/22 | Principal paid $230.00 | Interest paid $20.00 | Loan balance $460.00
- 3/1/22 | Payment EMI | amount $250.00 | principal $230.00 | interest $20.00 | Installment Date 3/1/22 | Principal paid $230.00 | Interest paid $20.00 | Loan balance $230.00
- 4/1/22 | Payment EMI | amount $250.00 | principal $230.00 | interest $20.00 | Installment Date 4/1/22 | Principal paid $230.00 | Interest paid $20.00 | Loan balance $0.00

Notes:
- The figures follows the reference data showing the sequence of a waiver that reduces principal and pays interest in the same installment, followed by subsequent installments that continue to reduce the remaining principal until payoff.
- Rounding and currency formatting follow the two-decimal convention used in the reference tables.

### Allocation order Variants (how the sequence changes outcomes)

In the reference, Scenario 1 uses an allocation order described as either:
- Allocation rules: interest, principal, or
- Allocation rules: principal, interest
The order determines which component of the waiver is applied first when the waiver amount could cover both interest and principal in the same period. The examples show the resulting repayment schedule and balance shifting according to the selected order and the amount of the waiver.

### Edge cases, reversals, and related actions (evidenced in the reference)

- Reversal: The data include an entry labeled Payment Waiver - Reversal, illustrating that a previously posted waiver can be reversed. The subsequent entries indicate the repayment schedule reflecting the reversal.
- Replayed/adjusted repayments: The reference shows entries such as Repayment - Replayed, indicating that postings can be re-entered or reallocated as part of recovery from a reversal.
- Add charge and fee interactions: Some scenarios introduce an Add charge action and show how the charge interacts with the waiver and subsequent repayments, including tracking of fee amounts and their effect on the loan balance.
- Overpayment: The scenarios include an Overpay the loan case where the allocation rules include an overpayment entry, demonstrating that the system can record an overpayment and reflect its effect on the loan balance and schedule.
- Reversion and revert-after: The reference contains scenarios where a waiver is reversed and then repayments are re-entered or replayed to restore the expected amortization path.

These edge cases illustrate the need for careful post-transaction reconciliation. The integrity requirements below summarize the non-negotiable expectations that the system enforces whenever waiver transactions post.

### Integrity and reconciliation expectations

- Each period’s opening balance must equal the previous period’s closing balance after all postings for that period.
- Payment allocations must reconcile with the transaction amount posted for the waiver event (Prin Paid plus Interest paid should equal the posted amount, unless a separate fee exists and is handled in an allocation differently per scenario).
- Remaining cash and outstanding dues must reconcile after each posting and at period ends.
- When actual journal entries or accounting lines are available, they must balance (debits equal credits) and reflect the event, account, and code for the waiver and any related charges.
- Rounding must use the institution’s verified convention (for the published examples, amounts are shown with two decimals; the exact rounding rule in edge cases is determined by the implemented rounding convention such as HALF_UP or HALF_EVEN).

### Quick reference: key terms and fields (evidenced in the reference data)

- Transaction Type: Disbursement, Payment Waiver, Reversal entries, and the wafer family of transactions including Interest Waiver/Interest Payment Waiver (as navigated via Interest and Accrual > Interest transactions > Interest Waiver/Interest Payment Waiver transaction type).
- Dates and amounts: Each row lists a Transaction date, amount, and the allocation to Principal and Interest (and any Fee if applicable).
- Installment Date: The date when the installment is due or posted, used to align the waiver with the repayment schedule.
- Principal, Interest, EMI, Due, Prin Paid, Interest paid: Columns used to reflect the breakdown of each payment and how much of the waiver was applied to principal and interest, and how much remains due.
- Loan balance: The outstanding balance after each posting, reflecting changes due to waiver allocations and subsequent installments.

### Where to look in the system to verify behavior

- Loan servicing workspace: Access the loan’s interest transactions area to view or create waiver transactions. The history of waiver postings, reversals, and any related repayments will appear in the loan’s transaction history and repayment schedule. The resulting balances and schedule updates shown in the user interface should follows the allocations described in the reference scenarios.

If you need a concrete reference to the exact numbers and their step-by-step progression, consult the Calculation Reference: Payment Waiver scenarios and Payment Waiver scenarios_v2 in the source data, which provide the scenario-by-scenario records used to validate this feature’s behavior.

---

This page presents the verified, publication-ready description of the Interest Waiver/Interest Payment Waiver transaction type, including its purpose, typical workflows, worked example, and edge-case coverage drawn from the official reference data. It is intended to help operations staff, loan officers, branch managers, and credit agents perform waivers accurately while preserving financial integrity and a clear audit trail.