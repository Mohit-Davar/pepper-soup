# Journal Entry Aggregation

## Journal Entry Aggregation

Journal Entry Aggregation pre-bakes journal entry data so reports can use aggregated tables instead of aggregating journal entries every day. When a job has not yet been executed, reports must perform a null check on aggregated tables. The Trial Balance Report uses the pre-baked Journal Entry Aggregation Summary table.

The post_snapshot_delta_data query applies the following filters:

- It includes only journal entries where entity_type_enum equals 1 and manual_entry is false.
- It includes entries where the latest aggregated_date is null or submitted_on_date is later than the latest aggregated_date.
- It includes entries where submitted_on_date is earlier than endDate.
- It includes entries where office_id equals officeId.

The summary_snapshot_baseline_data query applies the following filters and grouping:

- It uses ags.aggregated_on_date instead of ags.submitted_on_date.
- It includes only entries where ags.entity_type_enum equals 1 and ags.manual_entry is false.
- It includes entries where ags.aggregated_on_date is less than or equal to the latest aggregated_date.
- It includes entries where ags.office_id equals officeId.
- It groups results by productname, glcode, glname, and assetowner.
