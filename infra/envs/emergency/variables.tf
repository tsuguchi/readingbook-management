variable "project" {
  type    = string
  default = "readingbook"
}

variable "environment" {
  type    = string
  default = "emergency"
}

variable "region" {
  type    = string
  default = "ap-northeast-1"
}

variable "vpc_cidr" {
  type    = string
  default = "10.1.0.0/16"
}

variable "availability_zones" {
  type    = list(string)
  default = ["ap-northeast-1a", "ap-northeast-1c"]
}

variable "public_subnet_cidrs" {
  type    = list(string)
  default = ["10.1.0.0/24", "10.1.1.0/24"]
}

variable "private_subnet_cidrs" {
  type    = list(string)
  default = ["10.1.10.0/24", "10.1.11.0/24"]
}

variable "instance_type" {
  type    = string
  default = "t3.medium"
}

variable "git_repo_url" {
  type    = string
  default = "https://github.com/tsuguchi/readingbook-management.git"
}

variable "git_branch" {
  type    = string
  default = "develop"
}
