variable "identifier" {
  type        = string
  description = "RDS instance identifier and prefix for child resources (subnet group, parameter group, SG)."
}

variable "vpc_id" {
  type        = string
  description = "VPC ID the DB subnet group and SG live in."
}

variable "vpc_cidr_block" {
  type        = string
  description = "VPC CIDR. Used for the SG ingress rule allowing MySQL from anywhere inside the VPC."
}

variable "private_subnet_ids" {
  type        = list(string)
  description = "Private subnet IDs (need >=2 across AZs even when multi_az is false — RDS requires the subnet group to span 2 AZs)."
}

variable "engine_version" {
  type        = string
  description = "MySQL engine version. Run `aws rds describe-db-engine-versions --engine mysql` to list available versions."
}

variable "parameter_group_family" {
  type        = string
  description = "RDS parameter group family. Must match the engine major.minor (e.g. mysql8.4)."
}

variable "instance_class" {
  type    = string
  default = "db.t4g.micro"
}

variable "allocated_storage" {
  type    = number
  default = 20
}

variable "database_name" {
  type        = string
  description = "Initial database name created on the instance."
}

variable "username" {
  type        = string
  description = "Master username (avoid reserved names like 'admin' or 'root')."
  default     = "app_user"
}

variable "multi_az" {
  type    = bool
  default = false
}

variable "deletion_protection" {
  type    = bool
  default = false
}

variable "skip_final_snapshot" {
  type    = bool
  default = true
}

variable "backup_retention_period" {
  type    = number
  default = 7
}

variable "backup_window" {
  type        = string
  default     = "17:00-18:00"
  description = "UTC. Default = 02:00-03:00 JST."
}

variable "maintenance_window" {
  type    = string
  default = "Sun:18:00-Sun:19:00"
}
