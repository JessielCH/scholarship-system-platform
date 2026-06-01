resource "aws_db_subnet_group" "default" {
  name       = "${var.environment}-rds-subnet-group"
  subnet_ids = var.subnet_ids

  tags = {
    Name        = "${var.environment}-rds-subnet-group"
    Environment = var.environment
  }
}

resource "aws_security_group" "rds" {
  name        = "${var.environment}-rds-sg"
  description = "Security group for RDS ${var.environment}"
  vpc_id      = var.vpc_id

  ingress {
    description = "PostgreSQL access from within VPC"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.environment}-rds-sg"
    Environment = var.environment
  }
}

resource "aws_db_instance" "default" {
  identifier           = "${var.environment}-identity-db"
  allocated_storage    = 20
  storage_type         = "gp2"
  engine               = "postgres"
  engine_version       = "15.4" # Or 15, let's use 15
  instance_class       = var.instance_class
  db_name              = var.db_name
  username             = var.db_username
  password             = var.db_password
  parameter_group_name = "default.postgres15"
  skip_final_snapshot  = true
  publicly_accessible  = false

  db_subnet_group_name   = aws_db_subnet_group.default.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  multi_az               = var.multi_az

  tags = {
    Name        = "${var.environment}-identity-db"
    Environment = var.environment
  }
}
