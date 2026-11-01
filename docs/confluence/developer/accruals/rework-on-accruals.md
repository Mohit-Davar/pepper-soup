<!-- Labels: developer, accruals -->
# Rework on Accruals

This page documents the verified behavioral changes introduced by the accruals rework, with a focus on posted interest handling, daily accrual processing, and the related schedule integrity guarantees. The reference material describes a model where accruals are posted as discrete events, including daily accrual entries, repayments, and adjustments such as reversals and replays. The content below presents what the enhancement does, how the flows operate, and the implications for repayment schedules and accounting, all anchored to the verified reference data.

### Overview and scope

The enhancement centers on providing a clearly identifiable mechanism to represent posted interest within the loan lifecycle. It introduces a flow in which daily interest accrues, is posted as accrual events, and then contributes to the repayment schedule. The model supports the following operational patterns, each demonstrated in the reference calculations and schedules:

- Daily accrual events that accumulate interest over time and influence the repayment schedule.
- Distinct accrual posting events that capture the amount of interest to be paid (posted) and its interaction with the installment structure.
- Repayments that reduce both principal and accrued interest, with the possibility of early payments or backdated repayments.
- Reversals of accrual postings and subsequent replays to restore consistent accounting and a correct repayment path.
- Backdated repayments that require accrual adjustments and schedule recalculations to reflect the revised cash flow.
- Schedule recalculation after accrual events, reversals, or repayments to preserve the invariant that each period’s opening balance equals the prior period’s closing balance.
- A 360-day year convention for daily interest calculations and a daily accrual cadence across disbursement scenarios.

The reference material explicitly presents multiple scenarios (including reverse replay on early payment, backdated repayments with accrual adjustments, and schedule recalculation after reversals) that illustrate how the system behaves under these conditions. It also provides calculation references that demonstrate how daily interest, payable interest, and installment-level interest interact with the repayment schedule.

### Verified components and changes (high level)

Because the reference does not expose internal implementation artifacts by name, the following description focuses on observable responsibilities and behaviors that were modified or exercised by the accruals rework:

- Accrual processing flow: Daily accruals are generated in the loan lifecycle and contribute to the calculation of payable interest and the repayment schedule. The reference material shows daily accrual events and how they influence balance and due amounts over time.
- Accrual posting and posting-related events: The system records accruals as posting events that affect the loan balance and interest due. The material distinguishes between daily accrual entries, accural activity postings, and payments that settle interest and principal.
- Reversals and replays: The model includes explicit entries for accrual reversals and the subsequent replay of accruals to restore schedule consistency after a reversal or backdated change. The reference demonstrates scenarios using daily accrual-reversed and daily accrual - replayed events, verifying the schedule remains consistent.
- Backdated adjustments: The reference contains scenarios where repayments occur with backdating, requiring accrual adjustments and associated schedule recalculation to reflect the new effective dates.
- Schedule recalculation and integrity: After each accrual event, reversal, or repayment adjustment, the repayment schedule is reevaluated to verify correctness, with invariants such as opening balances equaling prior period closing balances, and proper allocation of due amounts between principal and interest.
- Calculation references and day-count conventions: The reference material provides calculation models for single and multi-disbursement cases, including first repayment dates, first installment interest, and total installment interest across subsequent disbursements, illustrating how daily accruals aggregate into period-level figures.

These behaviors are evidenced by the scenarios in the reference data, including:
- Scenario sets labeled as reverse replay of accruals on early payment, backdated repayment with accrual adjustment, and backdated early payment with schedule updates.
- Calculation references showing how daily interest accumulates and how first repayment dates and installment-level interest are determined for different disbursement patterns.

### Concepts and terminology (anchored to the reference data)

- Daily accrual: The daily accumulation of interest for the loan, represented as a distinct accrual event. These entries contribute to the overall interest payable and feed into the repayment calculations.
- Accrual posting: The act of recording the accrued interest as a posting event that affects the loan's balance and the schedule, separating the accrual from the repayment transaction itself.
- Accrual activity: A recording or acknowledgment of the accrual amount that will be reflected in the repayment path, often accompanying the daily accrual event.
- Repayment: A cash settlement that reduces principal and, in some cases, the accrued interest. The repayment is reflected on the schedule and often triggers recalculation of subsequent installments.
- Daily accrual-reversed: A reversal entry that nullifies a previously posted daily accrual.
- Daily accrual - replayed: A subsequent posting that re-applies accruals after a reversal, to restore consistency with the intended accrual path.
- Repayment reversal: A reversal of a repayment event, typically in the context of backdated adjustments or error corrections, which then necessitates recalculation of the accrual path.
- Schedule recalculation: The process of recomputing the repayment schedule after accrual postings, reversals, or repayments to verify consistency with the current event timeline.
- Payable interest: A concept used in the calculation references to denote the portion of interest deemed payable at a given point in the accrual path.
- First repayment date and installment interest: In the single-disbursement calculation model, the first repayment date marks when installments begin, and the first installment interest is the interest component due with the initial installment.
- Day-count convention and year basis: The reference material uses a 360-day year for daily interest calculations, with daily accruals performed in the context of that convention.

### Calculation references: what the reference demonstrates

The reference includes a dedicated calculation model that contrasts single-disbursement and multi-disbursement scenarios, illustrating how daily accruals translate into installment-level interest and balances. Key points include:
- For single disbursement scenarios, the calculation model shows that the first repayment date is the month following disbursement (for example, 1-Feb-2024 given a disbursement on 1-Jan-2024) and that the first installment interest is a defined amount prior to the full installment calculation.
- The model accounts for multiple disbursements, aggregating daily accruals into total installment interest for the period and showing how subsequent accruals influence the total interest due for a given installment schedule.
- The calculation sheets also demonstrate the use of a 360-day year and daily interest rates to derive daily accruals and, by extension, payable interest and balance evolution.

In practical terms, the reference provides concrete values that illustrate these concepts. For example, in the single-disbursement model, the first repayment date is 1-Feb-2024, and the installment structure includes a defined first-installment interest amount, with total installment interest reported after subsequent disbursements. These figures are provided to illustrate how daily accruals cohere with the scheduled repayments and how accrue-and-pay transactions propagate through the loan lifecycle.

### Representative workflows and examples (derived from reference data)

The reference material presents end-to-end scenarios that demonstrate how accruals are posted, reversed, replayed, and reinserted into the repayment path. Two representative patterns emerge:

- Reverse replay of accruals when an early payment arrives: The sequence shows daily accruals posting up to the early payment date, followed by a repayment that requires reversal of the accruals and a replay of the accruals to re-create the correct accrual path that follows the adjusted repayment date.
- Backdated repayments with accrual adjustments: When a repayment is backdated, accruals up to the backdated date are reversed and then recalculated to reflect the repayment path consistent with the new dates, with the schedule updated .

In addition, the reference includes a detailed google sheet scenario that uses a simple loan example to illustrate how a posted interest payable schedule evolves through a sequence of accrual postings, repayments, reversals, and replays. The sheet demonstrates a daily-interest calculation with a 360-day year, an interest-rate basis, and a timeline of payments that ultimately feeds a recalculated repayment schedule after each adjustment.

### Diagram: accruals processing flow (verified)

flowchart TD
 A[Disbursement] --> B[Daily accrual]
 B --> C[Accrual posting]
 C --> D[Repayment]
 D --> E[Schedule update]
 E --> F{Early payment or reversal}
 F --> G[Accrual reversal]
 G --> H[Daily accrual - reversed]
 H --> I[Daily accrual - replayed]
 I --> J[Schedule recalculation]

This diagram captures the core lifecycle illustrated by the reference material: accruals are posted daily, repayments update the balance, and special events such as early payments or reversals trigger reversals and replays to maintain schedule integrity.

### Financial calculations and integrity notes

The rework centers on verifying financial integrity across accrual events, repayments, and adjustments. The following principles are verified in the reference data:

- Opening balance continuity: Each period’s opening balance equals the previous period’s closing balance, even in the presence of accrual postings, reversals, and backdated repayments.
- Allocation consistency: Payment amounts allocated to principal and interest reconcile with the transaction amount, and the remaining due follows the schedule after each adjustment.
- Schedule consistency: The repayment schedule is recalculated after accrual events, reversals, and repayments, preserving coherent installment dates, interest components, and due amounts.
- Payable and accrued interest accounting: The reference data demonstrates a distinction between accrued interest and payable interest during accrual and posting steps, including scenarios where payable interest is adjusted following reversals or backdated repayments.
- No gap in transaction sequencing: The reference scenarios maintain a logical progression of events (disbursement, daily accrual, accrual posting, repayment, potential reversal, and possible replay), with each step building on the prior state.
- Day-count and precision: Daily accruals rely on a 360-day year convention, and the calculations reflect the precision shown in the reference figures (for example, daily accrual amounts and installment interest figures in the provided sheets).

Note: The numbers in the reference material are provided to illustrate the mechanics of accrual posting and schedule recalculation. They are included to demonstrate how daily accruals, repayments, reversals, backdated repayments, and replays interact to produce a coherent repayment path. They should be interpreted in the context of the specific scenarios and dates shown in the reference data.

### Appendix: key terms and quick-reference values (-based)

- Disbursement: The initial loan amount, recorded as the starting balance.
- Daily accrual: The daily increment to interest, used to derive the period’s accrual amount before it is posted.
- Accrual posting: The act of recording the accrued interest as a posting event, contributing to the payable interest and the repayment plan.
- Accrual activity: The recorded accrual amount associated with a given daily date.
- Repayment: A payment reducing principal and interest, affecting the balance and future installments.
- Accrual reversal: The reversal of a previously posted accrual entry.
- Daily accrual-reversed: The specific reversal entry that negates a previously posted daily accrual.
- Daily accrual - replayed: The re-posting of accruals after a reversal to restore the intended accrual path.
- Repayment reversal: A reversal of a repayment entry, typically used to back out an incorrectly posted repayment in the context of an adjustment.
- Payable interest: The portion of interest deemed payable in the calculation model; used to determine allocation to installments.
- First repayment date: In single-disbursement calculation, the date when the first installment becomes due.
- First installment interest: The interest component associated with the initial installment.
- 360-day year: The day-count convention used for daily interest calculations in the reference material.

### How to read the reference-derived numbers (guidance only)

The reference material includes explicit numerical examples showing how daily accruals accumulate, how installments are formed, and how adjustments propagate through the schedule. When consulting the reference data, consider the following guidance:

- Identify the sequence of events for a given scenario (disbursement, daily accruals, postings, repayments, reversals, replays) to understand the evolution of the balance and the due amounts.
- Observe how the schedule is recalculated after a reversal or backdated repayment to verify that opening and closing balances remain consistent across periods.
- Use the calculation references to understand the relationship between daily accruals, payable interest, and installment-level interest components, noting that the first repayment date and the installment structure are sensitive to the disbursement pattern.

This page presents the verified model and its observable behavior as described in the reference data. It documents what the rework accomplishes, how accruals are processed and adjusted, and how the repayment schedule remains consistent under the described scenarios. It does not disclose internal implementation details beyond what is evidenced in the reference data, and it avoids any speculation about private interfaces or unreleased contracts.