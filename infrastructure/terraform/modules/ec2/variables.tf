variable "environment" {
  description = "Environment name"
  type        = string
}

variable "name" {
  description = "Name identifier for the instance"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"
}

variable "subnet_id" {
  description = "Subnet ID where to place the instance"
  type        = string
}

variable "key_name" {
  description = "Key pair name for SSH access"
  type        = string
  default     = "vockey"
}

variable "security_group_ids" {
  description = "List of security group IDs"
  type        = list(string)
}
