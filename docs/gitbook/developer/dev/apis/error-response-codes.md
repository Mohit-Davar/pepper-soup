# Error Response Codes

## Error Response Codes

The server responds with HTTP 403 when an issue is caused by business logic instead of HTTP 503.

The chargeback error response includes the following fields:

- developerMessage "Loan transaction:691 chargeback not allowed as loan product is interest recalculation enabled"
- defaultUserMessage "Loan transaction:691 chargeback not allowed as loan product is interest recalculation enabled"
- userMessageGlobalisationCode "error.msg.loan.chargeback.operation.not.allowed"
- parameterName "id"
- args value 691

An unknown action value returns HTTP 403 with the following message:

- xyz action is not supported

The server returns HTTP 503 for the chargeback request with the following messages:

- developerMessage "The server is currently unable to handle the request, please try after some time."
- defaultUserMessage "The server is currently unable to handle the request, please try after some time."
