module "vpc" {
  source = "../../modules/vpc"

  environment          = "dev"
  vpc_cidr             = "10.1.0.0/16"
  public_subnet_cidrs  = ["10.1.1.0/24"]
  private_subnet_cidrs = ["10.1.11.0/24"]
  availability_zones   = ["us-east-1a"]
}

module "ec2_test" {
  source = "../../modules/ec2"

  environment   = "dev"
  service_name  = "test-server"
  vpc_id        = module.vpc.vpc_id
  subnet_id     = module.vpc.public_subnet_ids[0]
  instance_type = "t2.micro"
  key_name      = "vockey" # Clave SSH por defecto de AWS Academy
}
