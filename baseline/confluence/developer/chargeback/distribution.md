# Chargeback Distribution

## Chargeback overview

Chargeback creates a credit amount for a previous repayment and adds it to the current installment without touching previous repayments or accounting, so the missed payment is collected as of the current date. You select the repayment to reverse and click chargeback on that repayment. Chargeback supports goodwill credit, payout refund, and merchant refund transaction types, and supports chargeback amounts for all amount allocations: Charge, Interest, Penalty, and Principal, based on the transaction allocation from which the chargeback is raised.

## Eligible transactions

You can add a chargeback transaction to goodwill credit, payout refund, merchant issued refund, down-payment, and repayment transactions. Chargeback is not allowed for reversed transactions.

Repayment after chargeback on the same business date completes without error.

## Chargeback API

Use the chargeback API to reverse a loan transaction. Send the chargeback command to /loans/<loan_id>/transactions/<transaction_id>?command=chargeback. The LoanRepaymentChargebackCommandHandler processes the command, and LoanWritePlatformServiceJpaRepositoryImpl#chargebackLoanTransaction performs the reversal.

## Chargeback amount and allocation

A chargeback allocates the charged-back amount across charge, interest, penalty, and principal portions based on the allocation of the related repayment transaction. The charged-back amount cannot exceed the amount of the related repayment or payment transaction.

Allocation rules:

- Chargeback amount allocation priority is configurable.
- If the original transaction portions change, the chargeback is recalculated and reallocated.
- A chargeback includes the interest portion if the related payment includes interest.

## Payment allocation priority

Payment allocation follows the order set in the Payment Allocation Rule Configuration: fees first, penalty second, interest third, and principal fourth. Within the same amount portion, the latest payment takes priority. When a partial payment covers two fees, the latest fee is allocated first and then the oldest. Payment is applied to the due fee first, then to the oldest principal.

## Schedule and installment impact

A chargeback adds its amount to the next installment in the repayment schedule. The next installment is the current installment when the current date is before its due date, and the period just after the current period when the current date is on the due date.

## Interest and accrual

Interest accrues on principal that a chargeback increases before the maturity date. No interest accrues on charged-back principal on or after the maturity date, and no interest recalculation is needed then. Credited interest on a period increases that period's EMI. Fineract does not create accrual transactions for charged-back amounts or charged-back interest.

## New charges and due dates

When a chargeback creates a new charge, the system adds the fee or penalty on the chargeback date, and the charge's due date and delinquency evaluation period begin on that date.

## Overpayment handling

An overpayment occurs when a refund exceeds the outstanding principal balance, and the excess is recorded as overpayment. The loan status depends on whether the overpayment amount is greater than or lower than the chargeback reversal (CBR) amount. A backdated overpayment requires a CBR, and no information about it is distributed to other systems because close of business does not consider backdated events.

The loan status changes as follows:

- If the overpayment amount is greater than the CBR, the loan remains in Overpaid status, and the overpayment amount becomes the difference between the CBR and the overpayment balance.
- If the overpayment amount is lower than the CBR, the loan moves from Overpaid to Active, and the due principal amount becomes the difference between the CBR and the overpayment balance.

## Accounting entries

| Transaction | Credit GL account | Account type | Nature |
| --- | --- | --- | --- |
| CBR Transaction | 145023 Suspence/clearing account | Asset/Liability | excess |
| UNDO CBR Transaction | 245000 Other Credit liability | Liability | excess |

## Transaction details and editing

You can view the relationship between a transaction and its chargeback transaction in transaction details. The UI editing button is not available for Goodwill Credit, Payout Refund and Merchant Issued Refund transactions.
