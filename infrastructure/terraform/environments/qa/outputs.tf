output "test_ec2_public_ip" {
  description = "Public IP of the test EC2 instance"
  value       = module.test_ec2.public_ip
}
