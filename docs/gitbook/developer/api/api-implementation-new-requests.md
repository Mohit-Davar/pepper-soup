# API implementation - new requests

This page documents the API surface changes introduced to support interest-bearing loan products as described in the reference specifications. It covers the modified loan retrieval and creation endpoints, new and revised transaction flows (including interest-related waivers and refunds), and the planning context for schedule calculation without database dependencies. The content reflects verified behaviors and field-level changes as specified; where the reference describes design options or future work, those items are noted as such without asserting implemented behavior beyond what is confirmed here.

### Scope and affected components

- Loan APIs: changes to loan retrieval responses (GET by id and by external id) and loan creation (POST /loans) to surface additional fields used by interest-bearing products. 
- Interest management endpoints: a new API surface to control interest calculations (stop, restart, reduce), with associated events. 
- Interest-related transactions: new and revised transaction endpoints for interest payment waivers and interest refunds/reversals, including event publishing semantics. 
- Scheduling calculation: a planning direction to provide a dependency-free loan schedule generator, with multiple options for integration, described below.

> The following sections enumerate the verified fields and endpoints, their intended behavior, and the downstream impact on results such as loan schedules, accrued interest, and related accounting. Exact request payload shapes for some management operations are described with the available references; where an endpoint is brand-new or its payload is not fully specified in the reference, the behavior is described at a high level.

### Data model and field changes at loan endpoints

New and renamed fields appear in loan retrieval responses (GET by loanId and GET by external-id). The table below shows the field names as surfaced by the API, their types, purpose, and notes. Some fields map to existing internal values (renamings are noted).

<div class="param-grid" style="border:1px solid #ddd;border-radius:4px;padding:8px 12px;max-width:100%;overflow:auto;">
 <div class="param-card" style="display:inline-block;min-width:260px;margin:6px 6px 6px 0;border:1px solid #e5e5e5;border-radius:6px;padding:8px;">
 <span class="param-label" style="font-weight:600">Field</span>
 <br/>
 <span class="param-value" style="font-family:monospace">norminal_interest_rate</span>
 </div>
 <div class="param-card" style="display:inline-block;min-width:260px;margin:6px 6px 6px 0;border:1px solid #e5e5e5;border-radius:6px;padding:8px;">
 <span class="param-label" style="font-weight:600">Type</span>
 <br/>
 <span class="param-value" style="font-family:monospace">String</span>
 </div>
 <div class="param-card" style="display:inline-block;min-width:360px;margin:6px 6px 6px 0;border:1px solid #e5e5e5;border-radius:6px;padding:8px;">
 <span class="param-label" style="font-weight:600">Description</span>
 <br/>
 <span class="param-value" style="font-family:monospace">The interest rate to verify total interest paid does not exceed that of APR. It is an existing field mirrored as part of the per-period interest rate surface.</span>
 </div>
 <div class="param-card" style="display:inline-block;min-width:260px;margin:6px 6px 6px 0;border:1px solid #e5e5e5;border-radius:6px;padding:8px;">
 <span class="param-label" style="font-weight:600">Notes</span>
 <br/>
 <span class="param-value" style="font-family:monospace">It corresponds to the existing interestRatePerPeriod in the implementation.</span>
 </div>
</div>

<table>
 <tr><th>Field</th><th>Type</th><th>Description</th><th>Notes</th></tr>
 <tr><td>total_unpaid_accrual_activity_interest → totalUnpaidAccruedDueInterest</td><td>BigDecimal</td><td>The total unpaid posted interest amount on the loan (or total unpaid accrual activity created on the loan so far).</td><td></td></tr>
 <tr><td>total_unpaid_accrued_interest → totalUnpaidAccruedNotDueInterest</td><td>BigDecimal</td><td>The total unpaid accrued interest amount calculated from the last non-monthly interest activity posting date and not yet posted on the billing period.</td><td></td></tr>
 <tr><td>total_interest</td><td>BigDecimal</td><td>The total interest on the loan including paid, unpaid and projected.</td><td>Already existing: summary.interestCharged and repaymentSchedule.totalInterestCharged</td></tr>
 <tr><td>delinquent_interest → delinquentInterest</td><td>BigDecimal</td><td>The delinquent amount with interest portion.</td><td>Future balance types (fee, penalty, principal) may be added to delinquency balances.</td></tr>
 <tr><td>total_interest_refund → totalInterestRefund</td><td>BigDecimal</td><td>The total refund amount when an external party (merchant/external system) initiates the disbursement refund (not reversed).</td><td></td></tr>
 <tr><td>total_payment_waiver → totalInterestPaymentWaiver</td><td>BigDecimal</td><td>The total interest payment waiver amount when an external system initiates the waiver (not reversed).</td><td></td></tr>
</table>

> Mapping note: total_interest continues to reflect the aggregate interest surface used by existing components (e.g., summary.interestCharged and repaymentSchedule.totalInterestCharged). The renamed fields follows a broader surface for unpaid and accrued interest, and for refunds/waivers related to interest.

> , the new fields appear in both GET by loanId and GET by external-id loan responses to verify parity for integrations relying on external identifiers.

### API surface changes in detail

#### Get Loan by ID and Get Loan by External ID

- Endpoints (verified changes):
 - GET /fineract-provider/api/v1/loans/{loanId}
 - GET /fineract-provider/api/v1/loans/external-id/{externalloanId}

- Payload and response changes:
 - The loan response now includes the fields described above, including the renamed fields for unpaid accrual and accrued not-due interest, total interest, delinquent interest, and related refund/waiver tallies.
 - The nominal interest rate surface (norminal_interest_rate) remains tied to the existing interestRatePerPeriod field.

#### POST - Create Loan

- Endpoint: POST /fineract-provider/api/v1/loans
- New/modified fields in the request payload:
 - nominal interest rate → Already existing: interestRatePerPeriod (no separate request field name change; surface updated to surface the field in the response as norminal_interest_rate).
 - enableDownpayment: boolean
 - Purpose: Indicates whether the product is treated as a downpayment loan or not under the same product constraints.
 - numberOfRepayments: integer
 - downPaymentAmountPercentage: decimal

- Behavior notes:
 - The enableDownpayment flag is used to decide dynamically the loan classification for downpayment scenarios. The additional fields permit dynamic configuration of repayment terms and downpayment behavior on loan creation.

#### POST - Manage Interest

- Brand-new API surface dedicated to controlling interest calculations. The reference describes capabilities to:
 - Stop interest calculations
 - Restart interest calculations
 - Reduce interest calculations

- The exact endpoint URIs and payload shapes are not specified in this documentation (the reference describes the capability and intent). When available, integrations should expect a request that conveys the targeted operation (stop, restart, or reduce) and will result in associated state changes on the loan’s interest calculation process.

- Events: An Account Changed event is published to reflect a new interest rate when changes occur.

#### POST - Create Interest Payment Waiver

- Endpoints (brand-new):
 - /fineract-provider/api/v1/loans/{loanId}/transactions?command=paymentwaiver
 - /fineract-provider/api/v1/loans/external-id/{externalloanId}/transactions?command=paymentwaiver

- Payload fields (example):
 - transactionAmount: BigDecimal
 - transactionDate: String (date form)

- Events: A transaction changed event with type PAYMENT_WAIVER is published as part of the real-time API call.

#### POST - Create Interest Payment Waiver Reversal

- Endpoints (brand-new):
 - /fineract-provider/api/v1/loans/{loanId}/transactions/{transactionId}
 - /fineract-provider/api/v1/loans/external-id/{externalLoanId}/transactions/external-id/{transactionExternalId}

- Payload fields (example):
 - transactionAmount: BigDecimal
 - transactionDate: String (date form)

- Events: A transaction changed event with type PAYMENT_WAIVER_REVERSAL is published as part of the real-time API call.

#### POST - Disbursement Refund (merchant issued and payout refund)

- Context: The existing merchant issued and payout refund APIs are augmented to post the interest refund within the same API call path.
- Behavior: On successful disbursement refund, an INTEREST_REFUND transaction is posted (as part of the same API execution).
- Events: A transaction changed event with type MERCHANT_ISSUED_REFUND or PAYOUT_REFUND and an INTEREST_REFUND event are published as part of the real-time API call.

#### POST - Disbursement Refund Reversal (merchant issued and payout refund reversal)

- Context: The existing refund reversal APIs are augmented to reverse the associated interest refund within the same API call path.
- Events: Transaction changed events with type MERCHANT_ISSUED_REFUND_REVERSAL or PAYOUT_REFUND_REVERSAL and INTEREST_REFUND_REVERSAL are published as part of the real-time API call.

#### Change in calculateLoanSchedule

As part of the interest-bearing product program, there is a design intent to provide a library that can generate a repayment schedule independent of any database. The reference outlines three options:

1) An in-house solution that mirrors the Fineract implementation and could be deployed on-premises.
2) A standalone Fineract library that can be incorporated as a dependency to generate loan schedules.
3) A deployment model where the Offers domain exposes a direct call to the schedule generator, restricted to calculateLoanSchedule functionality.

No verified implementation details are provided in this document. The scheduling capability is described as a library development or integration effort, with the goal of producing deterministic repayment schedules without relying on database state.

### Field and API impact summary

- GET loan by ID and GET loan by external-id surfaces now include the additional fields described above for interest-bearing state, including renamed unpaid and accrued interest fields, total interest, delinquency, and related refunds/waivers tallies.
- POST create loan accepts new surface controls for downpayment behavior (enableDownpayment) and terms (numberOfRepayments, downPaymentAmountPercentage) while reusing the existing nominal interest rate field (as norminal_interest_rate in the surfaced view).
- New APIs and endpoints for managing interest calculations, interest payment waivers, and interest refunds/reversals are introduced, with associated real-time transaction-change events.
- Disbursement refund APIs are extended to post interest refunds within the same operation, and reversals follow the same pattern for all related refund events.
- A future-facing scheduling library concept is described to allows calculation of loan repayment schedules without DB dependencies; the exact implementation approach remains to be confirmed.

### Example scenarios and payloads (high level)

- Creating a loan with downpayment support:
 - Request (conceptual): POST /fineract-provider/api/v1/loans with payload including enableDownpayment = true, numberOfRepayments = 6, downPaymentAmountPercentage = 20.0, and the existing interestRatePerPeriod surface.
 - Expected surface in response: norminal_interest_rate reflects the configured nominal rate; the response includes new fields for total unpaid accruals, total interest, and delinquent interest as described above.

- Issuing an interest payment waiver via external system (e.g., PayPal integration):
 - Request: POST /fineract-provider/api/v1/loans/{loanId}/transactions?command=paymentwaiver with fields including transactionAmount and transactionDate.
 - Result: A PAYMENT_WAIVER event is emitted for the transaction and the loan’s interest surface is updated .

- Processing a disbursement refund that includes interest refund:
 - Request: disbursement refund API that now also posts an INTEREST_REFUND transaction.
 - Result: A MERCHANT_ISSUED_REFUND or PAYOUT_REFUND event and an INTEREST_REFUND event are emitted to reflect the refund and its interrelated accounting impact.

### Notes on implementation and references

- The fields and endpoints described here come from the verified changes documented in the API change surface for interest-bearing products. Where the reference discusses design options or future work, this page presents those items as described in the source, without asserting a confirmed implementation path.
- The nominal interest rate field surface (norminal_interest_rate) is surface-mapped to the existing interestRatePerPeriod field in the implementation. The described field naming in responses should be interpreted as a surfaced alias for compatibility with the enhanced loan surface.
- The calculateLoanSchedule change represents a verified planning direction; the exact integration path and library surface are still subject to implementation decisions and migrations. This page documents the intent and the options outlined in the reference rather than a committed code path.

### Terminology and conventions

- Interest-bearing product: a loan product that surfaces and tracks interest with explicit unpaid accruals, accrued not-yet-due interest, and related refunds/waivers as separate surfaced totals.
- Transaction change events: real-time notifications emitted following transaction state changes (e.g., PAYMENT_WAIVER, PAYMENT_WAIVER_REVERSAL, INTEREST_REFUND, INTEREST_REFUND_REVERSAL).
- External identifiers: APIs expose both loanId and external-loanId variants for integration with external systems; responses for both include the same extended field surface.

This page captures the verified technical scope and surface changes required to support the new interest-bearing loan functionality. It provides the foundation for downstream integration, data shaping, and scheduling behavior that depend on these API changes.