# Loan Originator Details

## About loan originators

A loan originator is the merchant or channel that originated the loan. Attributing loans to an originator supports revenue share and reporting. The Originator ID, also called the Revenue Share ID, is captured at loan level and is available through the Retrieve Loan API association, external business events, and reporting such as Transaction Summary and Trial Balance. The system performs no automatic revenue-share calculations.

## View loan originators

The Loan Originators tab lists the originators attached to the loan so you can see which merchant or channel originated it.

1. Select **Institution** > **Clients** and open the client.
2. Under **Loan Accounts**, select the loan account.
3. Open the **Buy Down Fees** tab.

The screen shows each originator's ID, external ID, name, status, originator type, and channel type, or an empty state when no originators are attached.

## Attach an originator to a loan

Use this screen to link a loan originator to a loan so that loan income can be attributed to that merchant or channel for revenue share and reporting.

1. Select **Institution** > **Clients** and open the client.
2. Under **Loan Accounts**, select the loan account.
3. Open the **Loan Account Actions** menu (the ☰ button next to the account name).
4. Select **Attach Loan Originator**.
5. Enter the details described below, then select **Submit**.

| Field | Required | Description |
| --- | --- | --- |
| Loan Originator | No | Enter the Originator ID, which represents the merchant or channel that originated the loan. |

The originator is attached to the loan.

## Enter loan originator details

Use this screen to record the merchant or channel that originated the loan so loan income can be attributed to that originator for revenue share and reporting.

1. Select **Institution** > **Clients** and open the client.
2. Open the client actions menu (the ☰ button next to the client name) and select **Applications** > **New Loan Account**.
3. Select **DETAILS**.
4. Set the fields described below, then select **Next** to continue through the form and save it at the end.

| Field | Required | Description |
| --- | --- | --- |
| External id | No | Enter the Originator ID, also called the Revenue Share ID, used for reporting and revenue sharing. |
| Loan Originator | No | Select the loan originator, which represents the merchant or channel that originated the loan. |

The Originator ID is stored as metadata at the loan level and becomes available for reporting, including the Transaction Summary and Trial Balance reports.

## Originator registry

The Originator Registry manages partner records, including external ID, type, channel type, and status. You can associate originators with loans, detach them, and query originators for a loan.

## Originator fields and validation

Originator details require an external ID, which must be unique. The system validates originator_external_id uniqueness and checks that any originator type and channel type codes you provide exist. If you do not provide a status, the system sets it to ACTIVE. No additional logic, validation, or transformations apply to the Originator ID field.

## Module availability

The loan origination module is optional. It is unavailable when disabled, and not all Fineract users use it.

Enable or disable the module with this setting:

- fineract.module.loan-origination.enabled in application.properties controls whether the fineract-loan-origination module is enabled or disabled.
- The default value is false.

## Creating originators

You create loan originators at organization level under Organization > Manage Loan Originators. Originators can be created, viewed, updated, and deleted through the UI or API.

When creating or editing an originator, these fields apply:

- Name, External Id, and Status are mandatory.
- Originator Type and Channel Type are optional.

Added originators appear in a data grid that you can search by Name or External Id.

> **Note:** Originator endpoints require CREATE_LOAN_ORIGINATOR, UPDATE_LOAN_ORIGINATOR, DELETE_LOAN_ORIGINATOR, or READ_LOAN_ORIGINATOR permissions.

## Originator ID on loans

It is stored as metadata at the loan level and may be null or absent for loans not originated by large merchants. You can provide originator details during loan creation, and the system accepts and stores the Originator ID.

## Attaching originators to loans

You can attach originators to a loan only while the loan is created but not yet approved. Once approved, originators cannot be added or removed. Multiple originators can be attached to a single loan, but the same originator cannot be added twice.

To attach an originator, provide these mandatory details:

- Loan id.
- Originator id.
- Only originators with ACTIVE status can be attached.

| Originator entry | Effect |
| --- | --- |
| Id provided | The existing originator is attached to the loan. |
| external ID provided | An existing originator is matched by external ID to avoid duplicates. |

## Detaching originators from loans

You can detach an originator from a loan before the loan is approved.

The API supports these operations:

- Add an originator to a loan.
- Remove an originator from a loan.

## Creating originators during loan application

When you enter an external ID during loan application, the system attaches an existing originator to the loan or creates a new originator entry, depending on global configuration. Originator creation during loan application is disabled by default.

## Originator entry fields during loan creation

The originators field supports external ID, ID, name, type ID, and channel type ID. All other originator fields are optional. Incoming values are validated, and the originator is attached to the loan.

Optional fields behave as follows:

- name is an optional string and creates a new entry if the external ID does not already exist.
- ChannelTypeId is an optional code value ID and creates a new entry if the external ID does not already exist.

## Viewing originators on a loan

Originator details appear when you retrieve a loan with associations. If no originator entries exist for the loan, the originators list is empty. If loan origination functionality is not enabled, the originators field is omitted from the response.

## Multiple originators per loan

Each originator keeps its own row, and their external ids are combined into one string.

## Reporting

The Merchant Originator ID appears in the Trial Summary Report and the Trial Balance Report.

## UI on loan details view

The Originators tab on the loan details view lists the loan originators attached to a loan.

You can:

- Add or remove originators from a loan that is created but not approved.
- See an empty state when no originators are attached.

The UI:

- Enforces required fields on originator forms.
- Displays validation messages on originator forms.
- Hides or disables attach and detach options for approved loans.
