# Financial Year-End

Fineract does not have an automated financial year-end process. You manually calculate profit and loss for the financial year and post it as a manual journal entry.

A financial year-end review starts with the trial balance summary. The figures in this example are illustrative. Suppose the ledger holds three accounts at 31 December: Fee Income with a beginning balance of -800.00, no debit movement, and a credit movement of -400.00; Interest Expense with a beginning balance of 0.00, a debit movement of 500.00, and no credit movement; and Loans Receivable with a beginning balance of 10,000.00, a debit movement of 2,000.00, and no credit movement. The ending balance of each account equals its beginning balance plus debit movement plus credit movement.

| Account | Type | Beginning | Debit | Credit | Ending |
| --- | --- | --- | --- | --- | --- |
| Fee Income | Income | -800.00 | 0.00 | -400.00 | -1,200.00 |
| Interest Expense | Expense | 0.00 | 500.00 | 0.00 | 500.00 |
| Loans Receivable | Asset | 10,000.00 | 2,000.00 | 0.00 | 12,000.00 |
| Total |  | 9,200.00 | 2,500.00 | -400.00 | 11,300.00 |

The example shows that only income and expense accounts are closed at year-end, while asset accounts such as Loans Receivable carry forward.

Because Fineract has no automated financial year-end process, the user posts the calculated profit or loss as a manual journal entry. Using the profit of 700.00 from the trial balance above, the entry closes the income and expense accounts directly to Retained Earnings.

| Account | Debit | Credit |
| --- | --- | --- |
| Fee Income | 1,200.00 |  |
| Interest Expense |  | 500.00 |
| Retained Earnings |  | 700.00 |
| Total | 1,200.00 | 1,200.00 |

The example shows how a profit is removed from the income and expense accounts and added to Retained Earnings; a loss would reverse the signs.

See also: [Investor Module](../assets-investors/investor-module.md).
