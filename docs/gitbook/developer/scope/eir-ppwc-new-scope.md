# EIR / PPWC new scope

This document describes the EIR-based Working Capital (PPWC) scope added to the Pepper-Soup product, capturing the objectives, architectural decisions, and expected deliverables associated with the initiative. It documents the verified product behavior and design decisions that follow the Working Capital product requirements, verifying a clear boundary between implementation surface and future planning items.

## Overview

The scope introduces a dedicated Working Capital loan product, implemented as a separate module with its own configuration and lifecycle. The design centers on an Effective Interest Rate (EIR) based calculation model for revenue-based or fixed-payment configurations, aligning with PayPal’s Working Capital financing concepts. The objective is to provide accurate income recognition, regulatory-compliant amortization, and flexible repayment structures while avoiding accrual-type transactions and traditional term-loan schedules for this instrument.

Key characteristics reflected in the scope include:
- A zero-interest loan product with no accrual or accrual-type transactions required for these loan accounts.
- A single-disbursement model, with no traditional, static amortization schedule defined by standard term loans.
- Support for repayments and reversals, with the capacity to handle charges and fees via configurable allocation rules.
- Delinquency management features (delinquency buckets and related handling) and the ability to apply fee or penalty charges on a regional basis.
- Full and partial charge adjustments are supported, with the current emphasis on full charge adjustments for initial implementation, and partial adjustments available in alignment with the product rules.
- The actual repayment transaction computes and posts the Actual Amortization (Income) on the payment date and triggers related amortization tracking and revenue recognition steps.
- A two-path LP configuration strategy to support diverse business models:
 1) Revenue-based configuration, storing derived values at the loan account level
 2) Fixed payment amount configuration, where some values are provided and others calculated
 3) A third path for Fix EIR which provides a provided EIR while calculating other fields.
- The system automatically generates and maintains a projected amortization schedule that evolves with approvals, disbursements, and repayments, applying EIR-based income recognition logic and updating deferred income .
- Accounting integration is provided via journal entries driven by transactions, with GL mappings defined at the loan product level and transaction-level GL entries verifying traceability.

## Scope and Deliverables

The new scope delivers a modular Working Capital product and supporting capabilities. The main deliverables include:
- New Product Module and Configuration:
 - A dedicated Working Capital product configuration with UI and API access for creation and management.
 - Core fields include product name, short name, currency, decimal places, and currency multiples, as well as configuration for amortization, NPV day count, and payment allocation.
 - Amortization method configuration with options for EIR or Flat; if Flat is selected, a separate field for the flat percentage is available (though currently not supported in the implementation surface referenced here).
 - Delinquency bucket classification, NPV day count, and payment allocation rules.
- Loan Life Cycle enhancements:
 - Create Loan Account: copy essential configuration from the loan product, with fields allowed to be overridden such as disbursement amount, period payment rate, total payment value, and discount amount.
 - Approve Loan Account: provide overridable values for principal and discount, plus required fields for approval metadata.
 - Disburse Loan Account: support single disbursement, with backdating support, and automatic application of disbursement charges where configured.
 - Reversals: complete reversal support for major transaction types, with linked reversal transactions and replay of subsequent transactions and accounting entries.
- Amortization and Calculations:
 - Two supported amortization methodologies with Declining Amortization (EIR-Based) as the primary path and Flat Amortization as a low-priority option.
 - Projected Amortization Schedule: a per-period dataset containing installment numbers, dates, expected/actual payments, discount factors, NPVs, balances, and related income recognition metrics, designed to be recalculated dynamically as events occur.
 - Dynamic recalculation: amortization schedule recalculation on repayments and adjustments, including backdated processing where supported.
 - Backdated & reprocessing behavior: backdated payments trigger schedule recalculation, balance updates, and replay of subsequent transactions and accounting entries.
- Transaction model and accounting:
 - A complete transaction framework covering monetary and non-monetary transaction types, aligned with term-loan concepts but adapted for WCP. Monetary transactions include Disbursement, Repayment, Discount Fees, Charge Adjustments, Credit Balance Refunds, Goodwill Credits, and Payout Refunds, among others; non-monetary transactions cover adjustments and reversals.
 - Every transaction triggers (or participates in) Journal Entries (JE) per product configuration, with GL mappings defined at the loan product level.
 - Discount fee amortization is tracked as a system-generated, non-monetary transaction for reporting and auditing purposes, without impacting balances; actual accounting entries occur during the creation of discount fees and on repayment through amortization of the deferred income.
- Reporting and data capture:
 - The system stores calculated and stored values at the loan account level (e.g., Period Payment Amount, Total Days, Daily EIR, Calc Annual EIR) for Revenue-based configurations; and analogous values for Fixed and EIR-based configurations.
 - The projected amortization schedule provides visibility into anticipated income recognition, deferred balances, and future amortization lines.

All design choices above reflect the verified reference data and are implemented to cooperate with existing term-loan machinery where standard, while introducing WCP-specific behavior for non-accrual, single-disbursement, EIR-based income recognition, and delinquency handling.

## Architectural and Design Decisions

- Module separation and product configuration
 - The Working Capital loan product is implemented as a separate module with its own product configuration surface, distinct from traditional term loans. This separation allows WCP-specific rules—such as single disbursement, non-accrual accounting, and EIR-based amortization—to be encapsulated without impacting existing loan products.
 - Product configuration is exposed via both UI and API to support internal administration and external integrations.
- Amortization strategy and configuration paths
 - The system supports multiple configuration strategies (LP configurations) to accommodate varying business requirements. The Revenue-based configuration stores derived values (e.g., Period Payment Amount, Total Days, Daily EIR, Calc Annual EIR) along with amortization metadata. The Fixed Payment Amount configuration provides a fixed payment amount (provided) and derives the rest (Total Days, Daily EIR, Annual EIR). The Fix EIR configuration provides a provided Annual EIR while computing other fields. These strategies allows flexible deployment of WCP products while maintaining consistent accounting and reporting semantics.
 - Declining Amortization (EIR-based) is the primary approach for amortization calculation, aligning income recognition with actual cash flows and enabling recalculation in response to repayments and other changes. Flat amortization remains a low-priority option and is not the default path in the current implementation surface.
- Schedule generation and recalculation
 - A Projected Amortization Schedule is generated automatically during loan lifecycle events (creation, approval, disbursement) and recalculated on repayment or other applicable transactions. The schedule records per-period amortization and income recognition data and is updated to reflect the latest cash flows and outstanding balances.
 - Recalculations propagate forward from the current business date, preserving historical amortization entries while recomputing future periods. This verifies historical accuracy and forward-looking consistency.
- Transaction mechanics and accounting integration
 - The transaction model follows a structure similar to term loans, but the WCP surface introduces additional transaction types and constraints (e.g., Discount Fees Amortization as a non-monetary, system-generated transaction used for tracking only). All monetary transactions trigger standard journal entries as defined in the product’s GL mappings, while non-monetary amortization tracking follows the same processing path as related payments.
 - Allocation priorities for repayments and charge-related transactions are configurable at the transaction level and can be defined at the loan product level to verify consistent treatment of principal, fees, and penalties in line with WCP accounting requirements.
- Delinquency, charges, and adjustments
 - Delinquency management includes bucket classification and pause mechanics, as well as a framework for charging and waiving fees in certain regions. Fee and penalty charges are allocated prior to principal in accordance with the WCP rules, and charges can be configured to apply at disbursement or as due-date charges.
 - Discount fee adjustments are supported, including linked adjustments and reprocessing of amortization and balances. Reprocessing recalculates amortization, updates discount balances, and replays subsequent transactions and accounting entries as required. The system emits a business event when a discount fee adjustment transaction is created.
- Reversals and backdating
 - Reversals are supported for major transaction types, producing linked reversal transactions and reversing both the financial impact and the associated accounting entries. Backdated processing is supported for most transaction types, with schedule reprocessing and accounting recalculation to maintain consistency with historical cash flows.
- Data persistence and integrity
 - All derived and stored values required for WCP operation (Period Payment Amount, Total Days, Daily EIR, Calc Annual EIR, etc.) are persisted as part of the loan account data model. The projected amortization schedule is maintained over time with a traceable linkage to repayments and other events for auditability and reporting purposes.

## Calculation and Scheduling Concepts (without embedded numerics)

- Calculation inputs and outputs
 - Core inputs include the total deferred income (discounts/fees), current outstanding balance, repayment cash flows, and the loan term, together with the applicable EIR value for the current configuration. The system uses these inputs to generate the projected amortization schedule and compute the income recognition profile.
 - The amortization schedule records, for each installment, the expected payment amount, discount factor, NPV value, remaining balance, and the net amortization amount, alongside actual payments and any income modification that arises from revised cash flows.
- Schedule structure
 - Each amortization line comprises: Installment Number, Installment Date, Expected Payment Amount, Discount Factor, NPV Value, Balance, Net Amortization Amount, Actual Payment Amount, Actual Amortization Amount, Income Modification, Deferred Balance.
- Backdating and reprocessing rules
 - When backdated payments or adjustments occur, the system recalculates the amortization plan from the affected date forward, replays subsequent transactions, and updates related accounting entries as required by the transaction flow and product rules.

These concepts are reflected in the implemented behavior of the Working Capital module and are designed to verify consistency between projected income recognition, actual cash flows, and the associated accounting consequences.

## Transaction and Processing Semantics

- Monetary and non-monetary transactions follow a common processing path, aligned with term-loan conventions but extended to cover WCP-specific cases. Disbursement, Repayment, Discount Fees, and Charge-related transactions participate in the standard journal entry flow, with a dedicated set of accounting mappings per loan product.
- Discount Fees Amortization is a system-generated, non-monetary transaction intended for tracking and reporting only. It is created in response to qualifying payments and linked to the parent payment transaction. No separate accounting entries are created for this transaction alone; accounting consequences arise from the related payment and the amortization logic.
- Payout Refund, Credit Balance Refund (CBR), Goodwill Credit, and other credit-oriented transactions are supported with standard allocation and recalculation semantics. Reversals create linked reversal transactions and trigger schedule reprocessing as necessary.
- Disbursement can be reversed, with associated schedule and balance adjustments, and re-entry into an approved state if required by the reversal flow.

## Edge Cases and Handling Rules

- Overpayments and refunds
 - Overpayments may trigger a credit balance on the loan account. Credit Balance Refund (CBR) moves funds from the credit balance back to the customer and adjusts loan balances , without triggering a separate amortization recalculation unless the system explicitly requires it due to other events.
- Delinquency and bucket transitions
 - Delinquency buckets classify the delinquency state and influence the application of late charges and related rules. Delinquency pause and range schedule logic are used to model and manage these transitions.
- Prepayment and foreclosures
 - Prepayment or early settlement proceeds follow the same repayment flow as standard repayments, but with payoff computation derived from the current loan state and the payoff date. The system recalculates the payoff amount and adjusts all related balances .
- Charge handling and adjustments
 - Charges can be applied at disbursement or as due-date charges. Charge adjustments are monetary transactions that reduce already paid charges or reallocate amounts according to the configured allocation priority. Backdating of charge adjustments is supported, with reprocessing of balances and the amortization plan.
- Reconciliation and reporting
 - All GL interactions, accounting events, and amortization lines are designed to provide traceable reconciliation and reporting. The loan product level GL mapping verifies consistent accounting posture across all WCP transactions.

## Acceptance Criteria (high level)

- A new Working Capital transaction type Payout Refund is available for WCP loans and behaves similarly to a repayment transaction, including backdating and reversal support.
- The new scope supports zero-interest, non-accrual loans with single disbursement and no traditional term loan schedule, and no monetary transactions after full payoff except permitted adjustments and reversals.
- The system supports both Revenue-based LP configuration and Fixed-payment LP configuration, as well as a Fix-EIR variant, storing and calculating the required fields at the loan-account level as described in the configuration rules.
- The actual repayment transaction computes and posts the Actual Amortization (Income) on the payment date and triggers amortization tracking, with Discount Fees Amortization tracked as a non-monetary, system-generated artifact for reporting purposes.
- A dynamically recalculating projected amortization schedule exists, updated in response to repayments, prepayments, delinquencies, and other eligible events; backdated processing replays subsequent transactions and rebalances the ledger .
- All relevant transactions trigger accounting entries per the product’s GL mappings, with standard handling of charge payments, adjustments, and reversals.

## Diagrams (conceptual)

flowchart TD
 A[Working Capital Product] --> B[Create Loan Account (LP parameters copied)]
 B --> C{Disbursement}
 C --> D[Generate Amortization Schedule (Projected)]
 D --> E[Post-Disbursement Balances & Charges]
 E --> F{Repayment / Adjustments}
 F --> G[Update Amortization Schedule]
 G --> H[Discount Fees Amortization (non-monetary)]
 F --> I[Trigger Journal Entries on Payment]
 I --> J[Accounting Journal Entries]
 H --> K[Reporting & Audit Trail]

stateDiagram-v2
 [*] --> Active
 Active --> Delinquent : Delinquency occurs
 Delinquent --> ChargedOff : Delinquency threshold reached
 ChargedOff --> Recovery : Recovery transaction
 Recovery --> Closed : Close after recovery
 Active --> Overpaid : Overpayment detected
 Overpaid --> Closed : Obligations met or refunded

## Glossary of terms (selected)

- EIR: Effective Interest Rate, the basis for amortizing income over the loan horizon in the declining amortization approach.
- NPVs: Net Present Value values used in the amortization schedule calculations.
- Deferred income: Income that is recognized over time via amortization, not immediately upon receipt.
- Amortization schedule: The projected plan for recognizing income and reducing the balance, recalculated as repayments occur.
- LP configuration: Loan Product configuration strategies that determine how period payments and related fields are stored and calculated.
- Payout Refund (CBR): A specialized WCP transaction to recover disbursed funds when fraud or over-disbursement occurs, potentially leading to overpayment states.
- Discount Fees Amortization: A system-tracked, non-monetary record of deferred income recognition tied to repayments.
- Delinquency buckets: Classifications that represent the aging of arrears and guide delinquency management.

This page presents a consolidated, publication-ready view of the EIR / PPWC new scope, reflecting the verified product behavior and architectural decisions derived from the reference material. It is intended as a technical reference for backend Java engineers, system integrators, and open-source contributors working on the Pepper-Soup working capital initiative. The content focuses on architecture, APIs, algorithms, processing behavior, persistence, accounting, state transitions, and edge cases, with emphasis on verifiable behavior and rules.