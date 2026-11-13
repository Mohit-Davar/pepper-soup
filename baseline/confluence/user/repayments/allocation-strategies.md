# Payment Allocation Strategies

## Payment allocation strategies

A payment allocation strategy decides the order in which a payment is applied to amounts owed on a loan. It applies to credit adjustments, repayments, refunds, goodwill credits and waivers.

| Product and region | Payment allocation order |
| --- | --- |
| PayIn30 in DE region | DuePenalties, DueInterest, DuePrincipal, DueFees, InAdvancePenalties, InAdvanceInterest, InAdvancePrincipal, InAdvanceFees |

> **Note:** For pin30, the payment allocation order remains the same for all transaction types.

## Set the advance payment allocation order

Use this screen to arrange how early payments are applied across principal, interest, fees, and penalties.

1. Select **Admin** > **Products** > **Loan Products**.
2. Select **Create Loan Product (Classic)**, or open an existing product and select **Edit**.
3. Open the **PAYMENT ALLOCATION** step.

| Field | Required | Description |
| --- | --- | --- |
| Credit Allocation Strategy | No | Choose the credit allocation strategy that determines how payments are distributed. |
| Future Installment Allocation Rule | No | Set the rule for allocating payments to future installments. |

The system applies your chosen order to credit adjustments, repayments, refunds, goodwill credits, and waivers.

## Allocation order and categories

Allocation uses three timing categories and four charge categories, which combine into twelve allocation rule codes. The predefined allocation rules are DUE PRINCIPAL, DUE FEE, DUE PENALTY, IN ADVANCE PRINCIPAL, IN ADVANCE FEE, and IN ADVANCE PENALTY.

| Timing category | Charge category | Allocation rule code |
| --- | --- | --- |
| Past due | Penalty | PAST_DUE_PENALTY |
| Past due | Fee | PAST_DUE_FEE |
| Past due | Principal | PAST_DUE_PRINCIPAL |
| Past due | Interest | PAST_DUE_INTEREST |
| Due | Penalty | DUE_PENALTY |
| Due | Fee | DUE_FEE |
| Due | Principal | DUE_PRINCIPAL |
| Due | Interest | DUE_INTEREST |
| In advance | Penalty | IN_ADVANCE_PENALTY |
| In advance | Fee | IN_ADVANCE_FEE |
| In advance | Principal | IN_ADVANCE_PRINCIPAL |
| In advance | Interest | IN_ADVANCE_INTEREST |

The timing categories are:

- Past due means the amount is overdue.
- Due means the amount is payable now.
- In advance means the amount is payable in the future.

The charge categories are:

- Penalty applies to late payment.
- Fee is a charge for a service.
- Principal is the original loan amount.
- Interest is the cost of borrowing.

## Advance payment allocation

Advance payment allocation pays off a loan in a fixed order: outstanding penalties first, then accrued interest, then principal, then future installments. A partial payment splits across the components in that order, and each component closes as it is fully satisfied.

## Charge-back priority

You can set the payment allocation priority order for charge-back transactions in the advance payment allocation strategy at the loan product level.

Select the priority order for charge-back from:

- Penalties
- Fees
- Interest
- Principal

## Working Capital loan products

Payment allocation rules for Working Capital loan products only specify whether a payment pays the principal, fee, or penalty portion. They do not include Past due, due, or in advance rules.

## New repayment strategy behavior

For loans using the new payment strategy due-penalty-fee-interest-principal-in-advance-principal-penalty-fee-interest-strategy, paying only principal keeps the loan status ACTIVE and shows the extra in advance part on both the Transactions tab and the Repayment schedule tab. When all in advance components are taken into account, the In Advance column on the Repayment schedule tab shows principal plus penalty plus fee (1100EUR).

## Accrual posting

Accrual posting creates journal entries for charges based on either the charge created date or the due date, depending on how you configure it. With immediate accrual, multiple accruals can occur on the same day.

> **Note:** When an accrual transaction is recreated during reverse-replay on the submitted-on date instead of the due date, it uses the same value date as the original accrual to avoid accounting issues.

## Provisional credit

Provisional credit applies to the oldest due installments first and triggers a re-amortization across all remaining installments.

## Goodwill credit

Goodwill credit is applied to past due principal first, then to the last installment.

## Use case payment allocation rule configuration

| Use case | Payment allocation order |
| --- | --- |
| UC1 | 1 Fees, 2 Penalty, 3 Interest, 4 Principal |
| UC2 | 1 Fees, 2 Penalty, 3 Interest, 4 Principal |
| UC3 | 1 Fees, 2 Penalty, 3 Interest, 4 Principal |
| UC4 | 1 Fees, 2 Penalty, 3 Interest, 4 Principal |
| UC5 | 1 Fees, 2 Penalty, 3 Interest, 4 Principal |
| UC6 | 1 Fees, 2 Penalty, 3 Interest, 4 Principal |
