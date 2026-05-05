output "endpoint" {
  value = aws_db_instance.this.address
}

output "port" {
  value = aws_db_instance.this.port
}

output "database_name" {
  value = aws_db_instance.this.db_name
}

output "username" {
  value = aws_db_instance.this.username
}

output "master_password_parameter_name" {
  value       = aws_ssm_parameter.master_password.name
  description = "SSM Parameter Store path holding the master password as SecureString."
}

output "security_group_id" {
  value = aws_security_group.db.id
}
