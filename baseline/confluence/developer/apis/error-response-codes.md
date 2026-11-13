# Error Response Codes

The API returns standard HTTP status codes to show whether a request succeeded or failed, with a response body that explains the failure when one occurs.

Error response codes by situation:

| Situation | HTTP status | Response |
| --- | --- | --- |
| Issue caused by business logic | 403 | FAIL plus reason |
| External id already exists | 403 | FAIL plus reason |
| Duplication related error | 403 | FAIL plus reason |
| Functionality not enabled | 403 | FAIL plus reason |
| Removal attempted when the originator is already mapped | 403 | FAIL plus reason |
| TransactionId not for the loan (transaction reversal, chargeback, undo loan charge transaction, fetch loan details) | 404 | Not specified |
| Targeted loan does not exist | 404 | Not specified |
| POST /loan-originators missing required parameter or incorrect data format | 400 | Not specified |
