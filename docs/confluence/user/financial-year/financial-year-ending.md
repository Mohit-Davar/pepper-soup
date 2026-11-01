<!-- Labels: user, financial-year -->
# Financial Year Ending

This feature provides an auditable mechanism to recognize and record a year-end profit and loss (P&L) within the Fineract accounting system by posting a manual journal entry attributed to asset owners (external investors). It allows the organization to close the books for a financial year when an automated year-ending process does not exist. The manual entry approach follows the asset externalization workflow, allowing P&L to be associated with specific asset owners for reporting and reconciliation. Users who benefit include operations staff, loan officers, branch managers, and credit agents who need to reflect year-end results in the system and maintain accurate investor-related accounting records.

### What this feature does and why it matters

- It allows the manual capture of FY-end P&L within Fineract by creating a journal entry that is attributed to one or more asset owners. This provides a complete and auditable record of year-end profitability or loss within the context of investor-owned portfolios.
- It integrates with existing asset externalization structures by permitting an asset-owner scope for the journal entry. This supports reporting and reconciliation that distinguishes outcomes by asset owner, which is important for investor accountability and compliance reporting.
- It preserves double-entry accounting discipline: every manual journal entry must balance (total debits equal total credits). Unbalanced entries will not post.
- It updates reporting to reflect asset-owner granularity. The Trial Balance and related accounting reports can present asset-owner-specific postings so that investor cash activity and owner-related balances are visible and reconcilable.

### Who benefits

- Operations staff who prepare and verify year-end financial results.
- Credit and investor-facing teams that require accurate, owner-specific profitability reporting.
- Branch managers and loan officers who need to see consolidated and owner-level outcomes for performance reviews and Year-End disclosures.

### How the feature is used in practice

The year-end process remains manual. Finance calculates the FY-end net P&L based on all income and expense accounts for the period, then posts a manual journal entry to reflect this result. The journal entry is associated with the asset owner(s) that pertain to the P&L allocation, enabling owner-level reporting and auditability. The system validates the journal entry for balance before posting and then updates relevant accounting reports to include the new line items under the standard asset owner.

---

### How to perform the Year Ending manual journal entry (operational steps)

1) Navigate to the FY ending workflow
- Go to the following path in the application: **Reporting and Accounting > Financial year > Financial Year Ending**. This opens the year-ending workflow where you prepare the year-end close entries.
- System outcome: Access to the year-ending workflow is displayed, ready to initiate a manual journal entry.

2) Create a new manual journal entry for the asset owner(s)
- Click **Create Manual Journal Entry** (or the equivalent action in the workflow).
- System outcome: A new journal entry form is opened, ready to capture the year-end amounts.

3) Associate the entry with the relevant asset owner(s)
- In the journal entry, specify the target **Asset Owner** (the external investor) to which the P&L will be attributed. This field is required to verify the entry is linked to the correct owner for reporting.
- System outcome: The journal entry is scoped to the selected asset owner; the owner dimension will be carried on the entry lines.

4) Enter the P&L components as debit and credit lines
- Add line items to represent the year-end P&L. Provide the standard debit and credit lines that reflect the net result (revenue and expenses) for the FY. verify that the total debits equal the total credits for the entry so the journal balances.
- System outcome: The journal entry lines are populated and the total debits match total credits; the entry is ready for posting.

5) Validate, post, and review
- Submit the journal entry for posting. The system will validate that the entry balances and that the asset owner field is populated. If the entry does not balance, the system will present an error and prevent posting until the discrepancy is resolved.
- System outcome: The manual FY-end journal entry is posted to the general ledger with asset owner attribution. The affected accounts reflect the entry, and the asset owner’s reporting context is updated .

6) Verify reporting impact
- After posting, open the reporting views to verify that the asset-owner dimension now includes the FY-end entry. The Trial Balance Summary and related reports should show the entry under the standard asset owner, enabling reconciliation and investor-level visibility.
- System outcome: Asset-owner-specific postings are visible in the daily/goodstanding reporting streams, supporting end-of-year reconciliations and investor disclosures.

> Note on access and permissions: Access to asset-owner level manual journal entries is governed by the external investor module permissions. Only users with the designated external investor permission (in addition to superuser privileges ) can perform these actions. This restriction verifies that only authorized personnel can post owner-attributed year-end adjustments.

---

### Data and reporting impact

- Manual year-end journal entries must balance: the system enforces double-entry accounting, so total debits must equal total credits. Unbalanced entries cannot be posted.
- Asset owner attribution on journal lines allows owner-level reporting. All postings affecting P&L are associated with the asset owner identified on the entry, allowing reporting and reconciliation that distinguish profitability by investor.
- Trial Balance and related reports are extended to reflect asset-owner granularity for manual journal entries. This supports investor-level reconciliation and verifies that owner balances and related P&L effects are traceable through the reporting stack.
- There is no prescriptive automation of year-end calculations within the feature. The P&L calculation remains a manual process performed by finance. The system provides the mechanism to record the calculated result and link it to the standard asset owner for reporting purposes.

---

### Validation rules and constraints

- The journal entry must balance (sum of debits equals sum of credits) to post.
- The Asset Owner field is required for a year-end entry intended to affect investor-owned assets.
- Only users with the external investor permission (and standard admin rights) can create and post asset-owner–level manual journal entries.
- After posting, the entry appears in asset-owner reporting contexts and in the general ledger with asset-owner attribution for traceability.

---

### Relationship to asset externalization and reporting changes

The year-ending capability directly supports the reporting needs of asset externalization by enabling P&L to be tracked at the asset owner level. It complements existing asset ownership workflows by anchoring year-end results to the associated investors, which improves transparency and auditability of investor-related profitability metrics.

---

### Mermaids diagram: FY Ending process lifecycle

```
flowchart TD
 A[Financial Year Ending] --> B[Finance calculates FY P&L]
 B --> C[Create Manual Journal Entry for Asset Owners]
 C --> D{Journal Entry balanced?}
 D -->|Yes| E[Post JE to GL]
 D -->|No| F[Resolve imbalance: adjust lines]
 E --> G[Ledger updated with asset owner attribution]
 G --> H[Reporting updated: asset-owner TB and P&L views]
```

---

### Terminology

- Asset owner: The external investor who owns a financial asset (loan) within the asset externalization framework.
- Manual journal entry: An accounting entry created by users to record transactions that are not generated by automated system processes.
- Asset-owner attribution: The association of journal lines to a specific asset owner so that reporting and reconciliation can be performed at the investor level.

If you require additional guidance on aligning FY-ending entries with other year-end controls or investor reporting, consult your finance governance policies to verify alignment with local regulatory and organizational requirements.