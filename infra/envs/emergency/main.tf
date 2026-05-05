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
  enable_nat_gateway   = false
}

data "aws_ami" "al2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023*-x86_64"]
  }

  filter {
    name   = "architecture"
    values = ["x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  filter {
    name   = "state"
    values = ["available"]
  }
}

resource "aws_iam_role" "ec2" {
  name = "${local.name_prefix}-ec2"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ssm_core" {
  role       = aws_iam_role.ec2.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "ec2" {
  name = "${local.name_prefix}-ec2"
  role = aws_iam_role.ec2.name
}

resource "aws_security_group" "web" {
  name        = "${local.name_prefix}-web"
  description = "HTTP access for the demo deployment"
  vpc_id      = module.vpc.vpc_id

  tags = {
    Name = "${local.name_prefix}-web"
  }
}

resource "aws_vpc_security_group_ingress_rule" "http" {
  security_group_id = aws_security_group.web.id
  description       = "HTTP from anywhere"
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "tcp"
  from_port         = 80
  to_port           = 80
}

resource "aws_vpc_security_group_ingress_rule" "frontend_alt" {
  security_group_id = aws_security_group.web.id
  description       = "Frontend alt port (Next.js direct)"
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "tcp"
  from_port         = 3001
  to_port           = 3001
}

resource "aws_vpc_security_group_ingress_rule" "backend_direct" {
  security_group_id = aws_security_group.web.id
  description       = "Backend direct port for debugging"
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "tcp"
  from_port         = 3000
  to_port           = 3000
}

resource "aws_vpc_security_group_egress_rule" "all_outbound" {
  security_group_id = aws_security_group.web.id
  description       = "All outbound"
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
}

resource "aws_eip" "web" {
  domain = "vpc"

  tags = {
    Name = "${local.name_prefix}-web"
  }
}

resource "aws_instance" "web" {
  ami                    = data.aws_ami.al2023.id
  instance_type          = var.instance_type
  subnet_id              = module.vpc.public_subnet_ids[0]
  vpc_security_group_ids = [aws_security_group.web.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2.name

  associate_public_ip_address = true

  metadata_options {
    http_tokens   = "required"
    http_endpoint = "enabled"
  }

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
    encrypted   = true
  }

  user_data_replace_on_change = true

  user_data = <<-EOT
    #!/bin/bash
    set -eux
    exec > >(tee /var/log/user-data.log) 2>&1

    dnf update -y
    dnf install -y docker git
    systemctl enable --now docker
    usermod -aG docker ec2-user

    # Docker Compose plugin
    DOCKER_CONFIG=/usr/local/lib/docker
    mkdir -p $DOCKER_CONFIG/cli-plugins
    curl -SL https://github.com/docker/compose/releases/download/v2.29.7/docker-compose-linux-x86_64 \
      -o $DOCKER_CONFIG/cli-plugins/docker-compose
    chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose

    # Get IMDSv2 token + public IPv4
    TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" \
      -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")
    PUBLIC_IP=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN" \
      http://169.254.169.254/latest/meta-data/public-ipv4)

    cd /home/ec2-user
    git clone -b ${var.git_branch} ${var.git_repo_url} app
    chown -R ec2-user:ec2-user app
    cd app

    # Generate a random root password (used by the in-container MySQL only)
    DB_PASS=$(openssl rand -hex 24)
    cat > .env <<ENV
    MYSQL_ROOT_PASSWORD=$DB_PASS
    MYSQL_DATABASE=readingbook_production
    CORS_ALLOWED_ORIGINS=http://$PUBLIC_IP,http://$PUBLIC_IP:3001
    ENV

    # Override to publish frontend on port 80
    cat > docker-compose.override.yml <<COMPOSE
    services:
      frontend:
        ports:
          - "80:3000"
          - "3001:3000"
    COMPOSE

    # Start everything (compose plugin is auto-discovered under /usr/local/lib/docker/cli-plugins)
    docker compose up -d --build

    # Wait until backend is up enough to accept exec commands.
    for i in $(seq 1 30); do
      if docker compose exec -T backend bundle --version >/dev/null 2>&1; then
        break
      fi
      sleep 10
    done

    # Initialize the database schema and seed data (idempotent enough for fresh boot)
    docker compose exec -T backend bundle exec rails db:create db:schema:load db:seed || true

    echo "user-data finished at $(date -Is)" >> /var/log/user-data.log
  EOT

  tags = {
    Name = "${local.name_prefix}-web"
  }
}

resource "aws_eip_association" "web" {
  instance_id   = aws_instance.web.id
  allocation_id = aws_eip.web.id
}
