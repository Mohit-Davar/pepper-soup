<!-- Labels: user, contract-termination -->
# Contract Termination Feature

The Contract Termination Feature provides a controlled mechanism to formalize the end of a loan contract when a loan is deemed in default or when a negotiated settlement requires terminating the contract. The feature records a termination event on the loan’s servicing record, applies any required repayments or reversals, and adjusts the loan balance and payment allocations . It is designed to support scenarios where termination occurs on or before a scheduled installment date, and to accommodate backdated repayments and reversals that may occur in the servicing process. The feature is used by operations staff, loan officers, branch managers, and credit agents who manage default, settlement, and write-off related workflows within the Loan Servicing domain.

Access path: Charge-off, Write-off and Settlement > Contract termination > Contract Termination Feature.

### What the feature does and why it matters
- It formalizes the end of the contract by recording a Contract Termination event on the loan. This event anchors the termination date, which drives how remaining obligations are treated and how the loan’s history is recorded.
- It recalculates the loan’s standing as of the termination date, including any outstanding principal, the remaining balance, and the allocation between principal and interest for the scheduled installments that have or have not been fulfilled.
- It records related transactions in the loan’s activity stream. Typical transaction types include Type, Repayment, Contract Termination, and, in some cases, backdated repayments or reversals that adjust the chain of events.
- It supports backdated actions and reversals, so that the system can reflect adjustments that are discovered after the original termination or after settlement actions.

### Concepts and terminology (as observed in the system)
- Outstndng principal (used for calculation): The outstanding principal amount used to determine payment allocations and the remaining balance before an installment is applied.
- Balance of loan: The amount remaining on the loan after accounting for principal and interest payments, as recorded on the date shown in the servicing record.
- EMI: The monthly installment amount scheduled for the loan (principal plus interest) on a given date.
- Prin: Principal portion of an installment payment.
- Int: Interest portion of an installment payment.
- Prin Paid / Int Paid: The amounts of principal and interest paid for a given installment when the payment is processed.
- Balance: The running balance after a given installment payment or after a termination event.
- Installment fullfilled?: Indicates whether the scheduled installment has been paid in full by the due date.
- Transactions: A log of actions and events associated with the loan, including Type, Date, EMI, Principal, Interest, Balance, and related indicators (On, Balance, etc.).

> Note: The figures and fields shown below reflect the verified reference data for this feature. Use them as the exact basis for understanding the behavior when termination events occur, including the interaction with backdated repayments and reversals.

## Operational workflow: performing a Contract Termination
The following steps describe the typical UI workflow and the observable outcomes when a contract termination is processed. Field and button names shown are those visible in the verified reference scenario; bold names indicate UI controls.

1) Open the Contract Termination feature
- Navigate to: Charge-off, Write-off and Settlement > Contract termination > Contract Termination Feature.
- Outcome: The system presents the loan’s servicing context and the termination action surface for the selected contract.

2) Select the loan and initiate termination
- Choose the loan for termination from the eligible portfolio.
- Enter the termination date (the date on which the termination is effective).
- Outcome: The system consumes the termination date and prepares a termination event for processing and recording.

3) Review the calculation and the resulting balances
- The system computes the impact of the termination date on the loan’s standing, including outstanding principal, current balance, and the allocation between principal and interest for installments that have not or have been fulfilled.
- Outcome: The data grid shows the relevant fields for each relevant date (Due Date, Outstndng principal, Balance, EMI, Prin, Int, Prin Paid, Int Paid, Balance, Installment Fulfilled?, Transactions).
- If the termination date occurs on or after a due date, you may observe a sequence where payments accrue and the balance moves toward zero before termination is recorded; if the termination is entered before the installment date, the balance and allocations reflect the pre-term action—see the S2 scenario below for an example line of observation in the table.

4) Confirm or modify termination, and finalize
- After reviewing the computed outcomes, confirm the termination to finalize the event in the loan’s history.
- Outcome: The termination event is recorded in the Transactions log, and the loan status updates to reflect the termination. Depending on the timing and any backdated actions, a subsequent reversal or backdated repayment may be recorded as well.

5) Handle post-termination adjustments (if applicable)
- If a backdated repayment or a reversal occurs after termination, the system applies these adjustments to the loan’s standing, potentially restoring or further reducing the balance and updating the associated Principal and Interest allocations.
- Outcome: The loan’s balance, payment allocations, and the termination-related transactions reflect the latest verified actions.

6) Audit and reconciliation
- Verify that the period-by-period opening balances and closing balances remain reconciled across the chain of events (including any reversals) and that journal-like impact (where visible) balances when available.
- Outcome: A consistent, auditable trail from initial state through termination, including any backdated repayments or reversal events.

## Worked examples: representative calculation patterns (grounded in verified data)
The reference data includes several scenario variants that illustrate how contract termination can affect a loan under different timing and adjustment conditions. Below are condensed, verifiable patterns with key figures from the reference datasets. Each example shows the starting position, inputs, a high-level calculation outline, and the observed outcomes. These are representative rather than exhaustive; for full per-date detail, refer to the source scenarios in the reference data.

### S1 — Contract Termination on Duedate
Context: The loan has a principal of 100 with a 7% annual rate (days in year 360, days in month 30) and a monthly repayment cadence of approximately 1 month per installment.
- Interest Rate: 7% (0.000194444 per day multiplicative factor in the reference sheet) 
- Days In year: 360; Days In month: 30
- Principal: 100; EMI pattern: 17.01 per month (first six installments)

Observations in the termination-on-due-date scenario show a standard principal-first amortization, followed by a termination event on or after the due date window. The reference view demonstrates the following sequence across the first several dates:
- 1/1/24: Outstndng principal 100.00; Balance 100.00.
- 2/1/24: Balance 83.57; EMI 17.01; Principal 16.43; Interest 0.58.
- 3/1/24: Balance 67.05; EMI 17.01; Principal 16.52; Interest 0.49.
- 4/1/24: Balance 50.43; EMI 17.01; Principal 16.62; Interest 0.39.
- 5/1/24: Balance 33.71; EMI 17.01; Principal 16.72; Interest 0.29.
- 6/1/24: Balance 16.90; EMI 17.01; Principal 16.81; Interest 0.20.
- 7/1/24: Balance 0.00; EMI 17.00; Principal 16.90; Interest 0.10.

From the termination perspective, the reference shows a line labeled Contract Termination on 1st March interleaved with an ongoing balance sequence, followed by a reversal in some branches of the scenario. The key takeaway is that termination can be recorded after a series of installments, and the resulting balance may be zero on the termination date if the contract has been fully settled by then. A reversal edge case is shown later in the data, illustrating how a reversal can restore prior balance figures (e.g., 83.57). The measurements above establish the pattern of a typical termination trail in S1.

<div class="calc-box">
 <div class="calc-title">Calculation</div>
 <div class="calc-step"><strong>Context:</strong> Principal 100, Rate 7% per year, monthly repayment cadence,-year-day convention 360/30.</div>
 <div class="calc-step"><strong>Observations (selected dates):</strong> 2/1/24 Balance 83.57; 3/1/24 Balance 67.05; 4/1/24 Balance 50.43; 5/1/24 Balance 33.71; 6/1/24 Balance 16.90; 7/1/24 Balance 0.00.</div>
 <div class="calc-step calc-result"><strong>Result:</strong> The sequence demonstrates standard amortization leading to full repayment; the termination event is recorded with the later date noted (and can be reversed in subsequent steps). The principal and interest allocations across the dates follows the EMI of 17.01 (for the first several installments) and 17.00 on the last date shown, with interest components ranging from 0.58 down to 0.10 as the balance declines.
 </div>
</div>

### S2 — Contract Termination before Installment Date
Context: Termination occurs before a scheduled installment date, with a payment made on time as of 1st Feb in the reference data. The inputs remain the same: principal 100; rate 7% per year; EMI near 17.01; repaid monthly.
- Observations show a payment record on 2/1/24 with Balance 0.00 after the payment (the first installment reduces residual to zero in the dataset), followed by a termination entry on 29 Feb.
- This example demonstrates the ability to terminate contract prior to the next installment date, effectively closing the loan if the payment covers the outstanding balance on the date of termination.

<div class="calc-box">
 <div class="calc-title">Calculation</div>
 <div class="calc-step"><strong>Context:</strong> Principal 100, Rate 7% per year, monthly cadence.</div>
 <div class="calc-step"><strong>Observations:</strong> 2/1/24 Balance 0.00 after EMI 17.01 (Principal 16.43, Interest 0.58); Termination on 29 Feb.</div>
 <div class="calc-step calc-result"><strong>Result:</strong> Termination applied after the payment on 2/1/24 reduces the balance to zero; a termination event is then recorded for 29 Feb in the dataset.
 </div>
</div>

### S6 — Backdated repayment
Context: A backdated repayment event occurs within the same month as the scheduled termination window. The same base inputs apply: 100 principal, 7% annual rate, 360/30 day conventions, 1-month cadence.
- Observations show a sequence that includes a backdated repayment, which adjusts the balance and the termination record .
- This example illustrates how the system accommodates an adjustment that resolves into a zero balance or changes the termination trail when a repayment is applied retroactively.

<div class="calc-box">
 <div class="calc-title">Calculation</div>
 <div class="calc-step"><strong>Context:</strong> Principal 100, Rate 7% per year, monthly cadence; backdated repayment is applied.</div>
 <div class="calc-step"><strong>Observations:</strong> Balance and termination entries reflect the backdated action alongside standard amortization steps.</div>
 <div class="calc-step calc-result"><strong>Result:</strong> The ledger reflects the backdated repayment adjusting the balance and the subsequent termination event as verified by the dataset.
 </div>
</div>

### S7 — Reversal after Contract Termination
Context: A termination action is followed by a reversal within the same lifecycle in the reference data.
- Observations show a Contract Termination event, followed by a reversal that reverts the balance to a prior stated value (for example, returning to 83.57 on the affected date). This demonstrates that the system can revert a termination event, restoring the prior balance and the associated allocations if the termination is reversed.

<div class="calc-box">
 <div class="calc-title">Calculation</div>
 <div class="calc-step"><strong>Context:</strong> Termination occurs, then reversal is applied.</div>
 <div class="calc-step"><strong>Observations:</strong> Reversal action restores a previous balance and allocates Principal/Interest as shown in the reference data’s reversal pattern.</div>
 <div class="calc-step calc-result"><strong>Result:</strong> Termination can be reversed, with the balance and allocations returning to the pre-termination state as demonstrated by the dataset.
 </div>
</div>

### S12 — Backdated repayment where contract termination becomes zero
Context: Backdated repayment in proximity to a termination event yields a zero balance prior to or at termination according to the reference scenario.
- Observations show the exact data pattern where the backdated repayment follows a zero balance at termination, illustrating how the system can render zero-balance terminations when retroactive repayments occur.

<div class="calc-box">
 <div class="calc-title">Calculation</div>
 <div class="calc-step"><strong>Context:</strong> Principal 100; 7% annual rate; 360/30 day conventions; backdated repayment.</div>
 <div class="calc-step"><strong>Observations:</strong> The backdated repayment brings the balance to zero around termination.
 </div>
 <div class="calc-step calc-result"><strong>Result:</strong> Termination event proceeds with a zero balance reflecting the backdated repayment in the data.
 </div>
</div>

### Backed-out reconciliation and integrity considerations
- Each termination is recorded with a termination date that anchors how remaining obligations are treated and how the loan’s history is logged.
- If a backdated repayment or a reversal occurs, the system re-applies allocations to the current state and updates the Transactions log so that the opening balance for the next period equals the previous period’s closing balance.
- The date-driven sequence of events must reconcile across all dates where a termination, repayment, reversal, or backdated entry occurs. The integrity requirements emphasize that opening balances must equal the prior period’s closing balances, and that allocations and remaining cash reconcile with the outstanding dues.

## Summary of business rules and scenarios (grouped by context)
- Termination on due date (S1): Follows standard amortization until the termination date, after which a Contract Termination event is recorded. The dataset shows a complete amortization path culminating in a termination entry, with the possibility of subsequent reversal.
- Termination before installment date (S2): Termination can occur prior to the next installment; the dataset demonstrates a payment on the due date reducing the balance to zero, followed by a termination event.
- Backdated repayments (S6, S12, S13): The system accommodates retroactive repayments that impact the balance and can interact with termination events to yield zero balances or adjusted terminations.
- Reversal after termination (S7): Termination actions may be reversed, restoring the prior balance and allocations.
- Observability: For all cases, the loan servicing view presents the per-date fields (Due Date, Outstndng principal, Balance, EMI, Prin, Int, Prin Paid, Int Paid, Balance, Installment Fulfilled?, Transactions) so operators can verify the evolution of the contract termination and its effects on the loan’s ledger.

> This page presents the verified behavior of the Contract Termination Feature as observed in the reference data. It explains what the feature does, how it behaves under different timing scenarios, and how operators should perform and verify terminations in daily servicing workflows. The examples illustrate real patterns from the data without introducing any unverified assumptions.