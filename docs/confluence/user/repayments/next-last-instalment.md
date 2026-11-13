# Next and Last Installment Allocation

The Next/Last Installment allocation rule decides how an advance payment is split between the next installment and the last installment of a loan. You select it in the Future Installment Allocation Rule dropdown as part of the Advanced payment allocation strategy. The rule applies when a repayment is made before or on an installment due date.

How the advance amount is allocated:

- Any advance amount first allocates to the next installment, and any remaining amount allocates to the last installment.
- If the repayment date is on the next installment due date, the amount allocates to that current installment first, and any remaining amount allocates to the last installment.
- If the current installment is fully paid, any advance portion allocates to the last installment.
- If the repayment date is on the current installment due date, any advance portion allocates to the last installment.
- Once an amount is allocated to the next installment, allocation jumps to the last installment and allocates from behind: last, then last but one, then last but two, and so on.
- There is always a next installment under this rule. There are no changes regarding the last installment.

Which installment counts as the next installment:

- If the repayment date is before the current installment due date, the current installment behaves as the next installment.
- If the repayment date is on the current installment due date, the upcoming next installment is the next installment, and the Next rule is skipped.

Allocation order for any payment:

| Position | Allocation target |
| --- | --- |
| 1 | Overdue interest |
| 2 | Overdue principal |
| 3 | Overdue fees |
| 4 | Due interest |
| 5 | Due principal |
| 6 | Due fees |
| 7 | Advance principal |
| 8 | Advance interest |
| 9 | Advance fees |

## Set advance payment allocation to next and last installments

Use this screen to choose how an advance payment is split between the next installment and the last installment.

1. Select **Admin** > **Products** > **Loan Products**.
2. Select **Create Loan Product (Classic)**, or open an existing product and select **Edit**.
3. Open the **PAYMENT ALLOCATION** step.

| Field | Required | Description |
| --- | --- | --- |
| Credit Allocation Strategy | No | Choose the credit allocation strategy for the advance payment. |
| Future Installment Allocation Rule | No | Select the future installment allocation rule, such as Next / Last installment, to control how the advance amount is applied. |

The advance amount allocates first to the next installment and any remaining amount allocates to the last installment.

## Worked examples

This example shows how an advance payment is split under the Next/Last installment option. The figures are illustrative: a loan of 1,000 at 12% annual interest is repaid in 3 monthly installments over 30-day months, due on 1 January, 1 February and 1 March. The scheduled amounts are 340.02, 340.02 and 340.03. The customer pays 700.00 in advance on 1 January, the first due date. If the payment arrived before 1 January, the current installment would still be covered first as the next installment, but any remainder would go straight to the last installment instead of also funding the February installment.

| Installment | Due date | Amount due | Advance allocated | Still due after advance |
| --- | --- | --- | --- | --- |
| 1 | 1 Jan | 340.02 | 340.02 | 0.00 |
| 2 | 1 Feb | 340.02 | 340.02 | 0.00 |
| 3 | 1 Mar | 340.03 | 19.96 | 320.07 |
| Total |  | 1,020.07 | 700.00 | 320.07 |
