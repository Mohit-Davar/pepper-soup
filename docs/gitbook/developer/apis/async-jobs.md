# Asynchronous Jobs

The SendAsynchronous Job processes COB events before start-of-day events, prioritizing events by business date. It marks events from TO_BE_SENT to SENT using parallel commits.

Message size limits and replay behavior:

- ActiveMQ message size is 100KB.
- A BulkMessage that could exceed 100KB for a large Loan with many revert-replay transactions is split into multiple messages.
- Replay and reprocessing includes chronological reprocessing and re-applying transactions according to their submitted date during reverse-replay.
