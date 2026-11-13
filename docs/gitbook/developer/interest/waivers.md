# Interest Waivers

## Interest Payment Waiver overview

An Interest Payment Waiver reduces interest balances on a loan. Waivers apply to interest balances first. The Interest Payment Waiver transaction type works the same as the goodwill credit transaction and refund transaction.

## Posting an Interest Payment Waiver

You can post an Interest Payment Waiver transaction on an active or closed loan account. Use the Loans transaction API endpoint with the command interestPaymentWaiver. The loan transaction template fields are transaction date, transaction amount, payment type, external id, and note.

## Undoing, modifying, and charge-back

You can undo, modify, revert, replay, or charge back a posted Interest Payment Waiver transaction from the UI. Reverse replay works the same for Interest Payment Waiver as for any other transaction type, and reverse replay allocation for Payment Waiver works the same as for other transaction types.

## Payment allocation

Payment allocation for an interest waiver follows the advance allocation strategy configured for the loan product. You can configure payment allocations for the Payment waiver transaction type at loan product level during loan product creation and modification. When Advanced payment allocation is set, allocation rules can be configured.

## Accounting entries

The accounting entries depend on whether the loan account is charged off. For non charge-off accounts, the Payment Waiver debits Income from Interest and credits Loan portfolio, Interest Receivable, Fees Receivable, Penalties Receivable, and Overpayment. For charge-off accounts, it debits Income from Interest and credits Income from charge-off Interest and Overpayment. Reversals post the opposite entries.

| Account type | Debit | Credit |
| --- | --- | --- |
| Non charge-off loan account | Income from Interest (GL 404000) for the total amount entered | Loan portfolio (GL 112601) for total principal portion allocated; Interest Receivable (GL 112603) for total interest portion allocated; Fees Receivable (GL 112603) for total fees portion allocated; Penalties Receivable (GL 112603) for total penalties portion allocated; Overpayment (GL 245000) for total overpayment portion allocated |
| Charge-off loan account | Income from Interest (GL 404000) for the total amount entered | Income from charge-off Interest (GL 404001) for total principal, interest, fees, and penalties portions allocated; Overpayment (GL 245000) for total overpayment portion allocated |

| Account type | Debit | Credit |
| --- | --- | --- |
| Non charge-off loan account | Loan portfolio (GL 112601), Interest Receivable (GL 112603), Fees Receivable (GL 112603), Penalties Receivable (GL 112603), and Overpayment (GL 245000) for their respective allocated portions | Income from Interest (GL 404000) for the total amount entered |
| Charge-off loan account | Income from charge-off Interest (GL 404001) for total principal, interest, fees, and penalties portions allocated; Overpayment (GL 245000) for total overpayment portion allocated | Income from Interest (GL 404000) for the total amount entered |

## Configuration and API visibility

The loan product template call returns the new Interest Payment Waiver transaction type.

## Worked examples

A loan of 1,000 is disbursed on 1 January. Three monthly installments fall due on 1 February, 1 March and 1 April. Before any waiver the schedule shows: 1 February principal 300, interest 20, EMI 320, due 320; 1 March principal 300, interest 15, EMI 315, due 315; 1 April principal 400, interest 10, EMI 410, due 410. A Payment Waiver of 250 is posted on 1 February. Interest waivers apply to interest balances first, so 20 settles the interest due and the remaining 230 reduces principal. The figures in this example are illustrative. The waiver reduces the balance by the principal portion only; the interest portion settles the receivable without changing the loan balance.

| Date | Transaction | Amount | Interest | Principal | Balance after |
| --- | --- | --- | --- | --- | --- |
| 1 Jan | Disbursement | 1,000.00 | — | — | 1,000.00 |
| 1 Feb | Payment Waiver | 250.00 | 20.00 | 230.00 | 770.00 |
| 1 Mar | Installment | 385.00 | 15.00 | 370.00 | 400.00 |
| 1 Apr | Installment | 410.00 | 10.00 | 400.00 | 0.00 |

A loan of 1,000 is disbursed on 1 January. A fee charge of 50 is posted on 15 January; the loan balance stays 1,000 because fees are tracked separately. A Payment Waiver of 100 is posted on 1 February. The waiver applies to interest first: 20 settles the interest due, 30 reduces principal, and the remaining 50 clears the fee. The loan balance falls to 970. This example differs from the basic waiver only by the presence of a fee charge, which adds a fee portion to the allocation.

| Date | Transaction | Amount | Interest | Principal | Fee | Balance after |
| --- | --- | --- | --- | --- | --- | --- |
| 1 Jan | Disbursement | 1,000.00 | — | — | — | 1,000.00 |
| 15 Jan | Fee charge | 50.00 | — | — | — | 1,000.00 |
| 1 Feb | Payment Waiver | 100.00 | 20.00 | 30.00 | 50.00 | 970.00 |

A loan of 1,000 is disbursed on 1 January. Repayments of 320 on 1 February, 385 on 1 March and 330 on 1 April repay the principal in full, leaving a balance of 0 and an unpaid interest amount of 10. A Payment Waiver of 60 is posted on 10 April. It allocates 10 to the outstanding interest and the remaining 50 to overpayment. The balance stays at 0. This example differs from the basic waiver only because the loan is already fully repaid, so any amount beyond interest becomes overpayment.

| Date | Transaction | Amount | Interest | Principal | Overpayment | Balance after |
| --- | --- | --- | --- | --- | --- | --- |
| 1 Jan | Disbursement | 1,000.00 | — | — | — | 1,000.00 |
| 1 Feb | Repayment | 320.00 | 20.00 | 300.00 | — | 700.00 |
| 1 Mar | Repayment | 385.00 | 15.00 | 370.00 | — | 330.00 |
| 1 Apr | Repayment | 330.00 | — | 330.00 | — | 0.00 |
| 10 Apr | Payment Waiver | 60.00 | 10.00 | — | 50.00 | 0.00 |

A loan of 1,000 is disbursed on 1 January. A Payment Waiver of 40 is posted on 15 January, allocating 10 to interest and 30 to principal, leaving a balance of 970. A repayment of 300 is posted on 1 February, allocating 20 to interest and 280 to principal, leaving a balance of 690. The waiver is then undone on 2 February; the reversal restores 10 to interest and 30 to principal, bringing the balance back to 720. The repayment is replayed on 1 February and now allocates 40 to interest and 260 to principal, leaving a balance of 460. This example shows that undoing a waiver recalculates balances and that a replayed repayment can allocate differently once the waived amounts are restored.

| Date | Transaction | Amount | Interest | Principal | Balance after |
| --- | --- | --- | --- | --- | --- |
| 1 Jan | Disbursement | 1,000.00 | — | — | 1,000.00 |
| 15 Jan | Payment Waiver | 40.00 | 10.00 | 30.00 | 970.00 |
| 1 Feb | Repayment | 300.00 | 20.00 | 280.00 | 690.00 |
| 2 Feb | Undo waiver (reversal) | 40.00 | 10.00 | 30.00 | 720.00 |
| 1 Feb | Repayment (replayed) | 300.00 | 40.00 | 260.00 | 460.00 |

For a non charge-off loan account, a Payment Waiver of 250 posted on 1 February allocates 200 to principal, 40 to interest and 10 to fees. The transaction debits Income from Interest (GL 404000) for 250 and credits Loan portfolio (GL 112601) for 200, Interest Receivable (GL 112603) for 40, Fees Receivable (GL 112603) for 10 and Overpayment (GL 245000) for 0. The reversal posts the exact opposite entries. For a charge-off account the same waiver debits Income from Interest (GL 404000) for 250 and credits Income from charge-off Interest (GL 404001) for 250 across the principal, interest, fees and penalties portions, plus Overpayment (GL 245000) for any overpayment; the reversal debits those accounts and credits Income from Interest (GL 404000). The figures are illustrative. The result changes with the account status: charge-off postings route the receivable portions through Income from charge-off Interest (GL 404001) instead of the individual receivable accounts.

| Entry | Account (GL) | Debit | Credit |
| --- | --- | --- | --- |
| Waiver posting | Income from Interest (404000) | 250.00 | — |
| Waiver posting | Loan portfolio (112601) | — | 200.00 |
| Waiver posting | Interest Receivable (112603) | — | 40.00 |
| Waiver posting | Fees Receivable (112603) | — | 10.00 |
| Waiver posting | Overpayment (245000) | — | 0.00 |
| Waiver reversal | Income from Interest (404000) | — | 250.00 |
| Waiver reversal | Loan portfolio (112601) | 200.00 | — |
| Waiver reversal | Interest Receivable (112603) | 40.00 | — |
| Waiver reversal | Fees Receivable (112603) | 10.00 | — |
| Waiver reversal | Overpayment (245000) | 0.00 | — |
