# Collections Programs

## Collections Programs

You can initiate a recovery payment transaction on a loan account that is written off. The loan remains written off after the recovery payment, and recovery payments can be reversed.

Recovery payments follow these rules:

- Total recovery payment cannot exceed the amount of the written-off transaction.
- A recovery payment can be backdated but not before the write-off date.
- Written-off is a final state, so backdated monetary actions or undoing one should not really be allowed.

Recovery payment functionality works similar to term loan.

For working capital loans, payment type is optional, but you can provide a payment type ID and assign it to the monetary transaction.

A working capital loan account shows a new balance field: total recovery payment.

Delinquency and breach bucket configuration can be overridden during loan creation:

- Delinquency bucket configuration can be overridden during loan creation.
- Breach bucket configuration can be overridden during loan creation.
- The loan level override for delinquency bucket is honoured instead of always using the product level default.
- The loan level override for breach bucket is honoured instead of always using the product level default.
- Updating repayment percent reflects in delinquency and breach evaluation.

A working capital loan with a principal of 1,000, an annual interest rate of 12%, 3 monthly installments, and 30-day months is written off. The write-off records 1,000 as the written-off amount and leaves the account balance at 0. The borrower later pays 400 toward the written-off debt, and the officer records a recovery payment on the written-off account. The figures in this example are illustrative.

A recovery payment reduces the amount still recoverable but does not change the balance or reopen the written-off account.

| Step | Transaction | Amount | Balance | Status |
| --- | --- | --- | --- | --- |
| Write-off | Write-off | 1,000.00 | 0.00 | Written-off |
| Recovery payment | Recovery payment | 400.00 | 0.00 | Written-off |
| Total recovered | — | 400.00 | — | — |
| Remaining recoverable | — | 600.00 | — | — |
