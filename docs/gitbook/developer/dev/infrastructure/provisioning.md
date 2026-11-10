# Environment Provisioning

## Environment Provisioning

### One-click environment provisioning

One-click environment provisioning sets up an environment with a single button push. Account creation follows compliant practices such as audit logging, and the Mifos environment builds up as it did before.

### AWS account creation and security setup

Terraform creates new AWS accounts. CloudTrail and encryption setup are required, and you must log everything.

> **Note:** Do not perform destructive actions such as account removal from AWS IAM until you are confident with automation behavior.

### EKS module customization and sharing

The EKS module terraform code includes Helm bridging, Kubernetes addons, and EKS addons. It is cleaned up from secrets, customized for specific partners, and shared with the partner.

### Resource naming and tagging standards

Resource names use the <partner>-<business_name>-<environment> structure, and every resource carries a fixed set of tags. These requirements apply to all Terraform code. All resources carry the owner, manager, clients, cost_allocation_method, project, environment_type, and data_type tags. The owner, manager, project, environment_type, and data_type tags use the value "alluvial" or "alluvial-managed-platform" or "prod" as shown below; the clients tag uses the list [ "alluvial" ].

| Tag | Value |
| --- | --- |
| owner | "alluvial" |
| manager | "alluvial" |
| clients | [ "alluvial" ] |
| cost_allocation_method | "owner" |
| project | "alluvial-managed-platform" |
| environment_type | "prod" |
| data_type | "prod" |

### Jump box SSH key management

Manual setup of jump boxes is enough for SSH key management. Jenkins jobs distribute and remove keys on the jumpboxes, with access limited to specific users. Each job serves a different role.

The following rules govern jump box SSH key management:

- Manual setup of jump boxes is enough for SSH key management.
- A Jenkins job removes all SSL keys from the jumpboxes.
- A Jenkins job distributes an accessing user's key to all the jumpboxes.
- Jenkins job access is limited.
- The distributer job is for developers.
- The deletion job is for a dedicated user.

### Amazon MQ deployment and usage

Amazon MQ runs on a managed platform and is created and configured by a Terraform module. The system uses it for event transmission and for Spring Batch partitioning, including the CoB job. Events can be read through a message consumer, and CoB runs successfully using MQ.

### AMQ user accounts and access

AMQ user accounts include an admin user and a read-only user, both created as headless users and assigned groups. The admin port must be opened for access.

### Terraform configuration in shared repo

Terraform configuration lives in the shared repo and contains no hard-coded reference to the ECR repo; the ECR URL is configurable. Changes are added to Terraform in the shared repo, and the Terraform module itself is available there. Configuration must be available in the shared repo, and cross-region availability is required for the component.

The Helm chart supports the following configuration:

- Placement of the load balancer (internal or internet-facing) is configurable.
- A solution synchronizes secrets from AWS Secrets Manager to EKS Kubernetes secrets for sensitive configuration variables.

### Fineract schema migration deployment

A Fineract administrator can deploy new database schema versions independently from running the Fineract service. The deployment runs an independent Fineract instance that performs Liquibase migrations and then exits without starting Fineract itself.

The same approach can start new Fineract instances with new software versions while Liquibase remains disabled.

Set the configuration parameter using an environment variable to control startup behaviour after migration:

- spring.liquibase.exit-after-migration stops the Fineract startup process after Liquibase migration completes.
- The process exit code reflects the success state of the Liquibase migration when this parameter is set.

### Aurora PostgreSQL IAM read-only user setup

Aurora PostgreSQL supports read-only users with IAM authentication and authorisation. You can connect with an IAM user whose access is limited to a given database and who can execute only SELECT statements. A small test database is available for this setup.

The setup also covers connection pooling and environment management.

- Data source initial_pool_size and max pool size can be overridden depending on the type of instance being run.
- Pool size can be set via environment variable.
- You can shut down a POC environment.
- The EKS cluster can be upgraded to a version supported beyond 2023-10-30, and upgrade instructions can be shared with the client.

> **Note:** A Confluence page summarises the setup so anyone can recreate the database and user and test it.

### Development and performance environment pipelines

Development environments deploy from OpenMF, while performance environments deploy and scale through BaasFlow Jenkins. Cucumber tests run on the baasflow platform and BaasFlow Jenkins starts them.

The following rules apply to development and performance environment pipelines:

- Every Jenkins job used for development has been migrated.
- BaasFlow Jenkins starts performance tests.
- A Lambda subscribed to IAM group membership changes sounds feasible.
- Guardrails modules are implemented in layer 1 Terraform as described in https://mifosforge.jira.com/browse/.
- ECR is a parameter in Terraform so it can be used in any environment.
- The current Helm chart uses the same ECR URL for all Docker images, independent from the environment.
- The current Helm chart supports only internet-facing load-balancers.
- Identity and access management is automated based on a Google Sheet first, providing an audit trail and amendable via AWS Lambdas.
- Current initial data is loaded to the sheet with data of existing users.

### Worked examples

A batch environment runs 150 worker pods against an Aurora PostgreSQL instance that allows 5,000 connections. Each pod uses a data source with a configurable minimum pool size and a maximum pool size of 100. The figures are illustrative.

| Scenario | Min pool size per pod | Worker pods | Worker connections | Headroom |
| --- | --- | --- | --- | --- |
| Default | 20 | 150 | 3000.00 | 2000.00 |
| Override | 5 | 150 | 750.00 | 4250.00 |

Changing the minimum pool size from 20 to 5 reduces worker connections from 3,000.00 to 750.00 and raises headroom from 2,000.00 to 4,250.00.

In addition to batch workers, the environment runs read/write pods that open 500 connections. The instance limit remains 5,000 connections.

| Source | Connections |
| --- | --- |
| Batch workers (min pool 20) | 3000.00 |
| Read/write pods | 500.00 |
| Total demand | 3500.00 |
| Instance limit | 5000.00 |
| Headroom | 1500.00 |

Total demand of 3,500.00 stays below the 5,000-connection limit, leaving 1,500.00 connections of headroom.
