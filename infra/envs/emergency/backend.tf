terraform {
  backend "s3" {
    bucket       = "readingbook-tf-state-315826383203"
    key          = "envs/emergency/terraform.tfstate"
    region       = "ap-northeast-1"
    encrypt      = true
    use_lockfile = true
  }
}
