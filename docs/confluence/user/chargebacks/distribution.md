# Chargeback Distribution

## Chargeback Distribution

### Chargeback basics

You can add a chargeback transaction to goodwill credit, payout refund, and merchant refund transactions using the UI. Chargebacks also apply to down-payment transactions, where the trigger point is available but the functionality remains the same. A chargeback creates a new charge due at initiation rather than reversing the previous charge, so the customer is not delinquent from the date of the original transaction. Chargebacks are not allowed for reversed transactions, and interest on chargeback is out of scope because the current advance allocation strategy does not support interest calculation.

### Chargeback API

You call the Chargeback API using the endpoint /loans/<loan_id>/transactions/<transaction_id>?command=chargeback. If the transaction does not belong to the loan, the API returns HTTP 404 for transaction reversal, chargeback, undo loan charge transaction, and fetch loan details.

### Chargeback processing classes

Chargeback processing uses one of two transaction processors, depending on the loan type and whether Chargeback transaction allocation rules are set.

The processor used depends on the loan type and allocation setup:

- For non-progressive loans and progressive loans without Chargeback transaction allocation rules, chargeback processing uses AbstractLoanRepaymentScheduleTransactionProcessor#handle chargeback.
- For progressive loans where Chargeback transaction allocation rules were set, chargeback processing uses AdvancedPaymentScheduleTransactionProcessor#handle chargeback.

For progressive loans with no interest recalculation and no Chargeback transaction allocation rules set, chargeback processing uses AbstractLoanRepaymentScheduleTransactionProcessor#handle chargeback.

For progressive, interest bearing loans with interest recalculation set to true and no Chargeback allocation set, new handling is required in AdvancedPaymentScheduleTransactionProcessor#handle chargeback.

### Payment allocation configuration

You configure how chargeback amounts are allocated at the loan product level using the advance payment allocation strategy, and advanced allocation rules for the chargeback transaction type are configurable.

The selectable priority fields are:

- Penalties
- Fees
- Interest
- Principal

The default payment allocation rule configuration order is:

- 1 Fees
- 2 Penalty
- 3 Interest
- 4 Principal

1. Open the loan product.
2. Go to the Payment allocation tab.
3. Set the payment allocation priority order for the charge-back transaction in the advance payment allocation strategy.
4. Select the priority among Penalties, Fees, Interest, and Principal.

You can do a chargeback on the down-payment transaction type from the UI similar to the repayment transaction type.

### Chargeback amount allocation behavior

Chargeback amount allocation distributes the chargeback amount to the next installment or the N+1 installment from the repayment being chargebacked. It supports Charge, Interest, Penalty, and Principal allocations based on the transaction allocation from which the chargeback is raised. Interest portion allocation is out of scope.

The following rules govern how amounts are allocated during a chargeback:

- Payment allocation obeys the priority set at the advance payment allocation strategy, and the latest payment takes priority under the same amount portion.
- When there are two fees for the repayment and a partial payment comes in, the latest fees are allocated first and then the oldest.
- Payment is applied to the due fee first, then oldest principal per payment allocation rules.
- New fees or Penalties are created on the chargeback date for the fees or penalty amount being allocated during the chargeback.
- The same Fees or Penalty are added back on the chargeback submitted date that was associated with the repayment that the chargeback was created from.
- If a chargeback results in a new charge being due, the due date and delinquency evaluation period of that charge begin from the date of the chargeback.

Users can view the transaction relation to a chargeback transaction in transaction details.

### Aging calculation examples

Aging calculations for installments start as of a subsequent installment due date after a chargeback.

Examples of aging calculation start dates:

- Installments 1 and 2 both start as of 31 Jan.
- Installments 1 through 4 start as of 21 Feb.
- Installment 2 starts as of 21 Feb.

Installment due dates:

- Installment 2 is not due until 1/31.

### Worked examples

A customer takes a $500.00 loan disbursed in full on 1-Jan, with four installments of $125.00 due on 1-Jan, 16-Jan, 31-Jan, and 15-Feb. The borrower pays $125.00 on 4-Jan and another $125.00 on 16-Jan. On 20-Jan, the officer chargebacks both payments for a total of $250.00. The figures in this example are illustrative.

| Date | Transaction | Balance | Installment 1 | Installment 2 | Installment 3 | Installment 4 |
| --- | --- | --- | --- | --- | --- | --- |
| 1-Jan | Loan start | 500.00 | 125.00 | 125.00 | 125.00 | 125.00 |
| 4-Jan | Payment 125.00 | 375.00 | 0.00 | 125.00 | 125.00 | 125.00 |
| 16-Jan | Payment 125.00 | 250.00 | 0.00 | 0.00 | 125.00 | 125.00 |
| 20-Jan | Chargeback 250.00 | 500.00 | 0.00 | 0.00 | 375.00 | 125.00 |
| 31-Jan | Payment 375.00 | 125.00 | 0.00 | 0.00 | 0.00 | 125.00 |
| 15-Feb | Payment 125.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |

The chargeback restores the principal balance to $500.00 and moves the recovered amount onto the next installment, so the borrower owes $375.00 on 31-Jan instead of $125.00.

A $500.00 loan disbursed on 1-Jan carries a $3.00 fee and four installments of $125.00. The borrower pays $128.00 on 4-Jan, clearing the fee and the first installment, and pays another $125.00 on 16-Jan. On 20-Jan, the officer chargebacks $53.00 of the first payment.

| Date | Transaction | Balance | Due fee | Installment 3 | Installment 4 | Past due principal |
| --- | --- | --- | --- | --- | --- | --- |
| 1-Jan | Loan start | 500.00 | 3.00 | 125.00 | 125.00 | 0.00 |
| 4-Jan | Payment 128.00 | 375.00 | 0.00 | 125.00 | 125.00 | 0.00 |
| 16-Jan | Payment 125.00 | 250.00 | 0.00 | 125.00 | 125.00 | 0.00 |
| 20-Jan | Chargeback 53.00 | 300.00 | 3.00 | 175.00 | 125.00 | 0.00 |
| 31-Jan | Payment 175.00 | 128.00 | 0.00 | 3.00 | 125.00 | 3.00 |
| 15-Feb | Payment 128.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |

Because the chargeback is partial, the $3.00 fee stays due and only $50.00 is added back to the principal, raising the next installment to $175.00.

A repayment of $100.00 is made up of a $10.00 fee and $90.00 principal. The product’s chargeback allocation order is Principal, then Interest, then Penalty, then Fee. The officer chargebacks $50.00 and then $95.00 against that repayment.

| Chargeback | Principal | Fee | New fee |
| --- | --- | --- | --- |
| 50.00 | 50.00 | 0.00 | 0.00 |
| 95.00 | 90.00 | 5.00 | 5.00 |

The chargeback follows the configured priority, and any fee portion is recreated as a new fee on the chargeback date.

A repayment of $100.00 includes a $10.00 fee, a $10.00 penalty, and $80.00 principal. The chargeback allocation order is Penalty, then Fee, then Principal, then Interest. The officer chargebacks $95.00.

| Chargeback | Penalty | Fee | Principal | New penalty | New fee |
| --- | --- | --- | --- | --- | --- |
| 95.00 | 10.00 | 10.00 | 75.00 | 10.00 | 10.00 |

The chargeback consumes the penalty and fee first, puts the rest toward principal, and recreates both the fee and penalty as new charges on the chargeback date.
