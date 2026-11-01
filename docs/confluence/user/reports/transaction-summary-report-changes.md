<!-- Labels: user, reports -->
# Transaction summary report changes

This enhancement updates the Transaction summary report to reflect interest-related transactions. Specifically, the report now includes interest accrual, interest posted, interest waiver, and interest refund events alongside existing transaction data. The aim is to provide a complete, auditable view of all interest activity within the daily transaction stream to support reconciliation and daily posting by Credit Accounting staff.

### What changed and why it matters
- Interest accrual: The report surfaces accrual events so operators can see when interest is earned but not yet posted to the customer account.
- Interest posted: The report includes posted interest so customers’ balances reflect earned interest after posting. This helps verify daily postings against expected earnings.
- Interest waiver: Waived interest is now visible in the report, enabling reconciliation of exceptions and discount events that reduce interest income.
- Interest refund: Refunds of previously charged interest appear in the summary, so that reductions in interest income are traceable and auditable.

Collectively, these additions provide a single, authoritative daily view of interest activity that aids reconciliation, posting accuracy, and audit readiness.

### Scope and affected users
The changes affect users who rely on the daily transaction summary for reconciliation and posting, including:
- Operations staff
- Loan officers
- Branch managers
- Credit agents

### How the updated behavior works
- Data source and population: The report uses existing interest-related transaction data already recorded in the system. It categorizes each interest event as one of the four types: accrual, posted, waiver, or refund.
- Presentation: For each relevant transaction, the report presents the event type and its amount as part of the daily activity trail. The presentation highlights interest-related activity in a way that supports reconciliation against postings and the general ledger.
- Consequences for reconciliation: Because interest activity is now visible in the daily summary, operators can reconcile daily cash movements and outstanding balances with interest-related postings more comprehensively.

Note: The current documentation describes the report details updated to reflect interest activity. Acceptance criteria and specific use-case validation are described as ongoing discussions with stakeholders and are not deemed implemented within this release.

### Updated workflow (interaction changes)
If you access the new report, follow these steps to generate and validate the output:
1. Navigate to Reporting and Accounting > Reports > Transaction summary report changes.
2. Select the desired date range for the report period.
3. Run the report to generate the daily transaction summary.
4. Review the output for the four interest categories: accrual, posted, waiver, and refund. Confirm that the totals for each category reconcile with daily postings and any adjustments.
5. If discrepancies are found, investigate the associated interest events in the ledger or transaction logs and reconcile the differences.

### Data handling and migration considerations
- Data sources: There are no described changes to data sources; the report relies on existing interest transaction data already captured in the system.
- Historical reports: The enhancement focuses on including interest activity in the daily transaction summary. Guidance on historical report behavior and archival considerations should be aligned with existing reconciliation practices.
- Training and procedures: Operations staff may need to adjust daily reconciliation procedures to account for the newly visible interest categories. Training should emphasize locating and interpreting accrual, posted, waiver, and refund events within the Transaction summary report changes.

### Rules, constraints, and integrity notes
- Classification of events: Each interest event in the report is categorized as one of the four types listed above. The report presents each event in the period in which it occurred.
- Balances and totals: Opening and closing balances in the report must reconcile with the associated postings and with the totals presented for interest categories.
- Precision and rounding: The report uses the same rounding conventions as existing transaction calculations. , balance and amount figures reflect verified precision per the current accounting rules.

### Operational outcomes
- Reconciliation visibility: Credit Accounting staff gain visibility into all interest-related activity, improving daily reconciliation confidence.
- Audit trail: The inclusion of accrual, posted, waiver, and refund events creates a more complete audit trail for interest movements across customer accounts.

### Notes
- The enhancement description focuses on presentation and categorization of interest events within the Transaction summary report. No changes to external interfaces or data exchange formats are described.
- Further use-case validation and acceptance criteria are to be refined in collaboration with stakeholders.