<!-- Labels: user, next-last -->
# New Allocation rule - Next/Last

This page documents the New Allocation rule - Next/Last enhancement. It adds the ability to perform allocations against the Next or Last installment when applying repayments to loans, aligning with the behavior commonly used in T24. The configuration for selecting the Next/Last Installment operation is exposed under the path Repayment and Allocation > Next/Last > New Allocation rule - Next/Last. The change matters for day-to-day operations because it gives credit managers, loan officers, and operations staff explicit control over which installment a payment should be applied to, subject to the defined allocation sequence.

### What changes, and why it matters

- A new allocation rule configuration is available to select the Next Installment or Last Installment operation. This allows targeted application of repayments to either the upcoming due installment or the most distant outstanding installment within the defined allocation flow.
- The allocation behavior remains governed by the existing allocation sequence, which determines how a payment is distributed across loan components when applying to a repayment. The sequence shown in the reference demonstrates the order of components for allocation when applying a payment:
 - overdue interest → overdue principal → overdue fees → due interest → due principal → due fees → advance principal → advance interest → advance fees.
- The feature is designed to work with the loan-amortization context demonstrated in the reference calculations and schedules, and it is compatible with the existing repayment and allocation workflow where a payment affects multiple components over time.

### How to configure the Next/Last rule

1) Navigate to Repayment and Allocation > Next/Last > New Allocation rule - Next/Last. Open the New Allocation rule - Next/Last page.
2) In the rule configuration, select the desired operation:
 - Next Installment: apply the repayment to the upcoming installment according to the selected allocation sequence.
 - Last Installment: apply the repayment to the most distant outstanding installment according to the selected allocation sequence.
3) Save the rule. The rule stores the chosen operation as part of the New Allocation rule - Next/Last configuration.
4) Associate the rule with loans or repayment scenarios as standard for your portfolio or workflow. When a payment is processed under this rule, the system will allocate to the Next or Last installment as configured, distributing the payment across components in the defined order.

### How the Next/Last flow operates (conceptual workflow)

- A repayment is received against a loan with an active New Allocation rule - Next/Last. The system uses the rule's operation setting (Next or Last) to determine the target installment for allocation.
- The allocation then follows the defined component sequence within the rule: overdue interest, overdue principal, overdue fees, due interest, due principal, due fees, advance principal, advance interest, advance fees.
- After allocation, per-period balances are updated. The opening balance of the next period equals the previous period's closing balance, preserving the integrity of the amortization schedule.
- The allocation transaction is recorded in the loan’s repayment stream, and the remaining balances, installments fulfilled, and any miscellaneous allocations (fees, advances) reflect the applied payment.

### Reference calculations and schedules (context for understanding the rule’s effects)

The reference calculations illustrate a typical amortizing loan with a single principal of 100, an annual interest rate of 7%, a 360-day year, and 30-day months, with repayments monthly. The following inputs and results support understanding of how allocations and balances evolve under the Simplified amortization model used in the reference:

- Inputs used in the reference calculation:
 - Principal: 100.00
 - Interest rate: 7% per year (0.000194444 daily)
 - Days in year: 360
 - Days in month: 30
 - Repayment frequency: 1.00 month

- Example of the loan amortization steps (excerpt from the reference for the period starting 2/1/24):
 - 2/1/24
 - Balance after payment: 83.57
 - EMI: 17.01
 - Principal repaid: 16.43
 - Interest: 0.58
 - 3/1/24
 - Balance after payment: 67.05
 - EMI: 17.01
 - Principal repaid: 16.52
 - Interest: 0.49

- Summary line (illustrative): the initial balance is 100.00 and the progression over these two periods reduces the balance to 67.05, with total periodic payments of 17.01 each period and component allocations that follows the schedule and rate assumptions in the reference.

> Note: The numbers shown here reflect the reference calculations and are presented to two decimal places. The reference also includes broader tables that show the full progression through the repayment horizon; the excerpt above highlights how balance, principal, and interest evolve in the early periods under the given inputs.

### Rules and constraints to observe

- The Next/Last operation is configured per New Allocation rule - Next/Last. The rule determines which installment a payment targets when applied under this allocation configuration.
- The allocation sequence remains the defined order of components: overdue interest, overdue principal, overdue fees, due interest, due principal, due fees, advance principal, advance interest, advance fees. This order governs how any single payment is distributed among loan components once the target installment (Next or Last) is selected.
- Opening balances must equal the previous period’s closing balances, preserving the continuity of the amortization schedule.
- Allocation amounts must reconcile with the total payment amount and with the resulting balances per component. Where multiple components exist, the sum of allocated amounts should equal the payment amount, subject to rounding rules reflected in the reference figures (rounded to two decimals in the calculations).
- Rounding in the reference calculations is shown to two decimals. Where rounding conventions are required by the system, apply the evidenced precision to maintain consistency with the reference data.

### Migration and compatibility considerations

- The reference data provides the configuration and expected behavior for the Next/Last allocation feature but does not document data-model changes, migration steps, or legacy behavior mappings. Operational teams should treat this page as defining the implemented behavior for the Next/Last rule and plan testing .
- When introducing the Next/Last rule alongside existing allocation rules, test in a controlled environment to confirm that payments allocated under Next/Last follow the defined component sequence and that the target installment (Next or Last) is selected as configured.
- For loans with active allocations, verify that the rule application yields balances and installment statuses consistent with the expected amortization path, especially where overdue components and advance components are involved.

### Summary

The New Allocation rule - Next/Last provides operationally meaningful control over how repayments are allocated to installments. By configuring Next or Last as the target installment and applying the existing allocation sequence, staff can align repayment behavior with policy expectations and with practices used in other core banking systems. The reference calculations illustrate the underlying amortization mechanics that drive these allocations, including how balances, principal, and interest evolve over time under a monthly repayment schedule.