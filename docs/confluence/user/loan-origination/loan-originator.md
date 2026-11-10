# Loan Originator Details

## Loan Originator Details

### Originator ID and revenue share attribution

The Originator ID identifies the merchant or channel that originated a loan and is stored as metadata at the loan level. It may be null for loans not originated by large merchants, and no transformations or validation logic are applied beyond basic existence checks when using the registry model. The system accepts and stores the ID during loan creation and persists it in the database.

The Originator ID is available through the following channels:

- Retrieve a Loan API response payload.
- External business events.
- Reporting, including Transaction Summary and Trial Balance.

The model supports multiple originators per loan because the API and event field is a list. Originator External ID is the Originator ID or revenue share ID used for reporting and sharing, and there are no automatic revenue-share calculations.

### Originator registry and configuration

The Originator Registry manages partner records including external ID, type, channel type, and status. Basic properties of the loan origination must be stored, and originator entities are conditionally created based on fineract.module.loan-origination.enabled being true. The loan origination function is optional and not necessarily used by all Fineract users.

Originator type codes and channel type codes are system defined.

- Originator type codes are MERCHAT, BROKER, AFFILIATE, and PLATFORM.
- Channel type codes are ONLINE, IN_STORE, API, and AGGREGATOR.

Originator records follow these rules.

- External ID is mandatory and must be unique.
- Status defaults to ACTIVE if not provided.
- Id or external ID is mandatory for an originator entry.
- Provided code values must be valid if applicable.
- Code values must exist for originator type and channel type when provided.

Originator attachment and creation behave as follows.

- When Id is provided, the existing originator is attached to the loan.
- When External ID is provided, a new entry is created if not existing based on configuration and attached to the loan.
- The rest of the originator fields are optional and a new entry is created if not existing.

Configuration controls the optional loan origination module.

- The fineract-loan-origination module can be enabled or disabled via application.properties using fineract.module.loan-origination.enabled, defaulting to false.
- A global configuration entry enables creating an originator on the fly, defaulting to false.

The loan origination module is optional and is implemented as an optional module with optional schema and optional event/report extensions. The architecture supports attaching, detaching, and querying originators for a loan. Originator external ID uniqueness is validated.

A new global configuration parameter controls whether an originator can be created during loan application. Global configuration enable_originator_creation_during_loan_application defaults to false.

The feature is configurable via application.properties with fineract.module.loan-origination.enabled=false as the default value.

### Originator lifecycle management

You can create, view, update, and delete loan originators at organization level through the UI or API. Duplicate originator external IDs are rejected.

Originator forms enforce required fields and show validation messages.

- Name, External Id, and Status are mandatory.
- Originator Type and Channel Type are optional.
- Added originators appear in a searchable data grid by Name and External Id.

### Attaching and detaching originators from loans

You can attach and detach originators only while a loan is created but not yet approved. After approval, attach and detach operations are blocked. Multiple originators can be attached to a single loan.

The following rules apply to attach and detach operations:

- Loan ID and originator ID are mandatory.
- Only ACTIVE status originators can be attached to a loan.
- An originator cannot be added twice to the same loan.
- An originator cannot be removed twice from the same loan.

The system returns the following HTTP status codes:

- HTTP 400 if a required parameter is missing or incorrect data format is provided.
- HTTP 403 for duplication related errors or if functionality is not enabled.
- HTTP 404 if the targeted loan or originator does not exist.

Attach and detach endpoints require the following permissions:

- ATTACH_LOAN_ORIGINATOR
- DETACH_LOAN_ORIGINATOR

Originator creation during loan application works as follows:

- An originator can be created and attached inline during loan application when config is enabled.
- An existing originator is matched by external ID during inline creation, preventing duplicates.

### Loan details and API responses

Loan originator details show which originators are linked to a loan and how they are returned through the API. The loan id or external id must exist when fetching these details, and the caller needs READ_LOAN permission.

The API behaves as follows:

- If the targeted loan does not exist, the system returns HTTP 404.
- If no originator entries exist for a loan, the returned originators list is empty.
- If loan origination functionality is not enabled, the originators field is omitted from the loan details response.
- When retrieving a loan with associations, originator details are returned and partner details are fetched when originators or all associations are provided.
- In POST /loans, an originators array entry with an id attaches an existing originator; an entry with an external id attaches an existing originator or creates a new entry based on global configuration; name, type and channel type are optional and used to create a new entry if the external id does not exist yet.

### Originator API endpoints and security

Originator API endpoints are secured with permissions that control who can create, update, read, attach, detach, and delete originators.

The API returns the following status codes for request problems:

- HTTP 400 when a required parameter is missing or the data format is incorrect.
- HTTP 403 for duplication-related errors, functionality that is not enabled, or removal attempted on an already mapped originator.
- HTTP 404 when provided values do not exist.

Specific endpoints return these status codes:

- POST /loan-originators returns HTTP 400 for missing or incorrectly formatted required parameters, HTTP 403 for duplication-related errors, and HTTP 404 when the originator type or channel type does not exist.
- PUT /loan-originators returns HTTP 400 for missing or incorrectly formatted required parameters, HTTP 403 for duplication-related errors, and HTTP 404 when the originator type or channel type does not exist.
- DELETE /loan-originators returns HTTP 404 when the targeted originator does not exist.
- POST /loans/_{loan id}_/originators/... returns HTTP 404 when the targeted loan or originator does not exist.
- DELETE /loans/_{loan id}_/originators/... returns HTTP 404 when the targeted loan or originator does not exist.

### Reporting and revenue share purpose

Reporting attributes loan income and revenue to a loan originator such as a merchant, broker, affiliate, platform or channel so revenue share can be calculated and shared. The MerchantOriginator ID appears in the Transaction Summary Report and Trial Balance Report, and multiple originator external ids attached to a loan are concatenated into one string while keeping one row per entry. The feature is unavailable when the loan origination module is disabled, though originator details can still be provided during loan creation.

### UI screens and navigation

The loan details view includes an Originators tab that lists attached loan originators when any are attached and shows an empty state when none are attached. You can add or remove an originator only while a loan is created but not yet approved; attach and detach options are hidden or disabled for approved loans.

The Originators tab screen shows the following columns:

- Id
- External Id
- Name
- Status
- Originator Type
- Channel Type
- Actions

The Originators tab screen includes the following button:

- Delete

The attach originator screen includes the following field and buttons:

- Loan Originator
- Cancel
- Submit

1. Open the loan account and choose "Buy Down Fees" from the tabs.
2. Open the Create Loans Account screen and choose "DETAILS" from the stepper.

The loans account details step screen includes the following fields:

- Product Name
- Submitted on (required)
- Disbursement on (required)
- External id
- Loan Originator
- Loan officer
- Loan Purpose
- Fund
- Link savings
- Create standing instructions at disbursement

The loans account details step screen includes the following buttons:

- Previous
- Next
- Cancel

The loans account details step screen shows the following text:

- Savings Linkage
- Product Type
- Short Name
- Currency

### Worked examples

A loan officer creates a merchant originator with external ID best-merchant-us-east and attaches it to a new term loan while the loan is still created but not yet approved. The figures are illustrative: a principal of 1,000, an annual interest rate of 12%, two monthly installments, and 30-day months. The originator ID is stored at loan level and is returned with the loan details. The table shows the repayment schedule for that loan.

| Installment | Due date | Opening balance | Interest | Principal paid | Closing balance |
| --- | --- | --- | --- | --- | --- |
| 1 | 30 days | 1,000.00 | 10.00 | 497.51 | 502.49 |
| 2 | 60 days | 502.49 | 5.02 | 502.49 | 0.00 |
| Total | - | - | 15.02 | 1,000.00 | - |

The same loan is set up with three monthly installments instead of two, while the merchant originator remains attached. Extending the term to three installments spreads the principal over more payments and increases total interest from 15.02 to 20.07. The originator ID continues to appear in the loan details and reports.

| Installment | Due date | Opening balance | Interest | Principal paid | Closing balance |
| --- | --- | --- | --- | --- | --- |
| 1 | 30 days | 1,000.00 | 10.00 | 330.02 | 669.98 |
| 2 | 60 days | 669.98 | 6.70 | 333.32 | 336.66 |
| 3 | 90 days | 336.66 | 3.37 | 336.66 | 0.00 |
| Total | - | - | 20.07 | 1,000.00 | - |
