module "vpc" {
  source = "../../modules/vpc"

  environment          = "staging"
  vpc_cidr             = "10.4.0.0/16"
  public_subnet_cidrs  = ["10.4.1.0/24", "10.4.2.0/24"]
  private_subnet_cidrs = ["10.4.11.0/24", "10.4.12.0/24"]
  availability_zones   = ["us-east-1a", "us-east-1b"]
}

module "security_groups" {
  source      = "../../modules/security_groups"
  environment = "staging"
  vpc_id      = module.vpc.vpc_id
}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
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

module "ec2_bastion" {
  source             = "../../modules/ec2"
  environment        = "staging"
  service_name       = "bastion"
  subnet_id          = module.vpc.public_subnet_ids[0]
  security_group_ids = [module.security_groups.bastion_sg_id]
  instance_type      = "t2.micro"
  user_data          = ""
  allocate_eip       = true
}

module "alb" {
  source          = "../../modules/alb"
  environment     = "staging"
  vpc_id          = module.vpc.vpc_id
  subnets         = module.vpc.public_subnet_ids
  security_groups = [module.security_groups.alb_sg_id]
}

module "asg_edge" {
  source              = "../../modules/asg"
  environment         = "staging"
  ami_id              = data.aws_ami.ubuntu.id
  instance_type       = "t3.medium"
  user_data           = local.docker_install_script
  subnet_ids          = module.vpc.private_subnet_ids
  security_group_ids  = [module.security_groups.edge_sg_id]
  target_group_arns   = [module.alb.api_target_group_arn, module.alb.frontend_target_group_arn]
  min_size            = 1
  max_size            = 3
  desired_capacity    = 2
  associate_public_ip = false
  key_name            = "vockey"
}


module "ec2_database" {
  source             = "../../modules/ec2"
  environment        = "staging"
  service_name       = "database"
  subnet_id          = module.vpc.private_subnet_ids[0]
  security_group_ids = [module.security_groups.database_sg_id]
  instance_type      = "t3.small"
  user_data          = local.docker_install_script
}

module "ec2_broker" {
  source             = "../../modules/ec2"
  environment        = "staging"
  service_name       = "broker"
  subnet_id          = module.vpc.private_subnet_ids[0]
  security_group_ids = [module.security_groups.broker_sg_id]
  instance_type      = "t3.small"
  user_data          = local.docker_install_script
}

data "aws_caller_identity" "current" {}

resource "aws_s3_bucket" "documents" {
  bucket        = "uce-distribuida-staging-documents-${data.aws_caller_identity.current.account_id}"
  force_destroy = true

  tags = {
    Environment = "staging"
    Purpose     = "Encrypted Documents Storage"
  }
}

output "documents_bucket_name" {
  value = aws_s3_bucket.documents.id
}
