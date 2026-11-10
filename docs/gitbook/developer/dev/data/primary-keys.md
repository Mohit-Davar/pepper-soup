# Primary Key Generation

## Primary Key Generation

Primary key generation controls how the system assigns identifiers to records before they are persisted. DB-enforced auto-increment keys require a flush or commit because the database generates the ID only at that point, while Snowflake-style BIGINT IDs are generated at the application level and are available immediately in memory.

DB-enforced auto-increment primary keys create several drawbacks:

- They complicate batching, caching, and testability and cause issues around multiple flushes per transaction.
- Code often performs additional flushes just to obtain generated IDs, introducing unnecessary round-trips and slowing down persistence at scale.
- Sequential IDs are trivially guessable, which can pose a security and privacy concern when exposed via APIs.
- Relying solely on DB-generated sequences ties identity generation to persistence, reducing flexibility for service decomposition, replication, or multi-tenant setups.

Snowflake-style BIGINT IDs use application-level ID generation with a 64-bit ID containing timestamp, machine ID, and sequence:

- They are available immediately in memory with no flush required.
- They are globally unique across instances.
- They are roughly time-ordered, which helps with debugging and querying.
- They remove guessability of plain sequential IDs.
- They remain compact BIGINT values for indexing and joins.
- No migration is needed for Snowflake-style IDs.

Snowflake-style IDs have the following requirements and trade-offs:

- They require a generator implementation and clock synchronization safeguards.
- They are less human-friendly than sequential integers.
