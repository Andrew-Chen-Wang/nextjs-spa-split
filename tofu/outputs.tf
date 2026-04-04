output "bucket_name" {
  description = "Name of the S3 bucket"
  value       = aws_s3_bucket.spa.id
}

output "bucket_website_url" {
  description = "S3 website endpoint URL"
  value       = aws_s3_bucket_website_configuration.spa.website_endpoint
}

output "role_arn" {
  description = "ARN of the IAM role for GitHub Actions"
  value       = aws_iam_role.github_actions_spa_deploy.arn
}
