<!-- Labels: user, accruals -->
# Enhanced accrual handling

The Enhanced accrual handling feature is accessible under Interest and Accrual > Accruals > Enhanced accrual handling. It represents an enhancement intended to reduce operator effort during interest recalculation events by enabling automatic consideration of an ADJUSTMENT transaction where feasible. This capability is designed to minimize reverse-replaying while preserving the correct financial effect of recalculation scenarios.

### What changed and why it matters

- In recalculation situations, the system now has the potential to generate an ADJUSTMENT transaction automatically where it is possible to do so. This reduces the need for manual reversals and multiple replays, helping to streamline daily operations.
- By incorporating an adjustment path directly into the accrual process, operators can experience fewer manual interventions while still maintaining correct aging, balances, and accounting outcomes associated with recalculation events.

### Scope and applicability

- The enhancement applies to accrual processing during interest recalculation events, as described in the Enhanced accrual handling area of the accruals workflow.
- The specification notes indicate that this capability may be governed by underlying rules and may be refined over time. The current guidance confirms the intent to calculate an ADJUSTMENT transaction when feasible.

### How it behaves in practice

- The enhancement is implemented to operate within the existing accrual workflow. When an adjustment is calculable during a recalculation, the system is expected to create an ADJUSTMENT transaction to reflect the net impact of the recalculation.
- This behavior aims to reduce the frequency and complexity of reverse-replay actions that previously occurred during recalculation cycles.
- The documentation does not specify new user steps or UI changes; if any workflow updates exist, they would be described in product workflow guides beyond this page.

### Data, calculations, and accounting alignment

- No numeric examples, formulas, or detailed calculation steps are provided in the reference material for this enhancement within this page.
- The ADJUSTMENT transaction, when generated, participates in the accrual accounting process. Specific posting details (accounts, codes, rounding, etc.) are governed by the standard accounting policies and are not re-described here.
- As with all accrual-related activity, resulting balances, opening/closing positions, and related allocations must remain consistent with verified arithmetic and accounting rules.

### Operational considerations and migration

- The reference does not specify explicit migration steps for this enhancement. Operational teams should follow standard deployment and release practices for feature enhancements and verify reconciliation behavior after go-live.
- There are no documented new user-facing steps in this page. If workflow guides are updated elsewhere, they will describe any confirmed changes to interaction patterns within the accruals process.
- Validation activities should confirm that recalculation events reflect the intended net effect and that any generated ADJUSTMENT transactions balance within the accruals workflow, in line with existing accounting rules.

### Navigation and discovery

- Path to locate this feature: Interest and Accrual > Accruals > Enhanced accrual handling.

### Notes on verification and interpretation

- This page documents verified intent and behavior as described in the reference: the enhancement aims to save effort and reduce reverse-replaying by enabling an ADJUSTMENT transaction when feasible.
- Because the reference does not provide detailed numerical examples or full rule sets, operators should rely on the broader accruals policy and the standard accounting controls when interpreting results of recalculation events and any resulting adjustments.