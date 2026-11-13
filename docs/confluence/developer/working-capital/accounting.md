# Accounting

## Accounting rules and options

Product accounting values are NONE, ACC_DEF_REV_AM (accrual / deferred-revenue amortization), and ADVANCED (with rules). Override values are allowAttributeOverrides all true and all false; a loan must reject when all false.

## Working Capital product accounting setup

A Working Capital product requires the accountingRule parameter when you create it. The value must be NONE or CASH_BASED. With NONE, the product can be created without setting accounting parameters. With CASH_BASED, creation or editing fails if receivableFeeAccountId is not set. A product can be created when all mandatory fields are set. Breach grace days may be left empty; the system treats it as not set or 0.

## None accounting

None accounting means no accounting configuration is needed and no journal entries are created during the loan lifecycle. The loan product is created or updated without accounting mapping.

Created journal entries are created in the regular table acc_gl_journal_entry.

## Cash based accounting

Cash based accounting recognizes interest only when a monetary event such as a repayment occurs, and calculates the income based on the transaction amount. GL account mapping can be configured for Working Capital loan products when Cash based accounting is selected, with GL mappings available to configure similarly to regular term loans.

## Advance accounting rules

Advance accounting rules apply to Working Capital loans and take priority over the regular Fund Source mapping when both Advance accounting rules and Configure Fund Sources for Payment Channels are mapped.

Mapping rules for Working Capital:

- Advance accounting rules mapping is possible for Working Capital loans.
- Mapping from the UI follows the same approach as term loan products, except capitalized income and buydown fees mapping.

## GL mapping configuration

You can update or delete GL accounting mappings on a loan product. Before you submit, every parameter must be mapped to a GL account.

## Repayment accounting

Repayment accounting posts a debit to the suspense/clearing account and credits to principal and fee receivable accounts. On a closed loan account, the credit goes to the overpayment liability account instead of principal. A repayment reversal reverses these entries. Disbursement debits Loans Receivable Principal and credits the suspense/clearing account; disbursement reversal does the opposite.

| Transaction | Debit | Credit |
| --- | --- | --- |
| Repayment | GLCode 145023 Suspense/clearing account (Fund source, Liability, Allocation Type Prin, Fees, Penalty and excess) | GLCode 112601 Loans Receivable Principal (Loan Portfolio, Asset, Prin); GLCode 245000 Other Credit liability (Overpayment Liability, Liability, excess); GLCode 112603 Fee Receivable (Penalty Receivable, Asset, Penalty); GLCode 112603 Fee Receivable (Fees Receivable, Asset, fees) |
| Repayment on closed loan account | GLCode 145023 Suspense/clearing account (Fund source, Liability, Allocation Type Prin, Fees, Penalty and excess) | GLCode 245000 Other Credit liability (Overpayment Liability, Liability, excess) |
| Repayment Reversal | GLCode 112601 Loans Receivable Principal (Loan Portfolio, Asset, Prin); GLCode 245000 Other Credit liability (Overpayment Liability, Liability, excess); GLCode 112603 Fee Receivable (Fees Receivable, Asset, fees); GLCode 112603 Fee Receivable (Penalty Receivable, Asset, Penalty) | GLCode 145023 Suspense/clearing account (Fund source, Asset/Liability, Prin, Fees, Penalty and excess) |
| Disbursement | GLCode 112601 Loans Receivable Principal (Loan Portfolio, Asset, Prin) | GLCode 145023 Suspense/clearing account (Fund source, Asset/Liability, Prin) |
| Disbursement Reversal | GLCode 145023 Suspense/clearing account (Fund source, Asset/Liability, Prin) | GLCode 112601 Loans Receivable Principal (Loan Portfolio, Asset, Prin) |

## CBR accounting

CBR accounting posts a debit to Other Credit liability GL 245000 (Overpayment Liability, Liability, excess) and a credit to Suspence/clearing account GL 145023 (Fund source, Asset/Liability, excess).

| Transaction | Debit GL | Credit GL |
| --- | --- | --- |
| CBR | 245000 Other Credit liability (Overpayment Liability, Liability, excess) | 145023 Suspence/clearing account (Fund source, Asset/Liability, excess) |
| CBR after charge-off | 245000 Other Credit liability (Overpayment Liability, Liability, excess) | 145023 Suspence/clearing account (Fund source, Asset/Liability, excess) |
| Repayment after charge-off | 145023 Suspence/clearing account (Fund source, Asset/Liability, Prin, Fees, and Penalty and excess) | 744008 recoveries (Income from Recovery Repayment, Income, Prin); 245000 Other Credit liability (Overpayment Liability, Liability, excess); 744008 recoveries (Income from Recovery Repayment, Income, Penalty); 744008 recoveries (Income from Recovery Repayment, Income, fees) |

## CBR reversal accounting

CBR reversal accounting posts a debit to Suspence/clearing account GL 145023 and a credit to Other Credit liability GL 245000.

After charge-off, CBR reversal posts the same debit and credit.

CBR reversal accounting entries

| Transaction type | Debit | Credit |
| --- | --- | --- |
| CBR Reversal | Suspence/clearing account GL 145023 (Fund source, Asset/Liability, excess) | Other Credit liability GL 245000 (Overpayment Liability, Liability, excess) |
| CBR Reversal after charge-off | Suspence/clearing account GL 145023 (Fund source, Asset/Liability, excess) | Other Credit liability GL 245000 (Overpayment Liability, Liability, excess) |

## Goodwill credit accounting

Goodwill credit accounting posts debits to principal, fee and penalty adjustment accounts and credits to loan receivable, fee receivable and overpayment liability accounts. Use it when you apply a goodwill credit to a loan account.

Goodwill credit accounting entries:

| Debit GL | Account | Type | Category |
| --- | --- | --- | --- |
| 744003 | Principal bal adjustment | Expense | Principal, excess |
| 404008 | Fee Charge off | Income | Fees |
| 404008 | Fee Charge off | Income | Penalty |

| Credit GL | Account | Type | Category |
| --- | --- | --- | --- |
| 112601 | Loans Receivable Principal | Asset | Principal |
| 112603 | Fee Receivable | Asset | Fees |
| 112603 | Fee Receivable | Asset | Penalty |
| 245000 | Other Credit liability | Liability | Excess |

After a charge-off, goodwill credit accounting debits principal bal adjustment GL 744003 and fee charge off GL 404008 for fees and penalty, and credits recoveries GL 744008 for principal, fees and penalty, plus other credit liability GL 245000.

## Goodwill credit reversal accounting

Goodwill credit reversal accounting posts debits to Loans Receivable Principal GL 112601, Fee Receivable GL 112603 for fees, Fee Receivable GL 112603 for penalties, and Other Credit liability GL 245000, and credits to Fee Charge off GL 404008 for fees and penalties and Principal bal adjustment GL 744003.

Debit entries for goodwill credit reversal:

| Debit GL | Account type | Category | Subcategory |
| --- | --- | --- | --- |
| 112601 Loans Receivable Principal | Asset | Loan Portfolio | prin |
| 112603 Fee Receivable | Asset | Fees Receivable | fees |
| 112603 Fee Receivable | Asset | Penalty Receivable | Penalty |
| 245000 Other Credit liability | Liability | Overpayment Liability | excess |

Credit entries for goodwill credit reversal:

| Credit GL | Account type | Category | Subcategory |
| --- | --- | --- | --- |
| 404008 Fee Charge off | Income | Income from Goodwill Credit Fees | fees |
| 404008 Fee Charge off | Income | Income from Goodwill Credit Penalty | Penatly |
| 744003 Principal bal adjustment | Expense | Expense from Goodwill Credit | Prin,excess |

When the loan account is closed, a GoodwillCredit transaction posts instead:

| Direction | GL | Account type | Category | Subcategory |
| --- | --- | --- | --- | --- |
| Debit | 744003 Principal bal adjustment | Expense | Expense from Goodwill Credit | Prin,excess |
| Credit | 245000 Other Credit liability | Liability | Overpayment Liability | excess |

Goodwill credit reversal after charge-off:

| Direction | GL | Account type | Category | Subcategory |
| --- | --- | --- | --- | --- |
| Debit | 744008 recoveries | Income | Income from Recovery Repayment | prin |
| Debit | 744008 recoveries | Income | Income from Recovery Repayment | fees |
| Debit | 744008 recoveries | Income | Income from Recovery Repayment | Penalty |
| Debit | 245000 Other Credit liability | Liability | Overpayment Liability | excess |
| Credit | 404008 Fee Charge off | Income | Income from Goodwill Credit Fees | fees |
| Credit | 404008 Fee Charge off | Income | Income from Goodwill Credit Penalty | Penatly |

## Charge adjustment accounting

Charge adjustment accounting posts a charge adjustment to the loan account by debiting fee income and crediting principal receivable, fee receivable, penalty receivable, or overpayment liability, depending on the charge type. The UNDO transaction is not implemented.

Charge adjustment transaction entries:

| Debit GL | Credit GL | Charge type |
| --- | --- | --- |
| 404007 Fee Income / Penalty Income (Income from charges, Income, prin,fees, and excess) | 112601 Loans Receivable Principal (Loan Portfolio, Asset, prin) | Principal |
| 404007 Fee Income / Penalty Income (Income from charges, Income, prin,fees, and excess) | 112603 Fee Receivable (Fees Receivable, Asset, fees) | Fee |
| 404007 Fee Income / Penalty Income (Income from charges, Income, prin,fees, and excess) | 112603 Fee Receivable (Penalty Receivable, Asset, Penalty) | Penalty |
| 404007 Fee Income / Penalty Income (Income from charges, Income, prin,fees, and excess) | 245000 Other Credit liability (Overpayment Liability, Liability, excess) | Excess |

## Charge-off accounting

Charge-off accounting posts the same accounting legs for charge-off loan accounts. A charge-off transaction debits GL 404008 Fee Charge off for both charge-off fees and charge-off penalties, and credits GL 112601 Loans Receivable Principal and GL 112603 Fee Receivable for fees and penalties. An undo charge-off transaction credits GL 744007 Credit loss-bad dept or GL 744037 Credit loss-bad dept-fraud based on the fraud flag. A charge adjustment transaction on a charge-off loan account credits GL 404008 Fee Charge off.

| Transaction | Debit GL | Credit GL |
| --- | --- | --- |
| Charge-off | 404008 Fee Charge off (fees) | 112601 Loans Receivable Principal |
| Charge-off | 404008 Fee Charge off (penalties) | 112603 Fee Receivable (fees) |
| Charge-off |  | 112603 Fee Receivable (penalties) |
| Undo charge-off |  | 744007 Credit loss-bad dept or 744037 Credit loss-bad dept-fraud |
| Charge adjustment on charge-off loan account |  | 404008 Fee Charge off |

## Charge addition accounting

Charge addition posts an accrual accounting entry that debits Fee Receivable GL 112603 and credits Fee Income GL 404007.

| Entry | GL | Name | Type | Category |
| --- | --- | --- | --- | --- |
| Debit | 112603 | Fee Receivable | Asset | Fees |
| Credit | 404007 | Fee Income | Income | Fees |

## Charge waive accounting

When you waive a charge, the system debits Fee Income GL 404007 (Income from Fees, Income, fees) and credits Fee Receivable GL 112603 (Fees Receivable, Asset, fees).

## Discount fee accounting

Discount fee accounting posts entries when a discount fee is charged, adjusted, or amortized. Entries use allocation type Prin, Fees, and Penalty.

| Event | Debit GL | Credit GL | Allocation type |
| --- | --- | --- | --- |
| Discount fee charged | Loans Receivable Principal GL 112601 (Loan Portfolio, Asset) | Deferred Interest GL 240005 (Deferred Income, Liability) | Prin, Fees, and Penalty |
| Discount fee adjustment | Deferred Interest GL 240005 (Deferred Income, Liability) | Loans Receivable Principal GL 112601 (Loan Portfolio, Asset) | Prin, Fees, and Penalty |
| Amortization | Deferred Interest GL 240005 (Deferred Income, Liability, Int) | Interest income GL 404000 (Income from Amortization, Income, Int) | Prin, Fees, and Penalty |
| Amortization after charge-off | Deferred Interest GL 240005 (Deferred Income, Liability, Int) | Interest income GL 404000 (Income from Amortization, Income, Int) | Prin, Fees, and Penalty |

## Payout refund payment accounting

A payout refund payment posts to one set of general ledger accounts on an active loan account and another set on a charge-off loan account. Each payment type debits Fund source GL 145023 and credits the account shown below. Unallocated Credit credits Over payment liability GL 245000 on both account types.

| Account type | Payment type | Debit GL | Credit GL |
| --- | --- | --- | --- |
| Active loan account | Penalty | 145023 | 112603 |
| Active loan account | Fees | 145023 | 112603 |
| Active loan account | Principal | 145023 | 112601 |
| Active loan account | Unallocated Credit (UNC) | 145023 | 245000 |
| Charge-off loan account | Penalty | 145023 | 404008 |
| Charge-off loan account | Fees | 145023 | 404008 |
| Charge-off loan account | Principal | 145023 | 744007/740037 |
| Charge-off loan account | Unallocated Credit (UNC) | 145023 | 245000 |

## Payout refund reversal payment accounting

A payout refund reversal payment posts each component to a debit GL and credits Fund source GL 145023. The debit GL depends on whether the loan account is active or charge-off.

| Component | Active loan account debit GL | Charge-off loan account debit GL | Credit GL |
| --- | --- | --- | --- |
| Penalty | Penalties Receivable GL 112603 | Income from ChargeOff Penalty GL 404008 | Fund source GL 145023 |
| Fees | Fees Receivable GL 112603 | Income from ChargeOff Fees GL 404008 | Fund source GL 145023 |
| Principal | Loan portfolio GL 112601 | ChargeOff Expense/Charge Off Fraud Expense GL 744007/740037 | Fund source GL 145023 |
| Unallocated Credit (UNC) | Over payment liability GL 245000 | Over payment liability GL 245000 | Fund source GL 145023 |

## Charge-off feature mappings

Charge-off feature mappings let you map charge-off specific accounting parameters to GL accounts in the loan product. Mapping these parameters is optional.

## Discount fee fields and timing

The single Discount field is broken down into Proposed discount, Approved discount, and Disbursed discount. The three fields are stored at loan account level and shown at loan account view. Discount timing values are none, at approval, at disbursement, added after disbursement, and adjusted.

Each discount field is set as follows:

- Proposed discount is entered or modified when you create the loan.
- Approved discount is entered when you approve the loan.
- Approved discount resets to zero when you undo approve.

## Discount fee rules

You can add a discount fee to a loan account through the API or the UI. Whether you can add it after disbursement depends on when it was first added. If the discount fee was added at loan creation or approval, you cannot add it again after disbursement.

Rules for adding a discount fee:

- You can add the discount fee only once at the time of disbursement.

## Discount fee amortization

Discount fee amortization spreads a discount fee across the life of a loan. Each daily amortization is the increment of the running total, rounded once, so the schedule and the loan show the same numbers after every close of business (COB), the nightly job that posts interest and fees. The sum of amortized and not yet amortized amounts always equals the discount fee net of discount fee adjustments, and the deferred discount fee balance can never be negative.

| Amortization type | Rule |
| --- | --- |
| Flat | The amortization schedule follows discount fee calculation based on flat ratio. |
| Flat | If the loan is fully paid, total aggregated discount fee amortization matches the initial discount fee. |
| Flat | A discount fee adjustment decreases total aggregated discount fee amortization. |

Flat amortization uses a ratio of payable discount fee for the initial loan balance to calculate the discount fee amortization amount based on the repayment amount.

## Model consistency and date testing

The system tests submitted and created dates with business date on or off. The persisted working capital loan amortization model stays consistent with the loan balance after every transaction.

## Accounting consistency across types

Accounting entries remain the same for both cash based and accrual based accounting types.

> **Note:** Validation at the loan account is required to do GL mapping of new parameters to use the charge-off feature.

## Loan account view fields

The Account Details tab of the loan account view shows calculated values for Period Payment, Daily EIR, Annual EIR, Number of Repayments, Currency, Proposed Discount, Approved Discount, Disbursed Discount, and Amortization type (Flat or EIR).

The amortization schedule shows:

- Serial number of the transaction.
- Amortization date based on the input frequency.
- Expected payment as the calculated period payment amount.
- Expected amortization amount as a calculated value.
- Paid date.
- Actual payment amount.
- Balance of the loan, which adds disbursement and discount amount and subtracts payment amount when payment is made.
- Actual amortization amount as a calculated amortized amount.
- Fees amount, if any.
- Penalty amount, if any.
- Income modification as total expected amortization minus actual amortization as of the payment date.
- Deferred balance as discount amount balance.

Transaction details show:

- Serial number of the transaction.
- Id as DB Id.
- External Id.
- Transaction date.
- Transaction type.
- Amount paid.
- Principal paid portion.
- Amortized income portion as either interest or fee portion.
- Fees paid portion.
- Penalty paid portion.
- Principal balance as total principal balance.

Balances show:

- Principal outstanding.
- Total paid principal.
- Total payment.
- Unrealized income (Discount fee).
- Realized income (Discount fee).

## Submitted date accrual display

When submitted-date based accrual accounting is turned on, the submitted on date appears on the charges tab and is properly filled. When it is off, the charges tab remains as is.
