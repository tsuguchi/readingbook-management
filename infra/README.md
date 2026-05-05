# infra/

Terraform code for AWS resources backing readingbook-management.

## Layout

```
infra/
├── bootstrap/        # one-time: creates the S3 bucket that holds Terraform state for everything else
├── envs/
│   └── dev/          # the dev environment (VPC + RDS for now)
└── modules/
    ├── vpc/          # VPC, subnets, IGW, optional NAT gateway
    └── rds/          # RDS for MySQL + parameter group + master password in SSM
```

State backend: S3 with native lockfile (`use_lockfile = true`, requires Terraform >= 1.10). No DynamoDB.

## Prerequisites

- Terraform >= 1.10
- AWS CLI authenticated (`aws sts get-caller-identity` succeeds)
- The IAM principal needs permissions to create VPC, RDS, S3, SSM, and IAM resources used by the modules above

## First-time setup (bootstrap)

The `bootstrap/` workspace creates the state bucket itself, so it uses **local state**. After it's applied once you don't need to touch it again unless the bucket configuration changes.

```sh
cd infra/bootstrap
terraform init
terraform apply
```

The created bucket is named `readingbook-tf-state-<account-id>`.

## Per-environment apply

```sh
cd infra/envs/dev
terraform init
terraform plan
terraform apply
```

`backend.tf` already points at the bootstrap bucket. The first `terraform init` will configure the S3 backend.

## Retrieving the RDS master password

```sh
aws ssm get-parameter \
  --name /readingbook-dev/db/master_password \
  --with-decryption \
  --query 'Parameter.Value' \
  --output text
```

The DB endpoint is in `terraform output rds_endpoint`.

## Connecting to RDS from your laptop

The DB is in private subnets without a public IP. To connect:

- **SSM Session Manager port forwarding** via a small EC2 instance with the SSM agent (recommended, no inbound SG needed)
- or temporarily attach an EC2 in the same VPC and tunnel through it

We'll add the bastion/SSM piece in a follow-up once it's needed.

## Cost notes

- NAT Gateway is the most expensive single resource here. `enable_nat_gateway` defaults to `false` — flip it on only when ECS/private workloads need outbound internet
- `db.t4g.micro` + 20 GB gp3 + 7-day backups is the cheapest viable RDS config and is Free Tier eligible for the first 12 months on a new account
