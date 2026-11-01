<!-- Labels: user, phase-2 -->
# EIR Calculation Phase 2 - Restrictions (lDelinquency)

The EIR Calculation – Restrictions (lDelinquency) feature governs how delinquency is detected, classified, and managed within Working Capital loans under the scope of the EIR-based calculation framework. It implements the delinquency lifecycle, including bucket classification, aging, re-aging, pause mechanics, and related adjustments to amortization and income recognition. The design purpose is to support PayPal-like working capital financing by providing clear, auditable rules for delinquency, penalties, waivers, and overpayments, while avoiding accruals on the disbursed loan account and maintaining accurate projection and accounting through the EIR-based model.

Who benefits from these restrictions
- Operations staff and loan officers benefit from consistent, rule-driven handling of delinquency, verifying predictable behavior across cases.
- Branch managers and credit agents gain visibility into bucket classifications, pause windows, near-breach and breach evaluations, and the effects of adjustments on amortization schedules.
- The context follows the Working Capital product requirements, where the loan is zero-interest, accruals are not recorded, and repayments (including reversals) drive the amortization and income observation.

The rules and behaviors described below are extracted from the reference coverage and are treated as the verified product behavior for this feature.

### Delinquency buckets and classification
Delinquency is categorized into a sequence of buckets based on days past due. The standard progression covers the following buckets:
- D00 (0–30 days past due)
- D30 (31–60 days past due)
- D60 (61–90 days past due)
- D90 (91–120 days past due)
- D120 (121–150 days past due)
- D150 (151–180 days past due)
- D180 (181–210 days past due)

Each bucket represents a delinquency state that informs how the loan is treated going forward, including eligibility for certain remedies, the application of charges, and the updating of the amortization projection. The buckets are defined for range scheduling and for determining when to trigger associated delinquency actions or policy rules.

Notes on classification
- Delinquency bucket classification is configurable in the product, and the system uses the defined ranges to move a loan from one bucket to the next as delinquency days accrue.
- Near breach and breach evaluations are part of the phase and influence when stricter controls or adjustments should apply.

### Re-aging and re-amortization
Re-aging and re-amortization are supported in the delinquency lifecycle with the following constraints and expectations:
- Re-aging is supported with an expectation that the period payment amount is not changed by the re-age process. Re-aging evaluates the loan lifecycle and enforces minimal payment expectations without altering the period payment amount.
- Re-amortization is not applicable in the current implementation for this product. The lifecycle relies on the EIR-based amortization logic driven by actual repayments and scheduled expectations rather than a separate re-amortization step.

These rules verify that delinquency handling remains consistent with the term of the loan while preserving the integrity of the income recognition model and the projected amortization schedule.

### Delinquency pause and related features
The delinquency framework supports a Delinquency Pause mechanism, which can suspend certain delinquency-driven actions for a configured period. This pause interacts with the period-based range schedule and the ongoing evaluation of buckets, so that temporary exceptions or regional policies can be respected without compromising the overall data integrity.

In addition, the system supports a Delinquency bucket classification rule set that determines when a loan transitions between buckets and how those transitions affect the workflow, including the potential initiation of charge handling and income recognition adjustments.

### Charges, penalties, and income waivers during delinquency
- Charges and penalties can be assessed and allocated according to configured rules. In Germany, for example, NSF charges are a regional consideration, and the allocation order generally places charges before principal in the repayment allocation.
- Fee waivers are supported for delinquency-related scenarios as part of the overall policy flexibility. The context notes that fee waivers initiated by PayPal are allowed.
- Near breach and breach evaluation mechanisms can trigger different treatments or reminders, depending on the configured thresholds and timing.

### Overpayments and Credit Balance Refund (CBR)
Overpayments and Credit Balance Refunds are integral parts of the delinquency framework:
- If a borrower pays more than the total amount due, the excess is recorded as an overpayment (credit balance) on the loan account.
- A Credit Balance Refund (CBR) transaction can be processed to return the excess funds to the borrower, subject to validations and the loan’s status. The CBR reduces the credit balance and updates loan balances; it may trigger associated accounting entries if configured.
- The system tracks the overpayment amount and the loan status transitions . If the overpayment remains after a CBR, the loan can remain in an OVERPAID state; if the overpayment is fully applied and obligations are met, the status may advance toward a closure path per policy.
- The delinquency model supports CBR processing on backdated transactions, with validations around business date rules and the smallest repayment transaction date on the loan.

Note: The framework explicitly supports both overpayments and CBR as part of the delinquency handling and revenue recognition processes.

### Discount fees, amortization, and adjustments during delinquency
The restrictions describe a nuanced approach to discount fees and their amortization:
- Discount fees are recognized as deferred income and amortized over the loan tenure using the EIR-based methodology. Amortization is driven by repayments and is observed via a non-monetary Discount Fees Amortization transaction that records the ongoing movement of deferred income without altering loan balances.
- Discount adjustments are allowed under specific conditions and have a detailed, multi-step process. An adjustment creates a linked adjustment transaction and updates loan discount balances, restates the projected amortization, and replays applicable repayments and associated accounting entries. A business event is raised to notify the system of the adjustment.
- Discount fee amortization can be recalculated in response to backdated events or adjustments, with reprocessing of amortization, outstanding balances, and subsequent transactions as needed.
- The system enforces that discount amortization adjustments are system-generated and cannot be created or edited manually. Future amortization values reflect updated discount totals and revised projections.

The above rules verify that the amortization of deferred income follows actual cash flows while preserving accounting integrity and traceability across transactions.

### Projection and calculation observables
A key concept in is the projected amortization schedule for Working Capital loans. The schedule is automatically generated at loan creation and updated at approval and disbursement stages, with continuous recalculation as actual repayments occur. The projection includes:
- Amortization Installment Number
- Amortization Installment Date
- Expected Payment Amount
- Discount Factor
- NPV Value
- Balance
- Net Amortization Amount
- Actual Payment Amount
- Actual Amortization Amount
- Income Modification
- Deferred Balance

This structure supports transparent income recognition planning and allows reconciliation across cash flows, deferrals, and amortization trajectories. The schedule is updated to reflect changes in repayments, timing, and remaining balances, verifying alignment with the EIR-based calculation model.

### Acceptance criteria that define the phase's behavior
The following conditions are verified in this phase:
- No interest is charged on the disbursed loan account.
- No accrual or accrual-type transactions are required for these loan accounts.
- No Multi-Disbursement (tranches) scenarios are supported for a loan account in this phase.
- No traditional installments with fixed allocations ( EMI-like structures) are used in these loans.
- No transactions or disbursements occur after the loan is paid in full (closed).
- Trailing activity such as repayment reversals or charge backs can exist.
- N+1 type of special scenarios could exist.
- No partial fees adjustments are permitted in standard flows; full fee adjustments are supported as described in the discount-adjustment logic.
- Actual repayments will calculate and post the Actual Amortization (Income) on the payment date.
- Key calculated and stored values reside at the loan account level, including Period Payment Amount, Total Days, Daily EIR, and Calc. Annual EIR.
- The following calculated values based on repayments are stored at the loan level: Payment amount, Actual Amortization (Income), and Income Modification.

### Operational navigation and user steps (UI interaction)
If you need to navigate to and configure EIR restrictions for lDelinquency, use the following steps:
1. Open the Working Capital module and navigate to the area.
2. Open the screen labeled “EIR Calculation - Restrictions (lDelinquency)” from the navigation path: **Working Capital (PPWC / EIR) > > EIR Calculation - Restrictions (lDelinquency)**.
3. Review and adjust Delinquency Bucket Classifications as defined in the policy. The system uses these buckets to classify delinquency days and apply associated rules.
4. If enabled by policy, allows and configure Re-aging behavior, noting that the Period Payment Amount is not changed by Re-age.
5. Verify that Re-amortization is not applicable to this phase (as per phase design) and proceed with the EIR-based schedule behavior instead.
6. Review Delinquency Pause settings and allows them where standard to support regional or product-specific pauses.
7. Review charges/penalties handling during delinquency, including NSF charges if applicable, and verify allocation order is set to charge-related components before principal.
8. Review exchange of Waivers: allows fee waivers as per policy guidance.
9. Review Overpayments and Credit Balance Refund (CBR) settings, including how overpayments are tracked and when CBR is allowed; verify validations for CBR are satisfied.
10. Review Discount Fees rules, including how discount adjustments are permitted, the linked adjustment workflow, and the scheduling of Discount Fees Amortization transactions.
11. Save the configuration and perform a dry run or test scenario to verify that delinquencies progress through buckets, pauses, and refunds as expected.

After each step, the system will reflect visible outcomes such as updated bucket states, scheduled amortization adjustments, and any triggered accounting entries or system events associated with the configuration. The workflow follows the documented references and reflects the product’s verified behavior for EIR delinquency restrictions.

### Calculation and scheduling references (conceptual guidance)
- The system stores the following loan-level values for the EIR-based model: Period Payment Amount, Total Days, Daily EIR, Calc. Annual EIR. These values are used to project and update the amortization schedule as repayments occur and as delinquency movements take place.
- The projected amortization schedule includes fields such as Amortization Installment Number, Amortization Installment Date, Expected Payment Amount, Discount Factor, NPV Value, Balance, Net Amortization Amount, Actual Payment Amount, Actual Amortization Amount, Income Modification, and Deferred Balance.
- The balance and amortization projection are continuously recalculated in response to repayments, timing changes, and updates to the delinquency state. The system verifies that historical amortization entries remain intact while future entries are recalculated to reflect new cash flow expectations.

### Representative scenarios referenced by the phase
- Delinquency Example: The reference material includes explicit input parameters such as grace days, delinquency bucket transitions (D00, D30, D60, D90, D120, D150, D180), and bucket histories with per-period tracking of delinquency days and amounts. These scenarios illustrate bucket progression and historical tracking and are used to validate bucket classification behavior over time.
- Range Schedule Examples: The documentation provides calculation and scheduling patterns for scenarios with varying period definitions, including daily payment rates, delinquency period definitions, and NPV calculations tied to the EIR-based amortization. These patterns demonstrate how the system would project and adjust the schedule under different configurations and repayment behaviors.
- Forecast Projection and Amortization: The concept of a projected amortization schedule, its input parameters, and the relationship to NPV and balance tracking are described to support understanding of how delinquency interacts with projected income recognition and deferment of income over time.

This page presents the verified rules and behavior for EIR Calculation – Restrictions (lDelinquency) and describes how the operational workflow, calculation model, and accounting implications come together to support a disciplined, auditable delinquency process within the Working Capital product.