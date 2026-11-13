# In-Advance Allocation Rules

The in advance allocation rule decides how an unprocessed payment amount is applied to upcoming and future installments. It applies to loans using the payment strategy due-penalty-fee-interest-principal-in-advance-principal-penalty-fee-interest-strategy.

When only principal is paid:

- The loan status stays ACTIVE.
- The extra in advance part appears on the transactions tab.
- The extra in advance part appears on the repayment schedule tab.

Allocation order:

- The rule allocates the unprocessed amount to the upcoming installment first.
- If any unallocated amount remains, it allocates to the last installment.
- If the early repayment amount exceeds both the first upcoming installment outstanding and the last installment outstanding, the remaining unprocessed amount is allocated to the last but one installment.

Future installment rule:

- It allocates unprocessed amount to the upcoming installment first, then to the last installment, and from that point allocates backward in order.
- Its options are NEXT_INSTALLMENT, LAST_INSTALLMENT, and REAMORTIZATION.
- The new future allocation rule is named Next installment - Last installment.

Advanced payment processor flow:

- The current installment in advance gets payable details via EMICalculator.getPayableDetails.
- If the in advance installment is also the current installment, payable detail calculates interest to be paid per transaction date.
- If it is not the current installment (a future installment where the from date is on or after the transaction date), payable interest is 0 and all payment goes to principal based on EMI.
- Repayment schedule period due principal and due interest are updated.
- The repayment transaction is allocated on this period.
- EMICalculator is called with paid principal * -1 as balance correction.
- The repayment schedule period is updated again.
- If unprocessed amount remains, the flow iterates back to the first step.

In Advance column on the Repayment schedule tab:

| Condition | Amount shown |
| --- | --- |
| Only principal taken into account | 1000 EUR |
| All in advance components taken into account | 1100 EUR |

A borrower makes an early repayment of 2,500 on a loan with four equal monthly installments of 1,000 each. The first installment is due on 1 February, the second on 1 March, the third on 1 April, and the fourth on 1 May. The figures are illustrative. Under the in-advance allocation rule, the unprocessed amount goes to the upcoming installment first, then to the last installment, and any remainder goes to the last-but-one installment.

| Step | Allocation target | Amount allocated | Remaining unprocessed |
| --- | --- | --- | --- |
| 1 | Installment 1 (upcoming, due 1 February) | 1,000.00 | 1,500.00 |
| 2 | Installment 4 (last, due 1 May) | 1,000.00 | 500.00 |
| 3 | Installment 3 (last but one, due 1 April) | 500.00 | 0.00 |
| 4 | Total allocated | 2,500.00 | — |

This shows that when the repayment exceeds both the upcoming and last installment, the remainder flows to the last-but-one installment.
