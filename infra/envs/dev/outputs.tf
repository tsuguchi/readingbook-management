output "vpc_id" {
  value = module.vpc.vpc_id
}

output "public_subnet_ids" {
  value = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  value = module.vpc.private_subnet_ids
}

output "rds_endpoint" {
  value = module.rds.endpoint
}

output "rds_port" {
  value = module.rds.port
}

output "rds_database_name" {
  value = module.rds.database_name
}

output "rds_username" {
  value = module.rds.username
}

output "rds_master_password_parameter_name" {
  value       = module.rds.master_password_parameter_name
  description = "Use `aws ssm get-parameter --name <this> --with-decryption` to retrieve the password."
}
