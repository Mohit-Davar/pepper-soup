<!-- Labels: developer, libraries -->
# Deprecate OkHttp and migrate to Apache HTTP client

This page documents the strategic deprecation of the OkHttp-based HTTP client used by the Fineract client generation flow and its migration to Apache HttpClient. The change is motivated by the need for reliable connection lifecycle management in long-running server applications, particularly the ability to configure and honor connection maxAge to avoid issues with stale or long-lived connections. Retrofit-based integration tests remain available, while exploration continues into whether FEIGN would offer a better integration approach.

## Overview and rationale

The current client generation pathway previously relies on OkHttp as the HTTP client for generated Fineract clients. While OkHttp satisfies functional needs, its lack of built-in, explicit connection lifecycle management in terms of connection maxAge can lead to long-lived connections that become stale. Apache HttpClient provides built-in connection lifecycle management, including support for connection maxAge, which helps verify connections are refreshed and kept within sensible lifespans. This property makes Apache HttpClient a more reliable choice for long-running server applications.

In addition to the core HTTP client replacement, there is consideration of alternative HTTP client strategies. The reference notes raise the question of whether FEIGN could be a better option in the future, though a definitive decision is not yet established. For backward compatibility in testing, Retrofit remains available for integration tests.

## Technical scope and affected areas

- Affected components and services:
 - Client generation workflow that currently emits clients built to use OkHttp.
 - Runtime HTTP client configuration and the HTTP client factory used by generated clients.
 - Supporting integration test setup that currently relies on Retrofit.
- Scope of change:
 - Replace the OkHttp-based HTTP client usage with Apache HttpClient in the generated clients and related runtime wiring.
 - Introduce or adjust configuration to uses Apache HttpClient’s connection lifecycle features, notably connection maxAge.
 - Preserve Retrofit-based integration tests during migration, with ongoing evaluation of FEIGN as a potential alternative later.

## What changes in behavior and structure to expect

- HTTP client implementation:
 - The underlying HTTP client used by generated Fineract clients will transition from OkHttp to Apache HttpClient.
 - Apache HttpClient’s connection lifecycle management (including support for connection maxAge) will govern how long connections are kept alive and when they are refreshed, reducing the risk of stale connections in long-running processes.
- Backward compatibility considerations:
 - Retrofit remains available for integration tests to verify compatibility with existing test scenarios during the migration window.
 - The reference notes indicate that FEIGN is under investigation as a potential alternative; no decision has been recorded as of this description.

## Migration considerations and guidance

- Dependency and build changes: Replace OkHttp dependencies with Apache HttpClient in the client generation and runtime modules. verify the HTTP client factory and any related builders are updated to instantiate Apache HttpClient instances.
- Configuration exposure: Expose configuration knobs for connection maxAge and related lifecycle properties , so operators can tune behavior in production scenarios.
- Testing strategy: Maintain Retrofit-based integration tests to exercise the generated clients during the migration. Plan for eventual validation of any alternative integration approaches (e.g., FEIGN) if pursued.
- API surface: The documentation does not indicate changes to external REST endpoints or the public API surface of the generated clients beyond the internal HTTP client implementation. No endpoint changes are implied by the migration notes.

## Architectural view

The following diagram illustrates the migration flow from the existing OkHttp-based path to the Apache HttpClient-based path, with Retrofit test usage remaining during the transition and FEIGN evaluation as a future consideration.

```mermaid
flowchart TD
 A[Client generation] --> B[OkHttp (current, deprecated)]
 B --> C[Apache HttpClient (target)]
 D[Retrofit-based integration tests] --> E[Test stability during migration]
 F[FEIGN investigation] --> G[Future evaluation path]
```

## Summary of verified points

- OkHttp is deprecated as the HTTP client for generated Fineract clients in favor of Apache HttpClient.
- Apache HttpClient provides built-in connection lifecycle management, including support for connection maxAge, mitigating issues with stale or long-lived connections common in long-running services.
- OkHttp does not provide built-in connection maxAge capability and requires custom workarounds in scenarios involving long-lived connections.
- Retrofit remains available for integration tests to preserve backward compatibility during the migration window.
- FEIGN is identified as an area for investigation to determine whether it could offer a more suitable integration approach in the future.

This page captures the verified scope and rationale from the current reference direction and outlines the migration considerations and expectations for the transition from OkHttp to Apache HttpClient. Further concrete changes to code, APIs, tests, and configuration will be documented as they are implemented and validated.