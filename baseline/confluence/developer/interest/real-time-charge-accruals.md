# Real-Time Charge Accruals

Real-time charge accruals recognize charges as income immediately when a charge transaction is posted, instead of waiting for the end-of-day job. This applies to Working Capital Loans and Progressive Loans.

Two configurations control when charge accrual entries are created.

| Configuration | Options | Default |
| --- | --- | --- |
| wcl-charge-accrual-time (Working Capital Loans) | Real-Time: creates the charge accrual entry when the applicable charge transaction is posted. EOD: creates the charge accrual entry through the end-of-day process based on the configured charge-accrual-date. | EOD |
| pl-charge-accrual-time (Progressive Loans) | Real-Time: creates the charge accrual entry when the applicable charge transaction is posted. EOD: creates the charge accrual entry through the end-of-day process based on the configured charge-accrual-date. | EOD |

When Real-Time is selected:

- An accrual transaction with the charge amount is created immediately when a new charge (fee or penalty) is added.
- Multiple charges create multiple accrual transactions.
- Working Capital Loans natively support multiple accrual transactions per day.
- The selected configuration is consistently applied to all applicable charge accrual transactions.
