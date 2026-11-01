# Contract Termination Feature

The Contract Termination feature resides in the loan processing domain of Pepper-Soup and is surfaced through the Charge-off, Write-off and Settlement workflow under Contract termination. It governs how a loan contract is settled when default or termination conditions are met, and it coordinates with the loan amortization schedule, payment allocations, and backdated or reversed repayments. The verified reference data demonstrates how termination events interact with the standard amortization flow, includingTerminal events such as terminations on specific dates, backdated repayments, and reversals of prior terminations. The component is expected to operate with the fineract-loan and fineract-progressive-loan boundaries to adjust schedules and balances consistently, while keeping the period-by-period accounting coherent with the underlying day-count conventions and interest accrual rules.

### Concepts and scope

- Termination triggers a settlement action that halts further scheduled EMI payments and records the remaining balance and related allocations as part of the termination workflow. The reference data shows termination events occurring on dates such as 1st March, 29th February, and 31st March, sometimes accompanied by backdated repayments or reversals.
- The feature supports backdated repayments, which adjust the outstanding balance and may change whether a termination results in zero balance or requires further settlement steps.
- Reversals after termination are observable in the reference data (for example, a reversal after Contract Termination), indicating that the system can revert a termination action under certain conditions.
- All scenarios in the reference data follow a fixed day-count convention: 360 days in a year and 30 days in a month. The standard nominal rate used in the examples is 7% per year.

### Calculation foundations and day-count conventions

The termination and amortization calculations rely on a simple monthly accumulation model derived from a fixed daily rate under the given day-count conventions. Specifically:

- Daily rate (approximately) = annual rate / days in year = 0.07 / 360 = 0.000194444 per day.
- Monthly factor for a 30-day month = 1 + (annual rate / days in year) * 30 = 1.005833333.
- For each period, the balance evolves according to: Balance_next = Balance_current × RateFactor − EMI, where RateFactor = 1 + (annualRate / daysInYear) × daysInMonth and EMI is the fixed monthly installment.

The reference data provides a concrete instance with principal 100, EMI 17.01, and a 7% annual rate, 360-day year, 30-day month. The per-period calculations follow the pattern above, and the resulting end-of-period balances reproduce the shown amortization steps. The first period example yields 83.57 as the balance after the first payment, then 67.05 after the second, continuing until the final payment reduces the balance to zero (rounded to two decimals).

<div class="calc-box">
 <div class="calc-title">Calculation</div>
 <div class="calc-step"><strong>Formula:</strong> Balance_next = Balance_current × RateFactor − EMI, where RateFactor = 1 + (AnnualRate / DaysInYear) × DaysInMonth</div>
 <div class="calc-step"><strong>Substitution (S1 inputs):</strong> Principal = 100.00, AnnualRate = 7%, DaysInYear = 360, DaysInMonth = 30, EMI = 17.01</div>
 <div class="calc-step"><strong>RateFactor:</strong> 1 + (0.07 / 360) × 30 = 1.005833333</div>
 <div class="calc-step"><strong>Step 1:</strong> Balance after first payment = 100.00 × 1.005833333 − 17.01 = 83.57</div>
 <div class="calc-step"><strong>Step 2:</strong> Balance after second payment = 83.57 × 1.005833333 − 17.01 = 67.05</div>
 <div class="calc-step"><strong>Step 3:</strong> Balance after third payment = 67.05 × 1.005833333 − 17.01 = 50.43</div>
 <div class="calc-step"><strong>Step 4:</strong> Balance after fourth payment = 50.43 × 1.005833333 − 17.01 = 33.71</div>
 <div class="calc-step"><strong>Step 5:</strong> Balance after fifth payment = 33.71 × 1.005833333 − 17.01 = 16.90</div>
 <div class="calc-step"><strong>Step 6:</strong> Balance after sixth payment = 16.90 × 1.005833333 − 17.01 = 0.00 (rounded to two decimals)</div>
 <div class="calc-step calc-result"><strong>Result:</strong> The end-of-period balance after six payments is 0.00, matching the provided schedule for the standard amortization path in S1.</div>
</div>

### Demonstrated amortization path (S1: Contract Termination on Due Date)

The reference data includes a complete six-period amortization path under a 100 principal loan with a 7% annual rate, using a 360-day year and 30-day months. The per-period results follows the Balance column shown in the sheet:

| Due Date | Balance (end of period) | EMI | Principal | Interest |
|:---|:---:|:---:|:---:|:---:|
| 2/1/24 | 83.57 | 17.01 | 16.43 | 0.58 |
| 3/1/24 | 67.05 | 17.01 | 16.52 | 0.49 |
| 4/1/24 | 50.43 | 17.01 | 16.62 | 0.39 |
| 5/1/24 | 33.71 | 17.01 | 16.72 | 0.29 |
| 6/1/24 | 16.90 | 17.01 | 16.81 | 0.20 |
| 7/1/24 | 0.00 | 17.00 | 16.90 | 0.10 |

The final balance reaches zero on the final payment date, which is consistent with a fully amortizing schedule under the given inputs. This sequence is representative of the standard payoff path used to validate termination and settlement logic when the contract is settled on or after the due-date payments.

> Note: The reference data also includes explicit termination events documented as separate lines, e.g., "Contract Termination on 1st March" or "Contract Termination on 29th Feb". These events are shown alongside the regular amortization entries and may be followed by backdated repayments or reversals. The data indicates the termination entry is a separate event in the schedule and interacts with the existing balance and payments.

### Other observed scenarios and their implications

The reference data contains multiple verifiable scenarios that illustrate how termination interacts with the payment schedule and with backdating or reversing actions. They are summarized below to provide a framework for how the feature behaves across edge cases, without inventing new logic beyond what is evidenced:

- S2: Contract Termination before Installment date. Termination is recorded before a scheduled installment date, e.g., termination on 29th February. The schedule still shows the standard amortization entries up to the termination moment, and the termination event is captured in the schedule with a associated termination date. The exact balance outcomes are shown in the sheet, illustrating how the termination event follows the existing flow.
- S6: Backdated repayment. A repayment is recorded with a date earlier than the current period, affecting the subsequent balances and the termination state. The reference material demonstrates a backdated repayment within the same period path, which alters the standard progression toward settlement.
- S7: Reversal after Contract Termination. The dataset includes an example where a previously recorded termination is reversed, reflecting recovery of the contract’s active state. This demonstrates that termination actions can be undone, returning the schedule to a state consistent with continued amortization.
- S12: Backdated repayment where contract termination becomes zero. In this scenario, a backdated repayment is applied in a way that drives the outstanding balance to zero, after the termination event, indicating that backdated actions can fully settle the loan when the timing follows the termination date.
- S13: Backdated repayment – excess amount. The reference entry for this scenario describes the concept of a backdated repayment with an excess amount but does not supply numeric values. This indicates that the feature supports excess backdating scenarios in principle, but the provided data does not include a concrete numeric example.

Each scenario demonstrates the interaction between termination events, the standard amortization path, and backdated or reversed repayments. The exact numerical outcomes depend on the termination date, the timing of repayments, and the rounding rules applied to each period, all of which are visible in the supplied reference data tables.

### Observed invariants and validations

- Opening balance for a given period equals the previous period’s closing balance, preserving continuity across periods.
- Payment allocations must reconcile with the transaction amounts recorded in the schedule (principal and interest allocations sum to the EMI per period, subject to rounding).
- When a contract termination occurs, the schedule entries (payments, terminations, and reversals) appear as discrete events in the Transactions column, accompanied by a Balance update.
- If a backdated repayment is applied, the Balance and Installment status entries reflect the updated payoff path, which may cause termination-related balances to be recalibrated .
- Where journal entries or accounting details are available, the events observed (Termination, Repayment, Reversal) are temporally ordered to preserve balance consistency across periods.

### Architecture and processing implications

- The feature relies on the standard amortization logic (balance progression using a fixed EMI and a rate factor derived from day-count conventions) and augments it with termination, backdated repayments, and reversal handling. This verifies that the termination path remains consistent with the fundamental loan accounting model while allowing post-facto adjustments.
- Termination events are represented in the period-by-period data alongside the regular EMI flow. Their presence in the schedule indicates that termination processing occurs as a discrete action that can be confirmed by a termination date.
- Backdating and reversal operations require careful recalculation of subsequent balances to maintain integrity of the schedule and to preserve consistency with the opening-balance equals previous closing-balance invariant.

### Practical guidance for implementation and testing

- Use the day-count conventions in the data model: 360 days per year and 30 days per month, with a fixed EMI per period derived from the loan terms and rate. Validate that Balance_next is computed as Balance_current × RateFactor − EMI and rounded consistently to two decimals where shown in the reference data.
- Validate that termination events can occur on dates that follows or precede scheduled installments, and that the resulting balance reflects the termination, backdated repayments, or reversals as demonstrated in the reference scenarios.
- Include tests for backdated repayments to verify that the resulting balance can reach zero or reflect the intended settlement amount after a termination event.
- verify that the opening balance for each period equals the prior period’s closing balance, even when termination or backdated adjustments occur.

### Terminology recap

- Contract Termination: A defined event in the termination workflow that settles a loan as part of default handling, recorded on a specific date and reflected in the amortization schedule.
- Backdated repayment: A repayment recorded as occurring on an earlier date than the currently displayed period, used to adjust the balance path and potentially affect termination outcomes.
- Reversal: An operation that undoes a previously recorded termination, restoring the state of the schedule and balance.

This page consolidates the verified behavior evident in the reference data for Contract Termination, including the basic calculation model, the illustrative S1 amortization path, and the observed handling of backdated repayments and reversals. It provides a precise, source-grounded view of how contract termination interacts with the standard loan schedule and how edge-case scenarios are represented within the data.