# Charge-Off

## Charge-off overview

Charge-off provides an accounting write-off option for delinquent loans while the loan portfolio remains active. The loan stays active and due for collection at the portfolio level, but is considered frozen, meaning no further transactions are expected though they can still occur and the loan does not close.

## Charge-off accounting entries

A charge-off transaction posts accounting entries when a loan is marked as charge-off.

Charge-off transaction entries:

| Debit GL | Credit GL | Type | Category |
| --- | --- | --- | --- |
| 744007 | 112601 | Expense / Asset | Credit loss-bad dept / Loan Portfolio |
| 404008 | 112603 | Income / Asset | Income from ChargeOff Fees / Penalty Receivable |

UNDO charge-off transaction entries:

| Debit GL | Credit GL | Type | Category |
| --- | --- | --- | --- |
| 112603 | 404008 | Asset / Income | Fees Receivable / Income from ChargeOff Fees |
| 112603 | 404008 | Asset / Income | Penalty Receivable / Income from ChargeOff Penalties |
| 112601 | 404008 | Asset / Income | Loan Portfolio / Income from ChargeOff Fees |

## Charge-off GL mapping

Charge-off accounting entries use new GL mapping fields in the loan product. Each field maps a charge-off amount to a general ledger account and type. Mapping is optional.

| Charge-off field | Maps to | GL type |
| --- | --- | --- |
| Charge-off expense - fraud | Credit Loss/Bad Debt Fraud | Expense |
| Charge-off interest income | Interest income charge off | Income |
| Charge-off fees income | Fee Charge off | Income |
| Charge-off expense | Credit Loss/Bad Debt | Expense |
| Charge-off penalty income | Fee Charge off | Income |

## Charge-off transaction

A charge-off transaction records the loan balance as a charge-off amount without changing the loan balance. Charge-off is triggered by non-payment of the remaining balance and is an accounting treatment, so it does not change data returned by existing APIs.

Charge-off amount rules:

- The charge-off amount equals the loan balance as of the charge-off date.
- The charge-off amount is non-editable and auto-calculated.
- A new dummy charge-off transaction is created for the charge-off amount.

## Charge-off date and timing

You can backdate a charge-off transaction, but not before the last transaction date. You cannot set a charge-off date in the future.

Charge-off reason code rules:

- You can configure multiple charge-off rules.
- You cannot configure the same reason code twice.

## Charge-off status and loan state

All actions, calculations, and transactions work normally as for a non-charge-off loan account. CHARGED_OFF status is never removed, even if the loan is PAID_OFF.

## Interest and discount after charge-off

Interest accrual stops on a charge-off loan account, and no further discount amortization happens after charge-off. Every process that recalculates interest checks the charge-off date and performs no interest calculation beyond it. If the charge-off status is reversed, accrual resumes from the date it was previously stopped, and the final amortization transaction and its accounting entries are undone.

## Transactions after charge-off

You can post all transaction types on a charge-off marked loan, and the accounting entries differ from those before charge-off. Chargeback, refunds, and other special case transactions are allowed, and the system does not restrict any transactions against the loan.

You cannot add charges after charge-off.

- Adding charges after charge-off is not allowed.

## Transactions before charge-off

You can add or reverse a transaction dated before the charge-off date. The system applies standard accounting JE rules, then reverses and replays the charge-off transaction so the charge-off amount increases or decreases based on the reversal or new posting. If a backdated transaction fully pays the loan, the system reverses the charge-off transaction and lifts the charge-off flag.

Restrictions:

- Reversing a transaction that happened before or on the charge-off date is not allowed.
- A backdated transaction dated before the charge-off is not allowed.

| Timing of transaction change | Accounting rule applied | Effect on charge-off |
| --- | --- | --- |
| Before the charge-off date | Standard accounting JE rules | Charge-off transaction is reversed and replayed; charge-off amount increases or decreases |
| After the charge-off date | Charge-off accounting JE rules | Charge-off transaction is reprocessed with balances changing |

## Charge-off reversal

You can reverse a charge-off only when the charge-off was applied in error. The reversal removes the charge-off tag from the loan. It is a remediation or exception process, not standard business activity.

Reversal is not supported when:

- Any transaction exists after the charge-off transaction.
- The loan was charged off correctly and the customer later cures or settles the balance.

## Undo charge-off

Undoing a charge-off restores the loan to its state before charge-off. You can provide a reverse external id, which is stored on the transaction. The transaction can then be fetched by external id, but not by the reverse external id.

Undo charge-off rules:

- Undo charge-off does not require any parameter.
- Undo charge-off behaves as undo write-off and uses the undo-charge-off command.

## Reverse-replay of charge-off

You can reverse-replay a charge-off transaction to increase or decrease the charge-off amount when a reversal is backdated or a new transaction posts. Reverse-replay for charge-off must be implemented. The charge-off flag is lifted and reapplied only when the charge-off transaction is reprocessed.

Journal entry creation happens immediately when:

- a new loan transaction is reverse-replayed

## Charge-off restrictions

You cannot reschedule, restructure installments, or add a new charge on a loan account marked as a charge-off. A second charge-off on an already charged-off account returns a validation error, and the same applies to undo charge-off.

## Charge-off event

The system raises a charge-off event whenever a charge-off happens for a loan account. The event carries an unpaidCharges array listing each unpaid charge group by charge name, with one object per charge name.

| Field | Type | Source | Example |
| --- | --- | --- | --- |
| chargeId | Long | transaction.loan.loanCharges.charge.id | 1 |
| chargeName | String | transaction.loan.loanCharges.charge.name | SNOOZEFEE |
| outstandingAmount | BigDecimal | Sum of transaction.loan.loanCharges.amountOutstanding where the loan charge is unpaid | 8 |

## Charge-off API

Use the Loan transaction API with the charge-off command to apply a charge-off to a loan. The Loan API also exposes a charged-off flag that indicates whether a loan is charged off.

Charge-off input parameters are:

- Charge-off date (date field)
- Charge-off reason (drop down, optional)
- Note (string, optional)
- External ID (string, optional)

## Charge-off UI

The Charge-off button appears on the Loan details page. The Undo charge-off button appears there only when the loan is already charged-off. Supported fields during charge-off are transactionDate, note, locale, dateFormat, chargeOffReasonId, and externalId. There are no fees or penalties for any charged-off loan, and no validations are added for this on Fineract side.

## Accounting JE rules before and after charge-off

Transactions after the charge-off date follow charge-off accounting JE rules, while transactions before that date follow pre-charge-off rules.

> **Note:** The current implementation creates journal entries in bulk at the end of reverse-replay and cannot distinguish pre and post charge-off entries at the moment.

Possible strategies for creating journal entries based on the Charge off flag are:

- Create GL entries one by one per transaction.
- Create GL entries in bulk as PRE-Chargeoff and POST-Chargeoff groups.

## Charge-off accounting mappings by scenario

Charge-off accounting mappings depend on the scenario, the portion of the payment, and whether the loan is charged off.

| Scenario | Portion | Debit | Credit |
| --- | --- | --- | --- |
| Charge off Fraud | Interest | Interest income charge off | Fee Receivable |
| Charge off Fraud | Interest | charge-off interest income | Interest Receivable |
| Charge off Fraud | Fees | Fee Charge off | Fee Receivable |
| Charge off Fraud | Fees | charge-off fees Income | Fees Receivable |
| Charge off Fraud | Penalty | Fee Charge off | Fee Receivable |
| Charge off Fraud | Penalty | charge-off Penalty Income | Penalty Receivable |
| Charge off Non Fraud | Interest | Interest income charge off | Fee Receivable |
| Charge off Non Fraud | Interest | charge-off interest income | Interest Receivable |
| Charge off Non Fraud | Fees | Fee Charge off | Fee Receivable |
| Charge off Non Fraud | Fees | charge-off fees Income | Fees Receivable |
| Charge off Non Fraud | Penalty | Fee Charge off | Fee Receivable |
| Charge off Non Fraud | Penalty | charge-off Penalty Income | Penalty Receivable |
| Charge adjustment | Fees | Fee Income | Fee Charge off |
| Charge adjustment | Fees | income from fees | charge-off fees Income |
| Charge adjustment | Unallocated Credit (UNC) | Fee Income | Other Credit liability |
| Charge adjustment | Unallocated Credit (UNC) | income from fees | Overpayment Liability |
| Charge adjustment | Penalty | Fee Income | Fee Charge off |
| Charge adjustment | Penalty | income from penalties | charge-off Penalty Income |
| OCA Repayment | Interest | Other receivables | recoveries |
| OCA Repayment | Interest | fund source /advance accounting | Income from Recovery payment |
| OCA Repayment | Fees | Other receivables | recoveries |
| OCA Repayment | Fees | fund source /advance accounting | Income from Recovery payment |
| OCA Repayment | Unallocated Credit (UNC) | Other receivables | Other Credit liability |
| OCA Repayment | Unallocated Credit (UNC) | fund source /advance accounting | Overpayment Liability |
| OCA Repayment | Penalty | Other receivables | recoveries |
| OCA Repayment | Penalty | fund source /advance accounting | Income from Recovery payment |

| Scenario | Status | Portion | Debit | Credit |
| --- | --- | --- | --- | --- |
| Loan Disbursement | Cash Out | Principal | 112601 | 145023 |
| Transaction Refund/Provisional Credit | Cash in | Interest - Repayment | 145023 | 112603 |
| Transaction Refund/Provisional Credit | Cash in | Late Fee Payment | 145023 | 112603 |
| Transaction Refund/Provisional Credit | Cash in | NSF Fee Payment | 145023 | 112603 |
| Transaction Refund/Provisional Credit | Cash in | Snooze Fee Payment | 145023 | 112603 |
| Transaction Refund/Provisional Credit | Cash in | Principal Payment | 145023 | 112601 |
| Transaction Refund/Provisional Credit | Cash in | Unallocated Credit (UNC) | 145023 | 245000 |
| Transaction Refund/Provisional Credit | Cash in, Charged off Flag Y | Interest - Repayment | 145023 | 404001 |
| Transaction Refund/Provisional Credit | Cash in, Charged off Flag Y | Late Fee Payment | 145023 | 404008 |
| Transaction Refund/Provisional Credit | Cash in, Charged off Flag Y | NSF Fee Payment | 145023 | 404008 |
| Transaction Refund/Provisional Credit | Cash in, Charged off Flag Y | Snooze Fee Payment | 145023 | 404008 |
| Transaction Refund/Provisional Credit | Cash in, Charged off Flag Y | Principal Payment | 145023 | 744007/740037 |
| Transaction Refund/Provisional Credit | Cash in, Charged off Flag Y | Unallocated Credit (UNC) | 145023 | 245000 |
| Transaction Refund/Provisional Credit | Cash Out, Charged off Flag Y | Interest - Repayment | 112603 | 145023 |
| Transaction Refund/Provisional Credit | Cash Out, Charged off Flag Y | Late Fee Payment | 112603 | 145023 |
| Transaction Refund/Provisional Credit | Cash Out, Charged off Flag Y | NSF Fee Payment | 112603 | 145023 |
| Transaction Refund/Provisional Credit | Cash Out, Charged off Flag Y | Snooze Fee Payment | 112603 | 145023 |
| Transaction Refund/Provisional Credit | Cash Out, Charged off Flag Y | Principal Payment | 112601 | 145023 |
| Transaction Refund/Provisional Credit | Cash Out, Charged off Flag Y | Unallocated Credit (UNC) | 245000 | 145023 |
| Transaction Refund/Provisional Credit | Cash Out, Charged off Flag Y, Reversal Indicator Y | Interest - Repayment | 404001 | 145023 |
| Transaction Refund/Provisional Credit | Cash Out, Charged off Flag Y, Reversal Indicator Y | Late Fee Payment | 404008 | 145023 |
| Transaction Refund/Provisional Credit | Cash Out, Charged off Flag Y, Reversal Indicator Y | NSF Fee Payment | 404008 | 145023 |
| Transaction Refund/Provisional Credit | Cash Out, Charged off Flag Y, Reversal Indicator Y | Snooze Fee Payment | 404008 | 145023 |
| Transaction Refund/Provisional Credit | Cash Out, Charged off Flag Y, Reversal Indicator Y | Principal Payment | 744007/740037 | 145023 |
| Transaction Refund/Provisional Credit | Cash Out, Charged off Flag Y, Reversal Indicator Y | Unallocated Credit (UNC) | 245000 | 145023 |
| Good Will | No Cash | Interest - Repayment | 404001 | 112603 |
| Good Will | No Cash | Late Fee Payment | 744003 | 112603 |
| Good Will | No Cash | NSF Fee Payment | 744003 | 112603 |
| Good Will | No Cash | Snooze Fee Payment | 744003 | 112603 |
| Good Will | No Cash | Principal Payment | 744003 | 112601 |
| Good Will | No Cash | Unallocated Credit (UNC) | 744003 | 245000 |
| Good Will | No Cash, Charged off Flag Y | Interest - Repayment | 404001 | 744008 |
| Good Will | No Cash, Charged off Flag Y | Late Fee Payment | 744003 | 744008 |
| Good Will | No Cash, Charged off Flag Y | NSF Fee Payment | 744003 | 744008 |
| Good Will | No Cash, Charged off Flag Y | Snooze Fee Payment | 744003 | 744008 |
| Late Fee Waiver | No Cash | Late Fee Payment | 404007 | 112603 |
| Late Fee Waiver | No Cash, Charged off Flag Y | Late Fee Payment | 404007 | 404008 |
| Late Fee Waiver | No Cash, Charged off Flag Y, Reversal Indicator Y | Late Fee Payment | 112603 | 404007 |
| Late Fee Waiver | No Cash, Charged off Flag Y, Reversal Indicator Y | Late Fee Payment | 404008 | 404007 |
| NSF Fee Waiver | No Cash | NSF Fee Payment | 404007 | 112603 |
| NSF Fee Waiver | No Cash, Charged off Flag Y | NSF Fee Payment | 404007 | 404008 |
| NSF Fee Waiver | No Cash, Charged off Flag Y, Reversal Indicator Y | NSF Fee Payment | 112603 | 404007 |
| NSF Fee Waiver | No Cash, Charged off Flag Y, Reversal Indicator Y | NSF Fee Payment | 404008 | 404007 |
| Apply Fee Return | No Cash | Late Fee Payment | N/A | N/A |
| Apply Fee Return | No Cash, Reversal Indicator Y | Late Fee Payment | N/A | N/A |

## Repayment strategy order

The repayment strategy order decides the sequence in which payments are applied to charge types on a loan. It applies when a payment is allocated after charge-off.

Payments are applied in this order:

- Due charges
- In advanced principal
- Penalty
- Fee
- Interest
- Principal

## Deferred charge-off options

Deferred charge-off options are available for non-interest bearing, progressive loan products.

## Worked examples

A delinquent loan has a principal balance of 2,000.00 in loans receivable principal (112601) and a fee receivable of 100.00 (112603), giving a total balance of 2,100.00. When the loan is marked as charge-off, the system posts a dummy charge-off transaction for the full balance. The charge-off amount is 2,100.00, is non-editable, and is auto-calculated as the loan balance as of the charge-off date. The loan remains ACTIVE and the portfolio balance does not change; the write-off happens only at the accounting level. The figures in this example are illustrative.

| Entry | Debit GL | Credit GL | Debit amount | Credit amount |
| --- | --- | --- | --- | --- |
| Charge-off expense | 744007 |  | 2,000.00 |  |
| Fee charge-off income | 404008 |  | 100.00 |  |
| Loans receivable principal |  | 112601 |  | 2,000.00 |
| Fee receivable |  | 112603 |  | 100.00 |
| Totals |  |  | 2,100.00 | 2,100.00 |

The example shows that charge-off writes off the receivable through accounting entries while the loan stays active and the portfolio balance is unchanged.

If the charge-off was posted in error and no transaction exists after it, the charge-off can be undone. Undoing restores the loan receivable (112601) and fee receivable (112603) and reverses the fee charge-off income. The loan remains ACTIVE throughout and is again treated as a normal active loan for collection. The figures are illustrative.

| Entry | Debit GL | Credit GL | Debit amount | Credit amount |
| --- | --- | --- | --- | --- |
| Restore loans receivable principal | 112601 |  | 2,000.00 |  |
| Restore fee receivable | 112603 |  | 100.00 |  |
| Reverse fee charge-off income |  | 404008 |  | 100.00 |
| Reverse charge-off expense |  | 744007 |  | 2,000.00 |
| Totals |  |  | 2,100.00 | 2,100.00 |

Undo reverses the accounting write-off and restores the receivables, while the loan remains active and eligible for normal collection.

A payment of 400.00 dated before the charge-off date is posted after the loan has been charged off. Because the transaction date precedes the charge-off, the system reverse-replays the charge-off: it reverses the original charge-off transaction and reposts it using the lower balance as of the charge-off date. The new charge-off amount is 1,700.00, consisting of 1,600.00 principal and 100.00 fee. Interest accrual remains stopped at the charge-off date and does not calculate interest for periods before it.

| Step | Debit GL | Credit GL | Debit amount | Credit amount |
| --- | --- | --- | --- | --- |
| Original charge-off (principal) | 744007 | 112601 | 2,000.00 | 2,000.00 |
| Original charge-off (fee) | 404008 | 112603 | 100.00 | 100.00 |
| Reverse original (principal) | 112601 | 744007 | 2,000.00 | 2,000.00 |
| Reverse original (fee) | 112603 | 404008 | 100.00 | 100.00 |
| Repost charge-off (principal) | 744007 | 112601 | 1,600.00 | 1,600.00 |
| Repost charge-off (fee) | 404008 | 112603 | 100.00 | 100.00 |
| Net adjustment | 112601 | 744007 | 400.00 | 400.00 |

The example shows that a backdated payment reduces the charge-off amount through reverse-replay, and the loan remains active with accrual stopped at the charge-off date. If the backdated payment fully pays the loan, the charge-off transaction is reversed and the charge-off flag is lifted instead of merely reducing the amount.

See also: [Payment Allocation Strategies](../repayment/strategies.md).
