output "endpoint" {
  value       = aws_db_instance.default.endpoint
  description = "The connection endpoint for the RDS instance"
}

output "port" {
  value       = aws_db_instance.default.port
  description = "The port the RDS instance is listening on"
}

output "database_name" {
  value       = aws_db_instance.default.db_name
  description = "The name of the database"
}
