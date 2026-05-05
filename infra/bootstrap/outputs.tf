output "tf_state_bucket" {
  value       = aws_s3_bucket.tf_state.id
  description = "Name of the S3 bucket holding Terraform state for this project."
}

output "region" {
  value       = var.region
  description = "Region the state bucket lives in."
}
