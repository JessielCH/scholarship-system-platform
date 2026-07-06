output "vpc_id" {
  value = module.vpc.vpc_id
}

output "alb_dns_name" {
  value = module.alb.alb_dns_name
}

output "bastion_public_ip" {
  value = module.ec2_bastion.public_ip
}

output "core_private_ip" {
  value = module.ec2_core.private_ip
}

output "security_private_ip" {
  value = module.ec2_security.private_ip
}

output "database_private_ip" {
  value = module.ec2_database.private_ip
}

output "broker_private_ip" {
  value = module.ec2_broker.private_ip
}

output "compute_private_ip" {
  value = module.ec2_compute.private_ip
}

output "asg_name" {
  value = module.asg_edge.asg_name
}
