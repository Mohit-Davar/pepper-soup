# Pay in 30 Days

Pay in 30 Days lets you disburse a loan in multiple amounts without tranches. The loan page in the web app supports disbursal of non-tranche multiple disbursals through the new loan wizard.

A disbursement must not be dated before the last disbursement date.

- A disbursement posted before the last disbursement date throws LoanDisbursalException with error code actualdisbursementdate.before.lastdusbursedate.
