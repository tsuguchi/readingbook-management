terraform {
  backend "s3" {
    bucket       = "readingbook-tf-state-315826383203"
    key          = "envs/dev/terraform.tfstate"
    region       = "ap-northeast-1"
    encrypt      = true
    use_lockfile = true
  }
}
