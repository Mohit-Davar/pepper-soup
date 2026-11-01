# Accounting and Asset related changes

This release introduces enhanced capabilities to move funds from T24 books to Fineract and to externalize assets for real-time transfer to external investors. It documents two migration approaches, their respective accounting treatments, and the operational considerations required to perform and validate migrations. The changes affect how asset ownership is reflected, how opening balances are established at migration end, and how subsequent reporting reconciles opening balances with period balances.

### Overview

As a GPL credit manager, I expect that the system should allow to move the funds from T24 books to Fineract. Option 1: Provide API to set the T24 asset owner (with balance 0)

End of migration - modify a API to Sale/Buyback and create a GL entry indicates opening balance of the loan

Option 2
Dont create GL entries during migration

End of migration create a entry for trail balance report indicates opening balance of the loan including
Principal/Interest/Fee/Penalties

Specification Notes
Move funds from T24 books to Fineract

Asset externalization has to be enhanced to allow real-time loan transfers to external investors

### What changed and why it matters

The enhancement introduces two migration pathways, each with a defined end-state accounting signal:

- Option 1 establishes the T24 asset owner in the system with a zero balance, followed by a separate end-of-migration action that updates the external transfer flow via a Sale/Buyback API and creates a GL entry that indicates the opening balance of the loan. This approach provides a continuous, transactional trace of transfers and recognizes an opening loan balance through the GL.
- Option 2 defers GL entries during migration. At migration end, an entry is created for the trial balance report that indicates the opening balance of the loan, including Principal, Interest, Fees, and Penalties. This approach concentrates the opening balance recognition at the end of the migration cycle.

In addition, asset externalization is enhanced to support real-time loan transfers to external investors, aligning asset ownership changes with immediate downstream accounting and reporting expectations.

### Updated workflows (interaction changes)

Option 1 — Migration with GL entry at end of migration

1. Set the T24 asset owner to the external investor with a balance of

0. This marks the asset as owned by the external participant in the T24 book.
2. During the migration, prepare the asset for transfer using the Sale/Buyback flow; when migration completes, create a GL entry that indicates the opening balance of the loan.
3. After migration, verify that Fineract reflects the asset owner and that the GL entry balances to the opening loan amount.
4. Reconcile the migrated asset and associated GL balance with the trial balance for the period that contains the opening loan balance.

Option 2 — Migration without GL entries during migration

1. Migrate assets without creating GL entries.
2. At migration completion, create a single entry for the trial balance report that indicates the opening balance of the loan, including Principal, Interest, Fees, and Penalties.
3. Validate that the trial balance reflects the opening loan balance and that subsequent periods inherit correct opening balances.

### Asset externalization and real-time transfers

Asset externalization is enhanced to allow real-time loan transfers to external investors. This capability verifies that asset ownership changes are reflected promptly in both the operational systems (T24 and Fineract) and in the associated financial records, enabling timely reporting and reconciliations.

### Operational and migration considerations

- Compatibility with existing reconciliations: The chosen migration approach (Option 1 or Option 2) affects when opening balances appear in GLs versus trial balance reports. Operations staff must align closing balances from the migration window with the opening balances in the new system state.
- Reconciliation discipline: Regardless of the path, the opening balance recognized at migration end must reconcile with the prior period’s closing balance, and subsequent periods must carry forward correctly.
- Real-time transfers: Real-time asset transfers to external investors require that asset ownership and related balances are updated in a coordinated fashion across T24, Fineract, and the general ledger to maintain consistency in reporting and auditing trails.

### Accounting implications and integrity considerations

- Option 1 (GL entry at end of migration) creates an opening-balance GL entry that reflects the loan's starting point in the new system. The opening balance should follows the loan components carried into the new system.
- Option 2 (trial balance entry at end of migration) records the opening balance in the trial balance report, including Principal, Interest, Fees, and Penalties, and defers GL recognition to the end of migration.
- In all cases, the period opening balance must equal the previous period closing balance, and the totals in the new system must reconcile with prior records as part of the migration validation process.

### Questions and gaps (GAP items)

- Does JE entries to be created at each transaction level or just opening and closing balance?
- Same with funds

These questions describe gaps in the current specification and indicate areas where implementation details must be provided to complete the migration design.

### Data integrity and verification guidance

- The migration design must preserve the integrity of opening and closing balances across periods. Where GL entries are used, they must balance (debits equal credits) and reflect the opening loan balance as the starting point in the new system.
- The opening balance, whether recorded in GL entries (Option 1) or in a trial balance entry (Option 2), must include the loan components (Principal, Interest, Fees, Penalties) per the final migration approach.
- Any real-time transfers should update ownership and balances consistently across all affected systems to prevent discrepancies during reconciliation.

### Diagram: migration options and end-states

```mermaid
flowchart TD
 A[Migration Start] --> B1[Option 1: Set T24 asset owner (balance 0)]
 B1 --> C1[Migration: Update Sale/Buyback flow]
 C1 --> D1[End of migration: Create GL entry for opening balance]
 D1 --> E1[Post-migration: Fineract ownership aligned, GL balanced]
 A --> B2[Option 2: Do not create GL entries during migration]
 B2 --> C2[End of migration: Create trial balance entry for opening balance (P/I/F/Penalties)]
 C2 --> D2[Post-migration: Trial balance reflects opening balance]
 D1 --> F[Common: Real-time asset transfers to external investors]
 D2 --> F
```