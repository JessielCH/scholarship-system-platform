module "vpc" {
  source = "../../modules/vpc"

  environment          = "prod"
  vpc_cidr             = "10.3.0.0/16"
  public_subnet_cidrs  = ["10.3.1.0/24", "10.3.2.0/24"]
  private_subnet_cidrs = ["10.3.11.0/24", "10.3.12.0/24"]
  availability_zones   = ["us-east-1a", "us-east-1b"]
}

module "security_groups" {
  source      = "../../modules/security_groups"
  environment = "prod"
  vpc_id      = module.vpc.vpc_id
}

locals {
  docker_install_script = <<-EOF
    #!/bin/bash
    apt-get update -y
    apt-get install -y docker.io docker-compose
    systemctl start docker
    systemctl enable docker
    usermod -aG docker ubuntu
  EOF
}

module "ec2_edge" {
  source             = "../../modules/ec2"
  environment        = "prod"
  service_name       = "edge"
  subnet_id          = module.vpc.public_subnet_ids[0]
  security_group_ids = [module.security_groups.edge_sg_id]
  instance_type      = "t2.micro"
  user_data          = local.docker_install_script
}

module "ec2_core" {
  source             = "../../modules/ec2"
  environment        = "prod"
  service_name       = "core"
  subnet_id          = module.vpc.private_subnet_ids[0]
  security_group_ids = [module.security_groups.core_sg_id]
  instance_type      = "t2.micro"
  user_data          = local.docker_install_script
}

module "ec2_security" {
  source             = "../../modules/ec2"
  environment        = "prod"
  service_name       = "security"
  subnet_id          = module.vpc.private_subnet_ids[0]
  security_group_ids = [module.security_groups.security_sg_id]
  instance_type      = "t2.micro"
  user_data          = local.docker_install_script
}

module "ec2_compute" {
  source             = "../../modules/ec2"
  environment        = "prod"
  service_name       = "compute"
  subnet_id          = module.vpc.private_subnet_ids[0]
  security_group_ids = [module.security_groups.compute_sg_id]
  instance_type      = "t2.micro" # Changed from t3.small to avoid Academy limits
  user_data          = local.docker_install_script
}

module "ec2_database" {
  source             = "../../modules/ec2"
  environment        = "prod"
  service_name       = "database"
  subnet_id          = module.vpc.private_subnet_ids[0]
  security_group_ids = [module.security_groups.database_sg_id]
  instance_type      = "t2.micro"
  user_data          = local.docker_install_script
}
