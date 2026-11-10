# In-Advance Allocation Rules

## In-Advance Allocation Rules

The in advance allocation rule allocates an unprocessed amount to the upcoming installment first, then to the last installment if any amount remains. The Future installment rule allocates to the upcoming installment first, then to the last installment, and then backward in order.

If an early repayment amount exceeds both the first upcoming installment outstanding and the last installment outstanding:

- The remaining unprocessed amount is allocated to the last but one installment.

A new future allocation rule named "Next installment - Last installment" is added.

An operations officer applies an early repayment of 300.00 on 10 January to a loan with four monthly installments of 120.00 each, due on the first of February, March, April and May. The figures are illustrative. The product uses the in-advance allocation rule, so the unprocessed amount goes to the first upcoming installment, then to the last installment, and any remainder goes to the last-but-one installment. This determines which installments the system treats as paid and which remain overdue.

| Step | Installment due | Outstanding before | Allocated | Outstanding after | Unprocessed remaining |
| --- | --- | --- | --- | --- | --- |
| Repayment received | — | — | — | — | 300.00 |
| First upcoming | 1 February | 120.00 | 120.00 | 0.00 | 180.00 |
| Last installment | 1 May | 120.00 | 120.00 | 0.00 | 60.00 |
| Last but one | 1 April | 120.00 | 60.00 | 60.00 | 0.00 |
| Not reached | 1 March | 120.00 | 0.00 | 120.00 | 0.00 |

The example shows that the March installment is left unpaid even though it falls before April, because the rule moves from the first upcoming installment to the last and then to the last-but-one installment before stopping.

See also: [Payment Allocation Strategies: Payment Allocation Strategies](allocation-strategies.md#payment-allocation-strategies).
