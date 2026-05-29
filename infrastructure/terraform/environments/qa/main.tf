module "vpc" {
  source = "../../modules/vpc"

  environment          = "qa"
  vpc_cidr             = "10.2.0.0/16"
  public_subnet_cidrs  = ["10.2.1.0/24"]
  private_subnet_cidrs = ["10.2.11.0/24"]
  availability_zones   = ["us-east-1a"]
}

module "ec2_qa" {
  source = "../../modules/ec2"

  environment   = "qa"
  service_name  = "qa-server"
  vpc_id        = module.vpc.vpc_id
  subnet_id     = module.vpc.public_subnet_ids[0]
  instance_type = "t2.micro"
  key_name      = "vockey"
}
