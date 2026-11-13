# Transaction Summary Report

The Transaction Summary Report lists interest transactions, including interest accrual, interest posted, interest waiver, and interest refund. For loans with asset ownership changes, it reports monetary transactions under the applicable ownership and records the asset sale transaction under the other owner. The applicable ownership is null (PayPal) ownership for an asset sale on an active loan with no active ownership record, and current ownership for an asset buyback on an active loan with an active ownership record or on a FRAUD loan with no active ownership record.

| Scenario | Monetary transactions reported under | Asset sale transaction reported under |
| --- | --- | --- |
| Asset sale on an active loan with no active ownership record | null (PayPal) ownership | new owner |
| Asset sale on an active loan with previous inactive ownership records and no active ownership record | null (PayPal) ownership | new owner |
| Asset buyback on an active loan with an active ownership record | current ownership | null (PayPal) owner |
| Asset buyback on a FRAUD loan with no active ownership record | current ownership | null (PayPal) owner |
