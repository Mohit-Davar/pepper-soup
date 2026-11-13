# Environment Provisioning

## Identity and access management automation

Identity and access management automation pushes identity information from the mini IDM to AWS IAM and EKS. A Google Sheet provides the audit trail, and AWS lambdas apply changes automatically.

Automation rules:

- Changes from the mini IDM to AWS IAM must not remove accounts until the automation behavior is proven, and every action must be logged.
- Automation from the mini IDM to EKS modifies aws-auth configmaps based on Google Sheet updates or IAM changes.
- A lambda can subscribe to IAM group membership changes to trigger Kubernetes updates.

## Configurable ECR Docker repository

The Helm chart uses one ECR URL for all Docker images, independent of the environment. You can configure this URL so the partner can point images at a different repository.

The configurable ECR Docker repository parameters meet these acceptance criteria:

- The parameter is available in the shared repository.
- The environment builds as before with no hard-coded ECR repository reference in Terraform.

## Configurable load balancer placement

Load balancer placement is configurable as internal or internet-facing. The Helm chart supports only internet-facing load balancers. Configurable load-balancer network placement is available in the shared repo.

## Cross-region availability

Cross-region availability applies to the RDS component and the ActiveMQ component, and both options are available in the shared repo.

## EKS module requirements

The EKS module provisions an EKS cluster with Helm bridging, Kubernetes addons, and EKS addons. Its Terraform code must be cleaned up from secrets, customizable for specific partners, shared with the partner, and upgraded to a version supported beyond 2023-10-30.

> **Note:** The partner needs a solution to synchronize secrets from AWS Secrets Manager to EKS Kubernetes secrets for sensitive configuration variables.

## Resource naming and tagging

Every AWS resource created as part of the managed platform uses the name structure <partner>-<business_name>-<environment>. All resources also carry fixed tags for ownership, management, clients, cost allocation, project, environment type, and data type. These requirements apply to all Terraform code.

Required tags on every resource:

| Tag | Value |
| --- | --- |
| owner | alluvial |
| manager | alluvial |
| clients | ["alluvial"] |
| cost_allocation_method | owner |
| project | alluvial-managed-platform |
| environment_type | prod |
| data_type | prod |

## Jumpbox key management

A Jenkins job removes all SSL keys from the jumpboxes and distributes an accessing user's key to all jumpboxes. Jenkins job access is limited.

## Amazon MQ setup and usage

Amazon MQ is created and configured by a Terraform module and deployed on a managed platform. Spring Batch jobs, such as the close of business job, use the new MQ for partitioning. Events are transmitted successfully.

The following setup steps apply:

- An admin user must be created for Amazon MQ.
- A read-only user must be created for Amazon MQ.
- The headless users must have groups.
- The admin port must be opened.
- Changes are added to Terraform in the shared repo.
- New AWS accounts are created by Terraform.

## Independent schema and application deployment

You can deploy new Fineract database schema versions and new Fineract application versions independently of each other.

To deploy independently, follow this order:

- Run an independent Fineract instance that performs the Liquibase migrations and then exits without starting Fineract itself.
- Run the actual deployment starting the new Fineract instances with the new software versions, but with Liquibase disabled.

Set the configuration parameter spring.liquibase.exit-after-migration via an environment variable to stop the Fineract startup process after the Liquibase migration. The process exit code then reflects the success state of the Liquibase migration.

## RDS read-only IAM user

Create an Aurora PostgreSQL RDS read-only user with IAM authentication and authorisation. The user can connect only with an IAM user, can access only the given database, and can run only SELECT statements.

## Data source pool sizing

You can override the data source initial pool size and maximum pool size depending on the type of instance you are running. Pool size can be set via environment variable.
