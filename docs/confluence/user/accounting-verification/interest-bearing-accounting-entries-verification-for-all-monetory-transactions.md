<!-- Labels: user, accounting-verification -->
# Interest Bearing Accounting entries verification for all Monetory transactions

This support function provides a structured verification of the accounting entries generated for every monetary transaction in the system, with a focus on the components that bear interest or affect interest-bearing balances. The verification verifies that the general ledger reflects each transaction’s principal, interest, fees, penalties, recoveries, and related adjustments using the predefined accounting mappings. It is part of the standard accounting verification workflow and applies to all monetary transactions processed by the system. The verification process is triggered as part of the ongoing reporting and accounting validation activities and is executed across all transaction types defined in the monetary activity set.

### Scope and triggers

The verification covers all monetary transactions that post to the general ledger, including, but not limited to, disbursements, repayments, refunds, charge-offs (fraudulent and non-fraudulent), merchant refunds, goodwill adjustments, payout refunds, and repayments associated with other receivables. The verification uses a predefined mapping that associates each monetary component of a transaction with specific general ledger (GL) accounts and indicates the standard accounting treatment (which accounts are debited or credited for each component). The objective is to confirm that every component of every transaction is represented in the ledger exactly as specified by the mapping, and that the overall postings are balanced.

> Note: The mapping and related accounting rules define which GL accounts are involved for each component (for example, principal, interest, fees, penalties, recoveries, and adjustments). The verification does not introduce new fields or new accounts; it validates that the posted entries conform to the established mapping and accounting rules.

### How the verification works

The verification proceeds through a disciplined sequence that operators follow within the accounting verification workflow.

1) Access the verification screen
- Navigate to Reporting and Accounting > Accounting verification > Interest Bearing Accounting entries verification for all Monetary transactions. This path is the standard entry point for reviewing interest-bearing postings across all monetary activity.

2) Gather the transaction set for the verification period
- Retrieve all monetary transactions that posted during the target period. The goal is to verify every transaction potentially bearing interest is included in the verification run.

3) Determine the expected components for each transaction
- For every transaction, identify the relevant components (for example, principal, interest, penalties, fees, recoveries, and any unallocated balance like UNC) and the associated accounting treatment as defined by the mapping. The verification uses the component-level expectations to validate the ledger postings.

4) Validate ledger postings against the mapping
- For each component of each transaction, confirm that the general ledger accounts used match the accounts defined for that component in the mapping, and that the overall posting follows the designated debit/credit structure. The verification also checks that the totals balance within the journal entry (debits equal credits) and that the transaction-level impact is consistent with the expected accounting treatment (for example, interest income recognized in the standard income account, and related receivables or suspense accounts updated as defined).

5) Check balance integrity across periods
- Verify that the opening balance for the period equals the prior period’s closing balance for relevant accounts. This verifies continuity of balances period over period and supports accurate accrual accounting for interest-bearing activities.

6) Flag discrepancies and produce a remediation plan
- If any transaction or component fails to follows the mapping, if a posting does not balance, or if an opening balance does not reconcile with the prior close, the entry is flagged for investigation. A discrepancy report is generated and routed to the accounting operations team for remediation.

7) Resolve, re-verify, and finalize
- After remediation actions (such as posting corrective entries or adjusting mappings as required by policy), re-run the verification to confirm that all entries now conform to the mapping and balance expectations. Once verification passes, the period can be finalized.

### What is checked, conceptually

- Components and mapped accounts: Each monetary component (principal, interest, fees, penalties, UNC, recoveries, etc.) is linked to a defined GL account or set of accounts. Verification confirms that the accounts used for each component match the defined mapping and that the transactions’ journal entries reflect those mappings.
- Balance integrity: For every journal entry, total debits equal total credits; opening balances follows prior closing balances; and the sum of all component postings reconciles with the transaction amount.
- Interest-bearing perspective: The process places emphasis on entries that affect interest-bearing balances, so that interest income, interest receivable, and related adjustments are posted to the correct revenue or asset accounts as defined by the mapping.
- Consistency of classifications: Accounts used for charges, fees, and recoveries are consistent with their respective GL types (Asset, Liability, Income, or Expense) as defined in the general ledger mapping.

### General ledger accounts referenced in the mappings
The following general ledger accounts are used by the interest-bearing accounting verification mapping. Each entry lists the account number, the description, and the GL type. These accounts reflect the named categories used in the verified mappings and are not placeholders.

- 112601 — Loans Receivable — Asset
- 145023 — Suspense/Clearing account — Suspense/clearing account
- 112603 — Fee Receivable — Asset
- 245000 — Other Credit liability — Liability
- 744003 — Principal bal adjustment — Expense
- 404001 — Interest income charge off — Income
- 404007 — Fee Income — Income
- 404011 — Fee Income — Income
- 404000 — Interest income — Income
- 145800 — Other receivables — Asset
- 404008 — Fee Charge off — Income
- 744008 — recoveries — Expense
- 744007 — Credit Loss/Bad Debt — Expense
- 744037 — Credit Loss/Bad Debt Fraud — Expense

These accounts represent the key balance sheet and income statement lines used by the verification rules. They are the reference points for posted entries and are cross-checked against the transaction components during verification.

### Example concepts (no numbers required)

- A loan repayment transaction has principal and interest components. The verification verifies the principal component maps to the Loans Receivable (asset) and that the related cash movement and the interest component map to Interest Income and Interest Receivable as defined by the mapping. The combined posting must balance.
- A charge-off event (fraud or non-fraud) splits into principal, interest portion, and fees/penalties, each posting to the accounts designated for those components (for example, principal bal adjustment, credit loss/ bad debt expense, and related income or expense lines). The verification validates that each component uses the correct accounts and that the aggregate postings reconcile.
- A merchant refund that involves an unallocated credit (UNC) flows through the suspense/clearing account and into the standard liability or revenue lines as defined by the mapping, with the final postings maintaining balance and proper classification.

### Operational steps and approvals

- Run cadence: The verification is executed as part of the standard accounting verification workflow and reviewed by the operations or accounting team responsible for month-end or period-end closing activities.
- Review and remediation: If discrepancies are detected, accounting operations review the flagged transactions, prepare corrective postings if required, and re-run verification to confirm resolution. Escalation to a supervisor or finance lead occurs for unresolved or systemic mapping issues.
- Documentation: All verification results, including discrepancies and resolutions, should be documented in the period-end reconciliation package when applicable.

### Error states, recovery, and escalation (concise)
- Imbalance in a transaction: The posting does not balance (debits ≠ credits). The transaction is flagged, investigated, and corrected if permissible by policy.
- Missing or incomplete mapping: If a transaction component lacks a defined account mapping, the verification flags the item for mapping review and potential enrichment of the general ledger rules.
- Opening-balance mismatch: If the opening balance does not equal the prior period’s closing balance for relevant accounts, the discrepancy is flagged for reconciliation and correction in coordination with the finance team.
- Persistent or systemic issues: If recurring mapping or posting issues are detected, escalation to the accounting governance owner is triggered for root-cause analysis and remediation planning.

### Diagram: verification lifecycle (Mermaid)
```
flowchart TD
 A[Start] --> B[Retrieve monetary transactions for period]
 B --> C[Identify components and mapping expectations]
 C --> D[Validate postings against mapping]
 D --> E{Entries balanced?}
 E -- Yes --> F[Check period-opening balances]
 F --> G{All checks pass?}
 G -- Yes --> H[Mark period verified and finalize]
 G -- No --> I[Generate discrepancy report & escalate]
 I --> J[Remediate postings or adjust mappings]
 J --> K[Re-run verification]
 K --> G
 H --> End[End]
```

### Outcome and reporting

The verification culminates in an outcome that determines whether the period’s monetary transactions are certified as correctly posted against the interest-bearing accounting mappings. When verified, postings are ready for reporting and financial close. If discrepancies remain, they are surfaced for remediation, and the verification cycle is repeated after corrective actions are applied.

---
This page documents verified product behavior for the Interest Bearing Accounting entries verification for all Monetary transactions. It describes what the function does, who triggers it, how it proceeds, the mappings it relies on, and how to respond to common error states. The guidance focuses on observable behavior, configurations that directly affect verification outcomes, and the financial effects of the verification activity.