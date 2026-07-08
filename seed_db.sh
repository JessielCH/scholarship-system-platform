#!/bin/bash
export DB_PASSWORD=postgres123!
export ALB_DNS_NAME=staging-alb-542509753.us-east-1.elb.amazonaws.com
export DATABASE_PRIVATE_IP=10.4.11.81

echo "Copying scripts to DB..."
ssh -o StrictHostKeyChecking=no ubuntu@$DATABASE_PRIVATE_IP "mkdir -p scripts"
scp -o StrictHostKeyChecking=no -r ~/scripts/* ubuntu@$DATABASE_PRIVATE_IP:~/scripts/

echo "Running seed..."
ssh -o StrictHostKeyChecking=no ubuntu@$DATABASE_PRIVATE_IP "sudo docker run --rm --network host -v /home/ubuntu/scripts:/scripts -e DB_HOST=$DATABASE_PRIVATE_IP -e REDIS_HOST=$DATABASE_PRIVATE_IP -e DB_USER=postgres -e DB_PASSWORD=$DB_PASSWORD -e DB_NAME=identitydb -e API_GATEWAY=http://$ALB_DNS_NAME:3000 node:20-alpine sh -c \"cd /scripts && npm install pg ioredis uuid bcryptjs && node global-seed.js\""
