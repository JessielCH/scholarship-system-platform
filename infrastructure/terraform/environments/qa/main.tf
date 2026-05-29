module "vpc" {
  source = "../../modules/vpc"

  environment          = "qa"
  vpc_cidr             = "10.0.0.0/16"
  public_subnet_cidrs  = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnet_cidrs = ["10.0.11.0/24", "10.0.12.0/24"]
  availability_zones   = ["us-east-1a", "us-east-1b"]
}

resource "aws_security_group" "ec2_basic" {
  name        = "qa-ec2-basic-sg"
  description = "Allow SSH and ICMP for testing"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description = "SSH from anywhere"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "ICMP from anywhere"
    from_port   = -1
    to_port     = -1
    protocol    = "icmp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "qa-ec2-basic-sg"
    Environment = "qa"
  }
}

module "test_ec2" {
  source = "../../modules/ec2"

  environment        = "qa"
  name               = "test-node"
  subnet_id          = module.vpc.public_subnet_ids[0]
  security_group_ids = [aws_security_group.ec2_basic.id]
  # instance_type and key_name usan valores por defecto (t2.micro y vockey)
}
