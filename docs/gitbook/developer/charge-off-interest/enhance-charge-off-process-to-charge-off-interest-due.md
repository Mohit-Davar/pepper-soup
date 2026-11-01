# Charge off process to charge off interest due

### Overview
The enhancement described as “Charge off process to charge off interest due” adds automated handling for writing off interest balances as part of the overall charge-off workflow. The objective is to verify accounting entries reflect charged-off interest alongside principal and other charge-off components so that the ledger remains consistent with the defined accounting mappings. The reference data identifies the specific GL accounts and mapping rules that govern how different portions of a charge-off are posted, including distinctions between fraud and non-fraud scenarios and between principal, interest, fees, and penalties.

The reference material frames charge-off accounting as a multi-part process where the system determines the portions of a balance to be written off and then posts the associated entries using a predefined set of general ledger accounts. The resulting postings affect loans balances, receivables, expense and income accounts, as well as suspense and liability accounts used for reconciliation and overpayments. The behavior is organized around two broad categories of charge-off flows (Fraud and Non-Fraud) and a set of components that may be charged off (principal, interest, fees, penalties, and unallocated credits).

### Scope of changes and touched components
The reference data describes a structured accounting mapping that would be leveraged by the charge-off processing subsystem in the accounting layer. Key touched components and artifact types include:

- Charge-off mapping rules (For Fineract charge-off mapping): This mapping uses dedicated rows to connect charge-off scenarios with the standard General Ledger (GL) accounts. It includes entries for both Fraud and Non-Fraud variants and covers the principal, interest, fees, and penalties portions, as well as recovery-related lines.
- Chart of Accounts (COA): A defined set of GL accounts and their types (Asset, Liability, Income, Expense, Suspense) that are used when posting charge-off entries. Notable accounts include Loans Receivable (112601), Suspense/Clearing (145023), Fee Receivable (112603), Interest Income (404000), Interest income charge off (404001), Fee Income (404007/404011), Fee Charge off (404008), Credit Loss/Bad Debt (744007), Credit Loss/Bad Debt Fraud (744037), Principal bal adjustment (744003), and Overpayment Liability (245000).
- PP full accounting mapping: This mapping ties transaction types to the GL accounts and indicates the cash flow direction (Cash In, Cash Out) and the related fund/source accounts. It includes specific lines for Interest - Repayment, Late Fee Payment, Principal Payment, and Unallocated Credit (UNC) within charge-off contexts, with references to the GL accounts listed in the COA.

The mappings indicate that charge-off accounting entries for interest due are treated as part of the broader charge-off framework, and they reference the dedicated entry for interest-offline postings as Interest income charge off (GL 404001) within the income category. They also show how interest-related postings relate to other accounts, such as Interest Receivable and Suspense/Clearing, depending on the precise flow and category (fraud vs. non-fraud).

> Note: Several lines in the practical mapping are marked as “in development,” indicating gaps in implementation status for some lines of the charge-off accounting mappings. These entries are present in the reference data but are not yet verified as fully deployed in the runtime behavior.

### How the system conceptualizes charge-off of interest due
The design treats charge-off as a composition of portions that may be charged off concurrently or sequentially, with each portion mapped to specific GL accounts. The principal portion is linked to reducing Loans Receivable and recognizing related expense or loss; the interest portion is recognized via an explicit “Interest income charge off” entry; fees and penalties follow their own charge-off lines. In fraud scenarios, the mapping uses separate accounts such as Credit Loss/Bad Debt Fraud and Charge-off expense - fraud; in non-fraud scenarios, standard charge-off paths apply (e.g., Credit Loss/Bad Debt and related expense lines). Recoveries continue to be accounted for through dedicated lines such as recoveries and overpayment liabilities.

The Chart of Accounts defines the accounts that participate in these postings, including the asset accounts for receivables, the liability for overpayments, the suspense/clearing account used during processing, and the various income and expense accounts that reflect charge-off activities. The separation of fraud-related and non-fraud-related postings reflects the need to distinguish the accounting treatment and reporting around different charge-off causes.

### Data model and accounting mappings (high level)
- GL accounts involved (as referenced in the COA sheet):
 - 112601 Loans Receivable (Asset)
 - 112603 Fee Receivable (Asset)
 - 145023 Suspense/Clearing (Suspense/clearing account)
 - 245000 Other Credit liability (Liability)
 - 404000 Interest income (Income)
 - 404001 Interest income charge off (Income)
 - 404007 Fee Income (Income)
 - 404008 Fee Charge off (Income)
 - 744003 Principal bal adjustment (Expense)
 - 744007 Credit Loss/Bad Debt (Expense)
 - 744037 Credit Loss/Bad Debt Fraud (Expense)
 - 145800 Other receivables (Asset)
- Mapping flows (as described in For Fineract charge-off mapping and PP full accounting sheets):
 - Principal portion is mapped to Loan-related and loss/expense accounts; in fraud scenarios, to Credit Loss/Bad Debt Fraud; in non-fraud, to Credit Loss/Bad Debt.
 - Interest portion is mapped to Interest income charge off (and related Interest Receivable postings as standard per the mapping).
 - Fees portion and Penalty portion map to Fee Charge off / Fee Income and related receivables and suspense entries.
 - Unallocated Credit (UNC) portions map to Overpayment Liability and associated charge-off related postings.
 - Recoveries tie back into the accounting flow via the standard recovery accounts and related offsets.

The documentation shows a structured alignment between charge-off components and GL accounts, enabling the general ledger to reflect the write-off through established revenue, expense, asset, and liability accounts in a consistent manner.

### Workflow and state transitions (high level)
A high-level workflow for charging off interest due can be described as follows:

1) Identify loans that are eligible for automated charge-off, including outstanding interest balances.
2) Decompose the outstanding balance into charge-off components: Principal portion, Interest portion, Fees portion, Penalty portion, and Unallocated Credit (UNC) .
3) For each component, post the associated GL entries according to the mapping rules described in the charge-off mapping and the COA definitions:
 - Principal portion postings involve reductions to Loans Receivable and recognition of a related loss (Credit Loss/Bad Debt or Fraud variant) and any necessary adjustments.
 - Interest portion postings involve recognizing interest-offload income through the Interest income charge off account and related receivables adjustments.
 - Fees and penalties follow their dedicated charge-off lines (Fee Charge off, Fee Income, Penalty flows), with associated receivables and suspense handling.
 - UNC flows post to Overpayment Liability and related charge-off entries.
4) Update the general ledger to reflect these postings, verifying balancing entries across debit and credit sides as defined by the underlying mapping.
5) Reconcile with suspense/clearing accounts and any other auxiliary accounts (e.g., recoveries, overpayments) to preserve the integrity of the accounting records.
6) Complete the period-end reconciliation and prepare audit-ready traces for charge-off events, including both fraud and non-fraud variants.

Note that several lines in the reference mappings are labeled as in development, signaling that portions of the spread across principal, interest, fees, penalties, and UNC are not yet verified as fully implemented in all environments.

### Calculations and financial integrity considerations
The reference data does not introduce new numeric formulas for the charge-off calculation itself; instead, it provides the mapping to GL accounts for each charge-off component. Therefore, the financial effect is realized through standard ledger postings against the chart of accounts for each component, consistent with the existing accounting framework. When interpreting the resulting postings, practitioners should verify:
- Each period’s opening balance equals the previous period’s closing balance after all charge-off postings are applied, except where explicit reconciliations or adjustments occur.
- Each component’s amount on the charge-off event sums to the total transaction amount being written off, and the allocations follows the configured mapping paths (principal, interest, fees, penalties, UNC).
- The postings balance in the GL (debits equal credits) once all components of a charge-off are posted.
- Rounding and precision adhere to the established rounding rules used by the accounting layer (no new rounding rules are introduced in the reference data).

### API and integration considerations (what is documented)
The reference data centers on internal accounting mappings and the chart of accounts the charge-off process will use. There is no explicit public API surface presented in this material. The described behavior is expressed through mapping rules and GL account references that would be consumed by the internal accounting integration, so that the charge-off process writes to the correct GL accounts for each component of the write-off.

### Known gaps and verified status
- Some mapping rows are marked as in development. These entries indicate that the associated charge-off flows for certain combinations of components (and fraud vs non-fraud paths) are not yet fully verified as implemented in the runtime. This is a GAP item in present tense: mappings labeled as in development have not yet demonstrated verified behavior.
- The core concept—that interest balances are charged off as part of automated charge-off and posted to an explicit Interest income charge off account—is supported by the reference data. The remaining flows (e.g., exact debit/credit directions for every row) are defined in the mapping sheets and will be realized by the accounting integration in accordance with those mappings.

### Example representation of the accounting mappings (summary)
The following simplified overview captures the principal associations described in the reference data. It is not a formula; it is a mapping reference to guide implementation and review.

- Principal portion → Loans Receivable (Asset) and Credit Loss/Bad Debt (Expense) with Fraud variant using Credit Loss/Bad Debt Fraud. Related adjustments may reference Principal bal adjustment .
- Interest portion → Interest income charge off (Income) and related postings to Interest Receivable as defined by the mapping. The COA includes both standard Interest income (404000) and interest-offload variants (404001).
- Fees portion → Fee Charge off (Income) and Fee Income or related receivables (Fee Receivable 112603).
- Penalty portion → Penalty-related lines within charge-off mapping (Income) ; may rely on dedicated penalty accounts mentioned in the mapping.
- UNC (Unallocated Credit) portion → Overpayment Liability (Liability 245000) with associated charge-off lines.
- Recoveries and goodwill-related adjustments follow the recoveries lines and related Goodwill mappings, , to reflect recovered amounts against charge-off expenses.

### Diagram: charge-off processing for interest due (high level)
```mermaid
flowchart TD
 A[Loan with outstanding interest balance] --> B{Charge-off eligibility?}
 B -->|Yes| C[Determine portions: Principal, Interest, Fees, Penalties, UNC]
 C --> D1[Principal portion -> Loans Receivable / Credit Loss (744007 or 744037)]
 C --> D2[Interest portion -> Interest income charge off (404001)]
 C --> D3[Fees portion -> Fee Charge off (404008)]
 C --> D4[Penalties portion -> Penalty-related lines]
 D1 --> E[Update Loan balance and loss provisioning]
 D2 --> E
 D3 --> E
 D4 --> E
 E --> F[Reconcile with Suspense (145023) and Overpayment Liability (245000) as needed]
 F --> G[Finalize GL entries]
 B -->|No| H[No charge-off action]
 G --> I[Audit trail]
```

### Practical guidance for engineers and integrators
- When implementing or validating the charge-off process, align the component-level mappings with the GL accounts described in the COA and the per-component mappings in the charge-off sheets. This verifies that the system posts to the correct accounts for principal, interest, fees, penalties, and UNC, and that fraud vs non-fraud distinctions are preserved.
- Pay particular attention to the Interest portion: the mapping references an explicit Interest income charge off account, which is intended to capture the write-off impact on income due to charged-off interest.
- Be aware of the in-development items: any mapping lines labeled as in development should be treated as gaps to be resolved before reaching production parity. Validate end-to-end postings for those lines in your environment.
- No API surface changes are described in this reference; if you require integration with external systems, expect to coordinate via existing internal accounting interfaces that consume the defined GL mappings.

This page documents the verified scope and mappings for charging off interest due as part of automated charge-off, along with the related GL accounts and the structure of the associated accounting entries. It reflects the architecture and behavior as described by the reference data, and it highlights areas where implementation remains in progress. The objective remains clear: verify interest balances are written off consistently with the broader charge-off framework to maintain accurate and auditable accounting records.