variable "name" {
  type        = string
  description = "Name prefix used for the VPC and its child resources."
}

variable "vpc_cidr" {
  type        = string
  description = "CIDR block for the VPC."
}

variable "availability_zones" {
  type        = list(string)
  description = "AZs to spread subnets across. Must align positionally with the subnet CIDR lists."
}

variable "public_subnet_cidrs" {
  type        = list(string)
  description = "Public subnet CIDRs, one per AZ."
}

variable "private_subnet_cidrs" {
  type        = list(string)
  description = "Private subnet CIDRs, one per AZ."
}

variable "enable_nat_gateway" {
  type        = bool
  default     = false
  description = "If true, create a single NAT gateway in the first public subnet so private subnets can reach the internet. Costs ~$32/mo + data — leave off until ECS or other private workloads need outbound access."
}
