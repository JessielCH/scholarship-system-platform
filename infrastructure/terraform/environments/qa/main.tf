module "vpc" {
  source = "../../modules/vpc"

  environment          = "qa"
  vpc_cidr             = "10.2.0.0/16"
  public_subnet_cidrs  = ["10.2.1.0/24", "10.2.2.0/24"]
  private_subnet_cidrs = ["10.2.11.0/24", "10.2.12.0/24"]
  availability_zones   = ["us-east-1a", "us-east-1b"]
}

module "security_groups" {
  source      = "../../modules/security_groups"
  environment = "qa"
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
  environment        = "qa"
  service_name       = "edge"
  subnet_id          = module.vpc.public_subnet_ids[0]
  security_group_ids = [module.security_groups.edge_sg_id]
  instance_type      = "t2.micro"
  user_data          = local.docker_install_script
  allocate_eip       = true
}

module "ec2_core" {
  source             = "../../modules/ec2"
  environment        = "qa"
  service_name       = "core"
  subnet_id          = module.vpc.private_subnet_ids[0]
  security_group_ids = [module.security_groups.core_sg_id]
  instance_type      = "t2.micro"
  user_data          = local.docker_install_script
}

module "ec2_security" {
  source             = "../../modules/ec2"
  environment        = "qa"
  service_name       = "security"
  subnet_id          = module.vpc.private_subnet_ids[0]
  security_group_ids = [module.security_groups.security_sg_id]
  instance_type      = "t2.micro"
  user_data          = local.docker_install_script
}

module "ec2_compute" {
  source             = "../../modules/ec2"
  environment        = "qa"
  service_name       = "compute"
  subnet_id          = module.vpc.private_subnet_ids[0]
  security_group_ids = [module.security_groups.compute_sg_id]
  instance_type      = "t2.micro" # Changed from t3.small to avoid Academy limits
  user_data          = local.docker_install_script
}

module "ec2_database" {
  source             = "../../modules/ec2"
  environment        = "qa"
  service_name       = "database"
  subnet_id          = module.vpc.private_subnet_ids[0]
  security_group_ids = [module.security_groups.database_sg_id]
  instance_type      = "t2.micro"
  user_data          = local.docker_install_script
}

module "ec2_broker" {
  source             = "../../modules/ec2"
  environment        = "qa"
  service_name       = "broker"
  subnet_id          = module.vpc.private_subnet_ids[0]
  security_group_ids = [module.security_groups.broker_sg_id]
  instance_type      = "t2.micro"
  user_data          = local.docker_install_script
}

module "ec2_intelligence" {
  source             = "../../modules/ec2"
  environment        = "qa"
  service_name       = "intelligence"
  subnet_id          = module.vpc.private_subnet_ids[0]
  security_group_ids = [module.security_groups.intelligence_sg_id]
  instance_type      = "t2.micro"
  user_data          = local.docker_install_script
}

data "aws_caller_identity" "current" {}

resource "aws_s3_bucket" "database_backups" {
  bucket        = "uce-distribuida-qa-database-backups-${data.aws_caller_identity.current.account_id}"
  force_destroy = true

  tags = {
    Environment = "qa"
    Purpose     = "Database Backups"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "database_backups_lifecycle" {
  bucket = aws_s3_bucket.database_backups.id

  rule {
    id     = "retention-15-days"
    status = "Enabled"

    filter {
      prefix = ""
    }

    expiration {
      days = 15
    }
  }
}


resource "aws_s3_bucket" "documents" {
  bucket        = "uce-distribuida-qa-documents-${data.aws_caller_identity.current.account_id}"
  force_destroy = true

  tags = {
    Environment = "qa"
    Purpose     = "Encrypted Documents Storage"
  }
}

output "documents_bucket_name" {
  value = aws_s3_bucket.documents.id
}
