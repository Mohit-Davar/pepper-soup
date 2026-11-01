# Buy-Down Fee & Capitalized Income Subtypes

This enhancement introduces optional classifications for Buy-Down fees and Capitalized Income transactions. The feature allows users to configure and select subtypes at the product level and to apply the chosen classifications when creating transactions. The result is a more expressive and controllable alignment between origination-related fees, capitalized income, and the associated accounting mappings, while preserving the existing financing and amortization semantics.

### Conceptual scope and how it matters

- Buy-Down Fee sub-types (and related capitalized income sub-types) provide a way to classify fees and income components that are embedded in a loan at disbursement. When a transaction is created with an optional classification, the system can apply a predefined accounting mapping and schedule behavior so that the lifecycle of the fee and the income is consistent with the loan’s amortization and deferred accounting.
- The feature is implemented with product-level configurability for origination-related fees, and with per-transaction optional sub-type classifications that influence how the transaction participates in the amortization and the GL mappings.
- The underlying accounting model continues to rely on the established constructs: Loan Receivable, Defered Income (liability), Income from Amortization, and related interest/income accounts. The new sub-types drive how origination-related amounts are recognized and amortized over the life of the loan.

The following sections describe the verified behavioral changes, the data/configuration that allows them, and representative calculations that illustrate the impact on schedules and accounting.

### Data model and product configuration changes (verified behavior)

- Origination fees are introduced as a new fee type at the product level. The fee type is flat (a fixed amount entered by the user) and can be mapped to a loan product at the product level.
- Origination fees are added to the loan account at disbursement and on the disbursement date only. The total amount disbursed to the borrower equals disbursement amount plus origination fees.
- A new transaction type for origination fees is added alongside the disbursement transaction. This transaction participates in the same disbursement event but carries the origination-fee classification.
- Origination fees are treated as part of the principal for amortization purposes: the amortization/schedule calculations use (disbursement amount + origination fees) as the base for repayment timing and interest accrual.
- Validation logic changes: the disbursement amount validation is updated to compare (disbursement amount + origination fees) against the approved amount, verifying the disbursed value does not exceed the approved limit.
- Amortization for origination fees is performed on a daily basis at COB (close of business). The balance of origination fees is tracked in a current balance and evolves as amortization progresses.
- When a loan charges off, origination fees are included in the charge-off process. No additional amortization occurs after the charge-off date.
- Final amortization (if applicable) is performed for any remaining balance if the loan is prepaid on the same day.
- A new parameter for mapping deferred income is introduced (Defered Income mapping). This parameter links the capitalized portion of fees to a Defered Income liability account and to Income from Amortization as amortization progresses.

The above behavior is reflected in the reference material for capitalized income processing, including the explicit accounting mappings and amortization concepts described in the accompanying reference examples.

### Calculation and scheduling background (verified concepts)

- Starting position for a loan with capitalized income uses an effective principal equal to the disbursement amount plus the capitalized amount (origination fee). The calculation of interest and the amortization schedule then proceeds on that effective principal.
- Amortization events move amounts from the Defered Income liability toward recognized income (and related interest income ) as the loan amortizes. The accounting entries involve the Defered Income mapping to the loan receivable and to income accounts as amortization progresses.
- Charge-off scenarios incorporate the capitalized income amounts into the charge-off path, and adjustments may occur per the defined accounting mappings.

As an illustrative reference, the material includes a simple loan scenario that demonstrates the implications of adding origination fees to the disbursement base and amortizing the resulting balance over a one-month repayment period.

### Example calculation and schedule (UC-1 style)

Inputs (from the reference calculation context):
- Interest rate: 7% per year (0.000194444 daily rate with 360 days per year)
- Days in year: 360; Days in month: 30
- Disbursement: 100
- Origination fees (capitalized income): 50
- Total amount to amortize: 150
- Repayment period: 1 month

Calculation and results (the reference schedule shows the following verified values):
- On the first repayment date (2/1/24): EMI is 50.58, with principal component 49.70 and interest 0.88. The opening balance for that period is 100.30.
- On the second repayment date (3/1/24): EMI is 50.58, with principal 49.99 and interest 0.59. The balance that period becomes 50.31.
- On the final repayment date (4/1/24): EMI is 50.60, with principal 50.31 and interest 0.29. The loan is fully repaid, leaving a zero balance.

Representative schedule excerpt (dates and amounts shown are taken from the reference data):
- 2/1/24 | Balance: 100.30 | EMI: 50.58 | Principal: 49.70 | Interest: 0.88
- 3/1/24 | Balance: 50.31 | EMI: 50.58 | Principal: 49.99 | Interest: 0.59
- 4/1/24 | Balance: 0.00 | EMI: 50.60 | Principal: 50.31 | Interest: 0.29

These figures illustrate how the effective principal (disbursement plus origination fees) drives the amortization and the monthly payment, with the origination-fee portion treated as capitalized income on disbursement and subsequently amortized over the loan life according to the established pattern.

### Accounting implications at a glance (summary mapping)

- Disbursement event:
 - DR Loan Receivable (Loan Portfolio / Loan Receivable) for the cash advanced to the borrower (disbursement amount).
 - CR Fund Source / Suspense Clearing account for the funded amount.
 - Capitalized Income entry (origination fees): DR Loan Receivable for the origination-fee amount; CR Defered Income (liability) for the same amount.
- Amortization events (daily COB-based):
 - A portion of the Defered Income liability is recognized as Income from Amortization (and related Interest Income ), reducing the Defered Income balance and increasing recognized income, while the loan balance reduces as scheduled principal is repaid.
- Charge-off path:
 - Origination fees participate in the charge-off process; the accounting entries reflect the charge-off of the related loan receivable and reallocate income as standard per the charge-off mappings.
- Final payoff and early payoff:
 - If prepaid on the same day, final amortization is performed for the remaining balance and the loan is closed , with the origination-fee component fully or partially recognized per the schedule.

These accounting patterns are reflected in the reference data under the Capitalized Income, Defered Income, and Amortization sections, including the explicit mappings such as "Capitalized Income -> Loan Receivable" and "Defered Income -> Income from Amortization" against the amortization schedule.

### Architecture view and component responsibilities (high level)

- Domain model and persistence
 - Extend the transaction model to carry an optional sub-type or classification for Buy-Down Fee and Capitalized Income, wired to product-level configuration for origination fees.
 - Introduce product-level configuration for origination fees (flat amount) and a mapping to loan products; verify the total disbursement amount includes the origination fee on the disbursement date.
 - Add a Defered Income mapping parameter that connects the capitalized income portion to the Defered Income liability and to Income from Amortization as amortization proceeds.
- Processing and scheduling
 - Extend the amortization engine to handle daily amortization of the origination-fee portion (capitalized income) at COB, using the combined base (disbursement + origination fees) for interest accrual and principal progression.
 - verify charge-off and early/prepayment paths correctly reflect origination-fee balances in the final accounting and settlement.
- Accounting and GL handling
 - Implement the Defered Income mapping to drive the transition of amounts from Defered Income (liability) to recognized income (Income from Amortization) and to Interest Income as standard.
 - Align the new sub-types with existing loan accounting flows so that reporting, GL balances, and reconcilement semantics remain consistent.
- Validation and integration
 - Enforce validation that (disbursement amount + origination fees) <= approved amount, as described in the reference validation guidance.
 - verify integration points for transaction creation allow an optional sub-type value and map to the associated product-level configuration.

### Quick reference: key terms and their roles

- Origination fees: a flat amount defined at the product level, added to the loan at disbursement, and treated as capitalized income with a Defered Income liability until amortization.
- Defered Income mapping: a parameter that links the capitalized fee portion to a liability account and to subsequent income recognition as amortization occurs.
- Capitalized Income: a transaction type/label used at disbursement to record the capitalized portion of the origination fee in the loan receivable and to create the Defered Income liability.
- Income from Amortization: an accounting outcome that results from amortizing Defered Income over the loan life, representing the earned portion of the origination fee.
- Buy-Down Fee sub-type: the optional classification pathway that allows categorization of Buy-Down-related fees within the transaction flow.
- Capitalized Income sub-type: the optional classification pathway that allows categorization of capitalized income transactions within the transaction flow.

### Diagram: processing flow (Mermaid)

```
flowchart TD
 A[Create Transaction] --> B{Has Sub-Type Classification?}
 B -- Yes --> C[Apply Buy-Down Fee / Capitalized Income sub-type]
 B -- No --> D[Proceed with base flow]
 C --> E[Disbursement Transaction with Origination Fees]
 D --> E
 E --> F[Create Loan Receivable (disbursement base + origination fees)]
 E --> G[Record Defered Income liability for origination fees]
 F --> H[Daily COB Amortization of Capitalized Income]
 G --> H
 H --> I[Recognize Income from Amortization and Interest Income ]
 I --> J[Update GL balances and loan schedule] 
 J --> K{Charge-off or Payoff?}
 K -- Charge-off --> L[Apply charge-off entries including origination-fee component]
 K -- Payoff --> M[Finalize amortization and close loan]
```

### Additional notes for implementers

- This page documents verified product behavior and the data-flow implications of introducing sub-types for Buy-Down Fee and Capitalized Income. It does not prescribe UI elements or REST API payload shapes beyond what is evidenced in the reference materials. If you are extending the integration surface, align new parameters with the existing transaction creation paths and verify the optional sub-type is properly persisted and surfaced where transaction classifications are presented.
- The illustrative UC-1 copy in the reference materials demonstrates how an origination-fee amount affects the amortization base and the resulting schedule. When implementing, reproduce the pattern of using (disbursement amount + origination fees) as the basis for the amortization calculation and for the posting of the disbursement and origination-fee components into the capitalized/income flow.

This page captures the verified product behavior for Buy-Down Fee & Capitalized Income Subtypes and provides a consolidated view of how the new classifications interact with disbursement, amortization, and accounting mappings.