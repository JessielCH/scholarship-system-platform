output "alb_dns_name" {
  description = "The DNS name of the ALB"
  value       = aws_lb.this.dns_name
}

output "alb_arn" {
  description = "The ARN of the ALB"
  value       = aws_lb.this.arn
}

output "target_group_arns" {
  description = "The ARNs of the target groups"
  value       = [aws_lb_target_group.edge.arn, aws_lb_target_group.frontend.arn]
}
