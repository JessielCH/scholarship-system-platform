#!/bin/bash
export DB_PASSWORD=postgres123!
export ALB_DNS_NAME=staging-alb-542509753.us-east-1.elb.amazonaws.com
export NEXT_PUBLIC_API_URL=http://$ALB_DNS_NAME:3000
export JWT_SECRET=staging-secret-key-123
export DATABASE_PRIVATE_IP=10.4.11.81
export BROKER_PRIVATE_IP=10.4.11.99
export MONGO_URI="mongodb://admin:admin@${DATABASE_PRIVATE_IP}:27017/documents?authSource=admin"
export S3_BUCKET_NAME="uce-distribuida-staging-documents-745727379327"
export AES_SECRET_KEY="secret"

export JWT_PRIVATE_KEY="$(cat ~/keys/private.pem)"
export JWT_PUBLIC_KEY="$(cat ~/keys/public.pem)"

IP=10.4.11.251
ssh -o StrictHostKeyChecking=no ubuntu@$IP "mkdir -p deployment/compose/keys"
scp -o StrictHostKeyChecking=no ~/keys/*.pem ubuntu@$IP:~/deployment/compose/keys/

echo "Stopping existing services..."
sudo -E /usr/local/bin/docker-compose -H ssh://ubuntu@$IP -f /home/ubuntu/deployment/compose/edge.yml down

echo "Pulling latest images..."
sudo -E /usr/local/bin/docker-compose -H ssh://ubuntu@$IP -f /home/ubuntu/deployment/compose/edge.yml pull

echo "Starting services..."
sudo -E /usr/local/bin/docker-compose -H ssh://ubuntu@$IP -f /home/ubuntu/deployment/compose/edge.yml up -d

echo "Checking running containers:"
ssh -o StrictHostKeyChecking=no ubuntu@$IP "sudo docker ps"
