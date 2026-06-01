module "vpc" {
  source = "../../modules/vpc"

  environment          = "prod"
  vpc_cidr             = "10.3.0.0/16"
  public_subnet_cidrs  = ["10.3.1.0/24", "10.3.2.0/24"]
  private_subnet_cidrs = ["10.3.11.0/24", "10.3.12.0/24"]
  availability_zones   = ["us-east-1a", "us-east-1b"]
}

module "ec2_prod" {
  source = "../../modules/ec2"

  environment   = "prod"
  service_name  = "api-gateway" # Eventualmente correrá nuestro Gateway Node.js
  vpc_id        = module.vpc.vpc_id
  subnet_id     = module.vpc.public_subnet_ids[0]
  instance_type = "t2.micro"
  key_name      = "vockey"
}

module "rds" {
  source = "../../modules/rds"

  environment    = "prod"
  vpc_id         = module.vpc.vpc_id
  vpc_cidr       = "10.3.0.0/16"
  subnet_ids     = module.vpc.private_subnet_ids
  instance_class = "db.t3.micro"
  db_name        = "identitydbprod"
  db_username    = "postgres"
  db_password    = var.db_password
  multi_az       = true
}
