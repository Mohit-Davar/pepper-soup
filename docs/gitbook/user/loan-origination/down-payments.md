# Down Payments

## Down Payments

### Down payment configuration

You can configure down payments at the loan product level so the system collects the down-payment amount when the loan is disbursed. The down-payment amount can be a percentage of the disbursement amount, and you can choose whether collection happens automatically or manually. You can also enable or disable auto repayment for down payments.

The product configuration screen includes the following down-payment settings:

- Enable or disable the down-payment option at the loan product level.
- Specify the percentage of the disbursed amount to collect as down payment.
- Enable or disable auto repayment for down payments, which subtracts from the disbursed amount or the created payment transaction.
- Enable or disable the option not to extend the loan schedule for multi-disbursal loans.
- Select the repayment start date option at the loan product level.
- Enable or disable the do not extend loan schedule checkbox at the loan product level.

You configure down payments from the UI product configuration screen.

### Scope and existing accounts

Down payment applies to all loan accounts of a loan product once it is enabled for that product, and to all disbursements of those accounts. The down-payment percentage defined at the loan product level applies to all disbursements of those accounts. Changes to down-payment configuration at the loan product level affect only new loan accounts; existing accounts keep their existing configuration.

### Repayment start date

The loan product includes a drop-down option to select the repayment start date from either the loan submitted date or the loan disbursed date. The loan disbursed date is the default option.

The selected date determines the basis for generating the repayment schedule:

- When Loan Submitted Date is selected, the repayment schedule is generated based on the loan submitted date.
- When Loan Disbursed Date is selected, the repayment schedule is generated based on the loan disbursed date.

### Schedule generation and display

When down-payment configuration is enabled, the repayment schedule includes down-payment installments at the created and approved states, using the default amount and default date as the expected disbursement. This applies to both single and multi-disbursement loans.

If a down-payment installment falls on an existing regular installment due-date, the schedule shows two installments on that date.

- If a down-payment installment falls on an existing regular installment due-date, the schedule shows two installments on that date.

### Down payment installment behavior

A down payment is treated like an installment for amount allocation, repayment fulfillment, overdue, arrears and delinquency calculations. It always starts and is due on the day the related disbursement occurs, and its due amount is based on the down payment percentage set in the product configuration. When payment allocation is introduced, repayment on down payments follows the new allocations. Down payment installments do not move during a schedule reschedule.

Down payment installment creation and lifecycle rules:

- The system creates one down payment installment for each disbursement, even when multiple disbursements fall on the same date.
- If two down payments happen on the same day, the system creates two down payment installments.
- A down payment installment always belongs to a disbursement; if that disbursement is reverted, its down payment installment is deleted, and with multiple disbursements only the related down payment installment is deleted.

### Disbursement reversal

You can reverse a disbursement when a down payment is involved. Reversing the second disbursement reverses the down payment as well, and the system reverts the related accounting entries.

Auto-down-payment reversals follow these rules:

- With auto-down-payment, the system reverts the down payment transaction as well.
- Without auto-down-payment, if no payment happened, the system deletes the instalment.
- Without auto-down-payment, if a payment happened, reversal is not allowed.

### Auto repayment

Auto repayment for down payments applies to all new loan accounts and every disbursement for a loan product when the setting is enabled. At disbursement, the system posts a down payment transaction for the down payment amount using the down payment transaction type. This transaction type works like a repayment and uses the same accounting.

### Payment allocation and priority

You can make a repayment using the DownPayment payment type. When a regular instalment and a downpayment instalment fall due on the same date, the regular instalment takes priority and must be fully paid before any payment goes toward the downpayment instalment. This priority rule applies to all existing payment allocation rules.

### Events and delinquency

A down payment instalment is treated like any other instalment for event handling and delinquency. When it is due, the system sends a payment due event, and delinquency calculation counts it just like any other instalment.

### Charges and interest

Charges and interest are never added to a down-payment instalment. They are allocated to the next regular instalment instead.

The following rules apply to charges and interest on down payments:

- Specified due-date charges are allocated to the next down-payment or installment, whichever is next.
- A charge-back applied on one of the repayments is added to the next down-payment or installment, whichever is next.
- No charges or chargebacks can be added to a down-payment instalment, including instalment fee, specified due-day charges, and NSF penalty.
- No interest can be added to a down-payment instalment.

### Backdated disbursement

A backdated disbursement cannot occur before loan submission. Whether the schedule changes depends on the schedule basis: if it is based on the loan submission date, no reschedule happens; if it is based on the first disbursement date and a disbursement has already occurred, the loan is rescheduled according to the new disbursement date. When backdated disbursement happens, the system regenerates the loan schedule and reprocesses the transactions.

### Multi-disbursement schedule extension

The loan inherits the do not extend loan schedule configuration. When this setting is enabled for multi-disbursal loans, the schedule is not extended and Fineract distributes the disbursed amount among the existing instalments. When it is disabled, the schedule follows the default Fineract behaviour and extends to the exact number of repayments configured.

### Loan term and repayments

When a down payment is enabled, the loan term is based on the number of repayments excluding the down payment. Rescheduling the repayment schedule does not produce an error. Interest calculations on an interest-bearing loan with a down payment are not always correct. For a Pay in 3 installment loan with a down payment, the last installment receives the extra amount instead of the second installment.

The following behaviour applies at loan account creation:

- The Loan Term field is read only.
- The UI highlights that the loan term is defined by the number of repayments minus 1.
- A tool-tip on the number of repayment field instructs you not to count the down payment as an installment.

### Over applied amount settings

Over applied amount settings control whether a loan product can approve or disburse more than the applied amount and how those changes can be made.

The following rules apply when changing over applied amount settings on a loan product:

- Users can disable 'Allow Approved / Disbursed Amounts Over Applied' during create or update.
- A loan product with 'Allow approval / disbursal above loan applied amount' enabled cannot be updated with that setting disabled when 'Disallow expected tranches' is enabled.
- A loan product with 'Allow approval / disbursal above loan applied amount' enabled cannot be updated to disable 'Enable Multiple Disbursals' or disable 'Disallow expected tranches' while that setting remains enabled.
- Users can create or modify a loan product and change from multi to single disbursement while 'Allow Approved / Disbursed Amounts Over Applied' is enabled or uncheck 'disallow disbursement details'.

The system shows the following error messages when these changes are attempted under these conditions:

- 'Disallow Expected Disbursals Not Set - Allow Approved / Disbursed Amounts Over Applied Can't Be Set' when attempting to disable 'Allow approval / disbursal above loan applied amount'.
- 'Allow Approved / Disbursed Amounts Over Applied is Not Set - Over Applied Calculation Type Can't Be Entered' when attempting these changes under these conditions.

### EMI calculation

The system calculates each EMI by deducting the downpayment principal from the principal balance, even when the downpayment transaction has not been paid. A charge is added into the next installment. A user can undo a downpayment transaction from the transaction tab.

### Worked examples

A loan product has the down-payment option enabled at 25% of the disbursement amount, and auto repayment for down payments is switched on. The figures are illustrative. A customer is disbursed 1,000 on 1 January. The down payment is 250 and is due and paid automatically on 1 January. The remaining principal is repaid in three equal monthly installments of 250 on 1 February, 1 March, and 1 April. There is no interest or fees. The down payment is collected automatically on the disbursement date and reduces the balance before the regular installments begin.

| Date | Event | Principal | DP Principal | EMI | Balance |
| --- | --- | --- | --- | --- | --- |
| 1 January | Disbursement | 1,000 | - | - | 1,000 |
| 1 January | Down payment (auto) | - | 250 | 250 | 750 |
| 1 February | Installment 1 | 250 | - | 250 | 500 |
| 1 March | Installment 2 | 250 | - | 250 | 250 |
| 1 April | Installment 3 | 250 | - | 250 | 0 |

A loan product offers a choice for the repayment start date: either the loan submitted date or the loan disbursed date, with the disbursed date as the default. A loan is submitted on 1 February and disbursed on 15 February, with three monthly installments and 30-day months. Choosing the disbursed date puts the first installment on 15 March; choosing the submitted date puts it on 1 March instead. Switching the basis to the submitted date moves every installment two weeks earlier.

| Start date basis | Installment 1 | Installment 2 | Installment 3 |
| --- | --- | --- | --- |
| Loan disbursed date (default) | 15 March | 15 April | 15 May |
| Loan submitted date | 1 March | 1 April | 1 May |

When several disbursements fall on the same day, the system creates one down-payment installment for each disbursement. A loan has two disbursements of 1,000 each on 1 January and a 25% down payment. Each disbursement adds a down-payment installment of 250 due on 1 January, so two down-payment installments appear on that date. The schedule then continues with regular installments. Each same-day disbursement generates its own down-payment installment rather than combining them into one.

| Date | Event | Principal | DP Principal | EMI | Balance |
| --- | --- | --- | --- | --- | --- |
| 1 January | Disbursement 1 | 1,000 | - | - | 1,000 |
| 1 January | Down payment 1 | - | 250 | 250 | 750 |
| 1 January | Disbursement 2 | 1,000 | - | - | 1,750 |
| 1 January | Down payment 2 | - | 250 | 250 | 1,500 |
| 1 February | Regular installment | 500 | - | 500 | 1,000 |

Charges and interest are never added to a down-payment installment; they are allocated to the next regular installment. A loan of 1,000 with a 25% down payment has a 50 fee posted on 1 January. The down payment of 250 is due and paid on 1 January. The first regular installment on 1 February therefore shows principal 250 plus the 50 fee, for an EMI of 300. A payment of 300 on 1 February clears that installment. The fee raises the first regular installment's EMI but never appears on the down-payment installment.

| Date | Event | Principal | Fees | EMI | Balance |
| --- | --- | --- | --- | --- | --- |
| 1 January | Disbursement | 1,000 | - | - | 1,000 |
| 1 January | Down payment | - | - | 250 | 750 |
| 1 February | Regular installment 1 | 250 | 50 | 300 | 500 |
| 1 March | Regular installment 2 | 250 | - | 250 | 250 |
| 1 April | Regular installment 3 | 250 | - | 250 | 0 |
