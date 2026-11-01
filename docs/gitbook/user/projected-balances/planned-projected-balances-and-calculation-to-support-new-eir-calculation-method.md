# Planned / Projected balances and calculation to support new EIR calculation method

This page documents the behavior and procedures for planned and projected balances under the new PPWC (Working Capital) EIR calculation method. The enhancement introduces a daily effective interest rate (EIR) framework that supports discount and up-front fixed fee structures used by the new working capital product. It explains what changes, why they matter to day-to-day operations, and how to operate the projections and calculations that feed planning, funding decisions, and accounting for PPWC accounts.

### Change overview and why it matters
The new EIR calculation method changes how projected balances are computed and displayed for PPWC loans. Instead of relying on traditional interest accrual and scheduled amortization, the system uses a daily EIR construct to discount future payments and recognize up-front discount/fees. This affects the way balances are projected, how actual amortization and income are recognized, and how repayments, reversals, and adjustments flow through the general ledger during the loan lifecycle.

Operationally, this means that the Planned / Projected balances page must reflect: the daily EIR input, the associated discount factors for each future period, and the resulting net present value (NPV) of scheduled payments. It also means the projection must honor the product-specific rules for working capital accounts (such as the absence of traditional EMI installments and the upfront recognition of origination-related discounts or fees). See the sections below for rules, workflow, and reference figures drawn from the definitive reference data.

### Scope and applicability
- Applies to the Working Capital (PPWC) product family under the PPWC / EIR calculation workflow. 
- Addresses planned and projected balances used for daily operation planning, liquidity forecasting, and accounting reconciliations tied to the new EIR calculation method.
- Covers the user-visible calculations, the projected balances schedule, and the accounting implications of the upfront discount/fees and subsequent amortization under the EIR regime.

### Key concepts and data in the planned/projection calculations
- Daily EIR: The rate used to discount future payments on a per-day basis. The reference data includes daily EIR values such as 0.1068% in one extended example and related annualized equivalents.
- NPVs and discount factors: For each future period, a discount factor is recorded, and the NPV of the associated payment is calculated as the discounted cash flow amount. The reference examples show a per-period discount factor and an NPV value that feed into the projected balance.
- Balance progression: The opening balance of each period corresponds to the closing balance of the previous period. The projection engine maintains this link to verify integrity of the schedule.
- Up-front discounts/fees: Origination or up-front fixed-fee charges are recognized in the accounting stream in advance of or at disbursement, with subsequent adjustments and amortization reflected through the EIR framework.
- Periodic outputs: The projection provides, per amortization date, the expected payment amount, actual payments (when posted), discount factors, NPV values, the outstanding balance, and the net amortization (the portion of payments recognized as income under the EIR method).

### Acceptance criteria and product rules (operational constraints)
The PPWC EIR implementation adheres to the following operational constraints observed in the reference data:
- No interest percentage is charged on the disbursed PPWC loan account. The product recognizes up-front discount/fees as the relevant earnings or reductions on the balance, not as ongoing interest accrual in the traditional sense.
- There are no accrual-type transactions typical of traditional interest accrual for these PPWC loan accounts.
- No multi-disbursement (tranches) scenarios are modeled for a PPWC loan account under the EIR calculation method.
- There are no traditional fixed EMI-style installments defined as Prin, Int, and Fees on PPWC accounts without adjustment; however, the product supports up-front charges and fees that are allocated according to EIR rules.
- No transactions are allowed after the loan account is paid in full (closed), though the data model allows trailing activity such as repayment reversals or chargebacks.
- Re-aging and re-amortization concepts exist, with re-aging being precalculated and evaluated during delinquency handling; re-amortization as a separate mechanism is not applicable for these PPWC accounts in the current design.
- The system supports payment holidays and delinquency handling, including delinquency bucket classification and related income recognition rules.
- There are allowances for fee waivers initiated by the payer () and for various types of charges/penalties to be allocated first before principal reductions.
- Overpayments and CBR (credit balance reversal) scenarios exist and may trigger adjustments in the planning and projection modules.
- The model stores and posts several computed values at the loan account level, including Periodic Payment Amount, Total Days, Daily EIR, Calc. Annual EIR, and, based on repayments, Payment Amount, Actual Amortization (Income), Income Modification, and Deferred Balance.

Notes:
- Some items in the working data are subject to ongoing alignment with Accounting and PPWC product leads. Where a capability is described in the reference data as “Waiting from PP” or “To be provided,” it is treated as a verified gap item that remains present tense until implementation confirms it.
- The lists above reflect the verified behaviors in the reference data and are not future proposals; where behavior is not yet implemented, it is described as a gap item in present tense.

### Data model and terms used on the Planned / Projected balances page
- Daily EIR: The per-day interest rate used to discount future cash flows.
- Discount factor: The factor applied to a future payment to compute its present value under the daily EIR.
- NPV (Net Present Value): The present value of a future payment, calculated using the discount factor for that date.
- Balance: The projected opening or ending balance for a given period, aligned so that each period’s opening balance equals the prior period’s closing balance.
- Amortization (Income): The income recognized from the amortization of the discount/fees under the EIR method, posted on the payment date and reflected in the cash flow schedule.
- Deferred balance: The balance associated with unamortized or deferred income/discounts that remains in a liability or asset account pending recognition under the EIR method.

### Reference data at a glance (calculation context)
The reference data includes explicit calculation references that illustrate how the EIR-based projection is populated and how the related accounting entries map to the PPWC product. A representative, simplified snapshot from the reference data demonstrates the essential relationships:
- Calculation Reference (example values): Period payment rate (repayment %) = 18%; Total Payment Volume (TPV) = 100000; Net disbursement = 9000; Discount (origination fees) = 0; NPV Day count = 360; Disbursement date = 1/1/2019.
- Amortization period sample (1/2/2019 onward): Period 1 shows an expected payment amount of 50; Discount factor ≈ 0.998933325; NPV value ≈ 49.94666623; Balance ≈ 8959.61. This illustrates how a future payment is discounted, its present value calculated, and the balance updated.
- Forecast projection example (illustrative): Daily payment rate (repayment %) = 18%; Net disbursement and discount adjustments yield a Calc Annual EIR of 46.8451% in one extended example, with a Daily EIR around 0.1068% for the configuration shown. These figures appear in the reference material as examples for planning and stress testing under the EIR framework.

Note: The exact values shown here reflect the reference data sections labeled Calculation Reference and Forecast projection. They are provided to illustrate expected behavior and are not intended as baseline figures for all loans; actual values vary by loan, terms, and the EIR calculation run.

### How to read and use the Planned / Projected balances page (operational workflow)
1) Access the page through the navigation path: Working Capital (PPWC / EIR) > Projected balances > Planned / Projected balances and calculation to support new EIR calculation method.
- The page presents per-loan or per-portfolio projections, including per-period amortization entries and the associated NPVs and balances.

2) Review the input parameters and computed fields:
- Periodic inputs and tenor: Confirm the period definitions and the total number of days used in the projection (Total Days).
- Daily EIR: Inspect the per-period daily EIR value applied to discount future cash flows.
- Discount factor and NPV: For each future period, review the Discount factor and the NPV value to understand how much of each payment is recognized as income under the EIR framework.
- Balance progression: Validate that the opening balance for the period equals the previous period’s closing balance, verifying continuity in the schedule.

3) Validate accounting implications and outcomes:
- Up-front discount/fees recognition: Confirm that upfront charges affect Loans Receivable Principal and Deferred Interest according to the mapping described in the reference data (summary below), and that subsequent adjustments reflect the ongoing EIR amortization.
- Amortization and income: Verify that Actual Amortization (Income) and Income Modification reflect repayments posted on the payment date, and that Deferred Balance is updated .
- Delinquency and stop conditions: Confirm that delinquency handling and related adjustments are consistent with the product rules (delinquency buckets, holidays, and related adjustments).

4) Compare planned vs. actual outcomes:
- Where available, compare the projected balances against actual amortization results to detect deviations in income recognition and to adjust the EIR calculation as needed.

5) Use the reference calculations for audit-ready traceability:
- The calculation references provide the authoritative mapping between cash flows, discounting, and accounting entries for the EIR method. When reviewing, align the figures with the reference data to verify consistent interpretation and reporting.

### Representative accounting implications (high level, non-implementation specifics)
The reference data describes how up-front discounts contribute to the principal and to a deferred income/liability account and how subsequent repayments and adjustments unwind through the ledger. In practice, the pattern observed in the reference is:
- Up-front discount/fee charges are recognized by increasing Loans Receivable Principal and increasing Deferred Interest (liability), with a associated accounting entry to the funding/portfolio risk accounts.
- A discount adjustment may reverse or reallocate portions of the original recognition, moving amounts between Loans Receivable Principal and Deferred Interest as the EIR amortizes the discount into income over time.
- Repayments are allocated to the PPGL (Loans Receivable Principal) against the scheduled principal and may trigger reversals or reclassifications of related fee and penalty receivables and associated liabilities.
- In case of write-offs or charge-offs, the reference data provides the associated entries to recognize credit losses and to reverse any related fee or penalty receivables, maintaining the integrity of the PPWC accounting stream.

Because these mappings are part of the reference data, they should be consulted when modeling the precise journal entries for each scenario. The general pattern, without exposing sensitive internal identifiers, follows the evolution of the loan balance through principal reduction, the recognition of deferred income, and the periodic amortization of the upfront discount into income on each payment date.

### Example: simplified calculation view (from the reference data)
To illustrate the concepts, here is a compact, representative excerpt drawn from the reference materials. This excerpt documents a simple PPWC projection with a single up-front input and iterative amortization:
- Inputs: Period payment rate (repayment %) 18%; Total Payment Volume (TPV) 100000; Net disbursement 9000; Discount 0; NPV Day count 360; Disbursement date 1/1/2019.
- Amortization row (1/2/2019): Period 1; Expected Payment amount 50; Discount factor 0.998933325; NPV value 49.94666623; Balance 8,959.61.

This example demonstrates the core interaction among discount factors, NPV, and the evolving balance on the projection schedule. It also demonstrates how the daily EIR input translates into a per-period discount factor and a per-period NPV, which feed into the overall projected balance and the recognition of income over time.

### Diagram: high-level PPWC EIR projection workflow
```
flowchart TD
 A[Disbursement] --> B{Up-front discount/fees recognized}
 B --> C[Stabilize principal and deferred income balances]
 C --> D[Daily EIR-based discounting for future payments]
 D --> E[Per-period NPV and balance updates]
 E --> F[Actual amortization and income recognition on payment dates]
 F --> G{Delinquency handling and adjustments}
 G --> H[Final settlement or write-off if applicable]
```

### Migration and operational considerations
- Migration of existing PPWC loan data into the EIR-based projection framework should preserve the constraint that opening balance for a period equals the prior period’s closing balance, and that the projection uses the daily EIR for discounting future payments.
- Operational workflows should reflect the new workflow on the Planned / Projected balances page and should align the inputs (Daily EIR, NPV Day count, Discount) with the reference calculations to verify predictable reporting and accounting.
- Known gaps: Some “Waiting from PP” and “To be provided” items in the reference data indicate areas where additional alignment with Accounting or product governance is still in flight. Until those gaps are resolved, the behavior described in this page remains the baseline for day-to-day operations and reporting.

### Glossary (terms used on this page)
- PPWC: Working Capital for which the new EIR calculation method applies.
- EIR: Effective Interest Rate used to discount future cash flows and to amortize upfront discounts/fees into income.
- Net Present Value (NPV): Present value of a future cash flow, calculated using the daily EIR discounting.
- Discount factor: The factor applied to a future payment to convert it to its present value under the daily EIR framework.
- Deferred Interest / Deferred Income: The liability or asset account representing unamortized upfront discount/fees.
- Actual Amortization (Income): The amount recognized as income on an actual payment date as part of the EIR amortization.
- Deferred Balance: The balance associated to unamortized income or discount recognized under the EIR method.

### Summary of verified operational behavior
- The Planned / Projected balances page reflects the new EIR-based calculation method and shows the per-period discount factors and NPVs required for planning and reporting.
- The system maintains a disciplined balance progression where each period’s opening balance equals the previous period’s closing balance.
- The page supports the operational constraints described in the Acceptance Criteria (no traditional interest accrual, no multi-disbursements, no post-closure transactions, support for trailing activity, delinquencies, waivers, CBRs, etc.).
- Up-front discounts/fees are reflected in the accounting stream and amortized over time consistent with the EIR method, with subsequent adjustments captured by the discount/revenue accounting entries described in the reference data.

If you require deeper mapping of the exact ledger-level entries to journal codes for a given scenario, the accounting reference sections describe the principal locations (Loans Receivable Principal, Deferred Interest, Fees Receivable, Penalty Receivable, Overpayment Liabilities, and related income accounts) and the typical flow through the system. For day-to-day operations, the emphasis remains on the per-period discount factors, NPVs, and the projected balance trajectory that informs liquidity planning and risk monitoring under the new EIR calculation framework.