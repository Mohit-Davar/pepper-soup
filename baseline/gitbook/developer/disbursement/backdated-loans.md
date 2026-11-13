# Backdated Loans

## Backdated loan activities

You can backdate loan creation, approval, disbursement, and other monetary activities to a business date later than the loan creation date. Supported backdated activities include disbursement reversals, refund reversals, repayment reversals, fee-penalty-charge adjustment reversals, goodwill credit, interest accrual activity, interest refund-reversal, and interest payment waiver.

The following backdated activities are supported:

- Credit balance reversal is allowed until it is the latest transaction on the loan account.
- Adjust schedule is supported for payment holidays and snooze.
- Charge-off is supported.
- Interest rate modification is supported on the loan account.
- Disbursement, refund merchant issued, refund PayPal payout, refund reversal PayPal payout reversal, repayment, repayment reversal, fee addition, charge adjustment, charge adjustment reversal, credit balance refund, goodwill credit, goodwill credit reversal, chargeoff, interest waiver interest payment waiver, interest accrual activity, interest refund, and interest refund reversal are allowed as long as they are the latest transaction in the loan life cycle.
- Adjust schedule API supports backdated transactions.
- Charge-off the loan API supports backdated transactions.

## Repayment schedule and outstanding amount

Each installment shows totalOutstandingAmount, the projected total outstanding balance including principal, fees, and interest. The system calculates it on the fly from the total disbursed amount plus total fee plus total penalty plus total interest, deducting totalDue for each period to get the projected total outstanding after each period. When a repayment period due date is rescheduled, the EMI does not change; only the due date moves and interest is recalculated.

## Interest recalculation rules

Interest recalculation applies to loans with interest recalculation enabled. It recalculates remaining due interest based on the new outstanding loan balance after principal payments, and moves interest to the next period when so much principal was paid that projected interest cannot be recognised on the current period.

Rules for interest recalculation:

- Only payable interest can be paid (outstanding, accumulated interest till the current date).
- If the repayment amount is enough to fully pay the period (EMI minus payable interest), the principal due amount changes and the period closes.
- When a period closes due to early repayment, interest for the upcoming period is calculated from the current date plus one day, and that date belongs to the upcoming period.
- If EMICalculator sees, based on balance correction, that the payment is more than EMI minus payable interest minus projected interest, projected interest cannot be recognised on this period and moves to the next one.
- If excessive payment or pay-off happens multiple times, interest is pushed to the next installment and recalculated based on the newer outstanding loan balance until the very last one; if all principal is fully paid, interest naturally becomes 0.
- The next period calculates interest based on the new outstanding loan balance from 16 Jan to 1 March.
- When the customer pays so much in advance that one or more periods close without any payable interest, the same rules apply.

Payment allocation order:

- Past installment (due date before transaction date).
- Due installment (due date equals or is on transaction date).
- In advance installment (due date after transaction date).
- Current installment (transaction date between installment from date plus one day and installment due date).
- Past due installment oldest first.
- Then in advance installment based on configuration (next or last).

Limits:

- EMI cannot be changed unless it is the last unpaid period and must be amended due to early repayments.

## Interest calculation formulas

Interest calculation uses a rate factor and applies it to the principal balance to find installment interest. For weekly repayments, the rate factor accounts for the actual days in the period relative to the calculated days in the period. For rescheduled periods, the rate factor counts full months between the from date and due date and adds the partial period as actual days divided by actual days of the month.

The formulas are:

- Weekly rate factor = 1 + (rate of interest × (7 × repaid every ÷ days in year) × actual days in period ÷ calculated days in period)
- Installment interest = principal balance × (rate factor − 1)
- Rescheduled period rate factor = full months between from date and due date + (actual days of partial period ÷ actual days of the month of the partial period from date)
