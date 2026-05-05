output "public_ip" {
  value = aws_eip.web.public_ip
}

output "public_dns" {
  value = aws_instance.web.public_dns
}

output "app_url_http" {
  value = "http://${aws_eip.web.public_ip}"
}

output "app_url_with_port" {
  value = "http://${aws_eip.web.public_ip}:3001"
}

output "ssm_session_command" {
  value = "aws ssm start-session --target ${aws_instance.web.id}"
}

output "instance_id" {
  value = aws_instance.web.id
}
