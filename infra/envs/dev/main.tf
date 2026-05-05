provider "aws" {
  region = var.region

  default_tags {
    tags = {
      Project     = "readingbook-management"
      ManagedBy   = "terraform"
      Environment = var.environment
    }
  }
}

locals {
  name_prefix = "${var.project}-${var.environment}"
}

module "vpc" {
  source = "../../modules/vpc"

  name                 = local.name_prefix
  vpc_cidr             = var.vpc_cidr
  availability_zones   = var.availability_zones
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
  enable_nat_gateway   = var.enable_nat_gateway
}

module "rds" {
  source = "../../modules/rds"

  identifier              = local.name_prefix
  vpc_id                  = module.vpc.vpc_id
  vpc_cidr_block          = module.vpc.vpc_cidr_block
  private_subnet_ids      = module.vpc.private_subnet_ids
  engine_version          = var.db_engine_version
  parameter_group_family  = var.db_parameter_group_family
  instance_class          = var.db_instance_class
  allocated_storage       = var.db_allocated_storage
  database_name           = var.db_name
  username                = var.db_username
  multi_az                = var.db_multi_az
  deletion_protection     = var.db_deletion_protection
  skip_final_snapshot     = var.db_skip_final_snapshot
  backup_retention_period = var.db_backup_retention_period
}
