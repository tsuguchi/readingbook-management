resource "random_password" "master" {
  length           = 32
  special          = true
  override_special = "_!@$%^*-=+"
}

resource "aws_ssm_parameter" "master_password" {
  name        = "/${var.identifier}/db/master_password"
  description = "Master password for RDS instance ${var.identifier}"
  type        = "SecureString"
  value       = random_password.master.result

  tags = {
    Name = "${var.identifier}-master-password"
  }
}

resource "aws_db_subnet_group" "this" {
  name       = var.identifier
  subnet_ids = var.private_subnet_ids

  tags = {
    Name = var.identifier
  }
}

resource "aws_security_group" "db" {
  name        = "${var.identifier}-db"
  description = "MySQL access for ${var.identifier}"
  vpc_id      = var.vpc_id

  tags = {
    Name = "${var.identifier}-db"
  }
}

resource "aws_vpc_security_group_ingress_rule" "mysql_from_vpc" {
  security_group_id = aws_security_group.db.id
  description       = "MySQL from within the VPC"
  cidr_ipv4         = var.vpc_cidr_block
  ip_protocol       = "tcp"
  from_port         = 3306
  to_port           = 3306
}

resource "aws_vpc_security_group_egress_rule" "all_outbound" {
  security_group_id = aws_security_group.db.id
  description       = "All outbound"
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
}

resource "aws_db_parameter_group" "this" {
  name        = "${var.identifier}-mysql"
  family      = var.parameter_group_family
  description = "Custom parameters for ${var.identifier}"

  parameter {
    name  = "character_set_server"
    value = "utf8mb4"
  }

  parameter {
    name  = "collation_server"
    value = "utf8mb4_unicode_ci"
  }

  parameter {
    name  = "time_zone"
    value = "Asia/Tokyo"
  }
}

resource "aws_db_instance" "this" {
  identifier     = var.identifier
  engine         = "mysql"
  engine_version = var.engine_version
  instance_class = var.instance_class

  allocated_storage     = var.allocated_storage
  max_allocated_storage = var.allocated_storage * 5
  storage_type          = "gp3"
  storage_encrypted     = true

  db_name  = var.database_name
  username = var.username
  password = random_password.master.result
  port     = 3306

  db_subnet_group_name   = aws_db_subnet_group.this.name
  vpc_security_group_ids = [aws_security_group.db.id]
  parameter_group_name   = aws_db_parameter_group.this.name

  multi_az            = var.multi_az
  publicly_accessible = false

  backup_retention_period = var.backup_retention_period
  backup_window           = var.backup_window
  maintenance_window      = var.maintenance_window

  deletion_protection       = var.deletion_protection
  skip_final_snapshot       = var.skip_final_snapshot
  final_snapshot_identifier = var.skip_final_snapshot ? null : "${var.identifier}-final"

  apply_immediately          = false
  auto_minor_version_upgrade = true

  performance_insights_enabled = false
}
