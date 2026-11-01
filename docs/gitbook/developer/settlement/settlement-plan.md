# Settlement Plan

Settlement Plan coordinates post-disbursement settlement activities for loans within Pepper-Soup, with a focus on re-aging, reverse replay of repayments, and chargeback scenarios. It maintains alignment between the repayment schedule and the loan balance, generating revised installments and updating the opening/closing balances per period. The referenced material demonstrates re-aging use cases that modify the repayment schedule and supports replay-based adjustments to past allocations. The behavior described here reflects verified from the Settlement Plan calculations and schedules, not implementation proposals.

## Scope and component boundaries

The Settlement Plan governs activities that adjust and reconcile repayment schedules during settlement-related operations. in the reference material centers on actions such as disbursement, downpayments, re-aging events, chargebacks, and variations of replay (including reverse replay re-aging). These events are observed in payloads labeled as transactions and repayment schedules, illustrating how a loan’s amortization plan can be redefined when settlement operations occur. There is no formal, published state machine supplied ; therefore, the description focuses on the sequence of observed events and their financial effects rather than a declarative state diagram.

## Execution lifecycle and state transitions

 presents a lifecycle consisting of observable events that influence the repayment schedule:
- Disbursement establishes the initial loan edge with principal funded.
- Downpayment reduces the outstanding balance and is reflected in the initial installment structure.
- Re-aging modifies the schedule by introducing a new cadence and installment amounts.
- Repayments and later events (such as backdated repayments or reverse replay re-aging) adjust or reallocate the schedule and outstanding balances.

No explicit state names or transition triggers are provided . The description below captures the observable sequence and its financial effects rather than a formal state-transition model.

## Calculation reference: Re-aging use cases

Re-aging represents a modification to the loan’s amortization in which a new settlement-based repayment cadence is introduced. The reference data defines a re-aging configuration with:
- Re-age start date: 3/1/22
- Number of installments: 6
- Cadence: every 1 month
- Per-installment amount: 62.50

From the cadence , the first post-re-age installment appears on 4/1/22 (the cadence row explicitly shows 4/1/22 with a 62.50 amount), followed by monthly installments consistent with the cadence. The configuration is shown together with the start date and installment count, providing a precise, verifiable basis for the re-aging behavior observed in the reference tables.

### Parameter overview (evidenced)

<div class="param-grid"><div class="param-card"><span class="param-label">Re-age start date</span><span class="param-value">3/1/22</span></div><div class="param-card"><span class="param-label">No of Installments</span><span class="param-value">6</span></div><div class="param-card"><span class="param-label">Frequency</span><span class="param-value">every 1 Month</span></div><div class="param-card"><span class="param-label">Per-installment amount</span><span class="param-value">62.50</span></div></div>

The cadence also shows an observed first post-re-age installment date on 4/1/22, with subsequent monthly installments following the cadence. The exact dates beyond the first observed date are implied by the cadence and the total number of installments (six).

#### Calculation representation

<div class="calc-box">
 <div class="calc-title">Calculation</div>
 <div class="calc-step"><strong>Formula:</strong> <code>Installment amount is fixed per re-aging configuration; number of installments defines the length of the new repayment schedule; cadence is monthly.</code></div>
 <div class="calc-step"><strong>Substitution:</strong> <code>Per-installment amount = 62.50; installments = 6; first post-reage installment date observed = 4/1/22.</code></div>
 <div class="calc-step calc-result"><strong>Result:</strong> <code>The updated repayment schedule comprises six monthly installments of 62.50 each, applied beginning on the observed first post-reage installment date; the effect is a revised outstanding balance and revised due amounts for each period.</code></div>
</div>

### Representative sample: re-aging data excerpt

The reference data includes a representative snippet from the Re-aged loan (Settlement) sheet, illustrating the transaction types and the installment-related fields that participate in the re-aging scenario. The excerpt shows a disbursement of 500, followed by a downpayment of 125 allocated to principal reduction, with corroborating fields for the installment date and principal components.

```
| Transaction Type | Business Date | Transaction Date | amount | Installment Date | Principal | DP Principal | Interest | Fees | EMI | Due | Paid |
| Disbursement | 1/1/22 | 1/1/22 | 500 | 1/1/22 | 500 | | | | | | |
| downpayment | 1/1/22 | 1/1/22 | 125 | 1/1/22 | $- | $125.00 | $- | $- | $125.00 | $- | $125.00|
```

The entries illustrate how principal and downpayment components are represented in the schedule, and how the repayment components (EMI, Due, Paid) follows the installment cadence in the re-aging context.

### Additional observed patterns: reverse replay and related adjustments

The reference material contains sections labeled as reverse replay scenarios and related adjustments to the repayment schedule. These entries demonstrate that the settlement process can alter previously recorded repayments and re-allocate amounts within the schedule to reflect corrective actions or policy-driven adjustments. While the exact accounting or trigger details are not enumerated in the source, the presence of such scenarios confirms that the Settlement Plan supports corrective replay and re-aging adjustments as part of settlement processing.

## Data model and field semantics (-driven)

The reference data represents a set of fields that describe a transaction or schedule entry. The observed fields include:
- Transaction Type: The kind of event (e.g., Disbursement, Downpayment, Reaging, Repayment, Chargeback, Undo/Reverse Replay). The type drives how the row affects the principal, interest, and cadence.
- Business Date: The business date associated with the event.
- Transaction Date: The actual date the event occurred or was recorded.
- amount: The monetary value associated with the event.
- Installment Date: The date at which the installment is scheduled.
- Principal: The portion of the loan principal affected in this entry.
- DP Principal: The portion of the downpayment principal affected in this entry.
- Interest: Interest component of the entry, if any.
- Fees: Any fees associated with the entry.
- EMI: Equated Monthly Installment component, if applicable.
- Due: Amount due in this line item.
- Paid: Amount actually paid against this line item.

These fields constitute the observed schema used by the Settlement Plan to represent the interaction of disbursement, re-aging, and repayment events with the evolving amortization schedule.

## Integrity and validation expectations

The following invariants and guards are observed in the reference material and should be verified in any concrete implementation:
- Each period's opening balance must equal the previous period's closing balance.
- Payment allocations must reconcile with the transaction amount.
- Remaining cash and outstanding dues must reconcile with the recorded schedule and transactions.
- Journal entries, where present, must balance when debit and credit data are available.
- Intermediate calculations, running balances, totals, precision, and rounding follow the documented conventions (e.g., HALF_UP or HALF_EVEN, ).

## Summary of verified behavior for Settlement Plan

- The Settlement Plan supports re-aging to introduce a new cadence and fixed per-installment amount for a defined number of installments.
- The cadence observed is monthly, beginning with the first post-re-age installment date indicated in the cadence data (observed as 4/1/22).
- The system records a sequence of transactions (e.g., Disbursement, Downpayment, Reaging) and the associated repayment schedule entries, including principal and downpayment principal components.
- The platform accommodates reverse replay and related adjustments to repayments and re-aging, demonstrating an ability to modify previously recorded allocations as part of settlement processing.

These descriptions reflect the verified material from the reference data and present a complete, stand-alone view of the Settlement Plan's behavior with respect to re-aging, repayment scheduling, and corrective replay scenarios.