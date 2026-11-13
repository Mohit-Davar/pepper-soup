# Projected Balances

## Projected amortization schedule

When a working capital loan is created, the system calculates and creates a projected amortization schedule for the whole loan life cycle. The schedule is recalculated based on the approved amount at approval and the disbursement amount at disbursement. The schedule is a current state schedule that updates based on payments made, missed, or overpaid.

The projected amortization schedule includes the following fields:

| Field |
| --- |
| Amortization Installment No |
| Amortization Installment Date |
| Expected Payment Amount |
| Discount Factor |
| NPV Value |
| Balance |
| Net Amortization Amount |
| Actual Payment Amount |
| Actual Amortization Amount |
| Income Modification |
| Deferred Balance |

The loan account view screen shows the Projected Amortization Schedule with the serial number of the installment, installment date, amortization installment date, expected payment as the calculated period payment amount value, and expected amortization amount as the calculated value.

## Schedule recalculation after payments

When an actual payment lands that differs from the expected payment, the system recalculates future expected payment periods using the actual payment as the baseline. Past rows are never recalculated; only payment periods after the date the payment landed are recalculated.

## Zero-filled days

At close of business (COB), the nightly job that posts interest and fees, zero-filled days appear on Working Capital (WC) loans for elapsed days. These rows do not create an actual transaction; they are cosmetic changes on the schedule. The expected payment schedule treats zero-filled rows as actual payments, recalculating expectations as if a zero-amount repayment transaction landed.

## Repayment on disbursement date

## Amortization calculations and stored values

The system calculates amortization values from Principal Amount, Total Payment Value, Discount Amount, NPV Day count, and Period Payment Rate. Annual EIR at the loan account level. Actual repayments calculate and post Actual Amortization(Income) on the payment date.

When Flat amortization is configured:

- Payable Discount fee equals Discount Fee minus Discount Fee adjustment.
- Initial Loan balance equals Disbursed amount plus Discount Fee minus Discount Fee adjustment.

> **Note:** If input field values become too low for calculated values, the system throws a valid error message referencing the issue, such as unable to calculate a valid EIR.

## Period Payment Rate modification

A Period Payment Rate modification can be undone by reversing the operation or by allowing multiple values on the same date.

## Working Capital transaction balances

Working Capital loan products use DUE and IN ADVANCE transaction allocation balances; PAST DUE does not apply.

Origination fees use one of these amortization methods:

- Straight line amortization.

## Amortization schedule API

Use GET /working-capital-loans/<loanId>/amortization-schedule to fetch the current amortization schedule as a JSON model with all relevant details.

The response includes:

- Expected payment and balances.
