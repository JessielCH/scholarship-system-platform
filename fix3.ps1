ssh -i user_key.pem -o StrictHostKeyChecking=no ubuntu@35.172.67.236 "docker exec scholarship_gateway sed -i s/x27x27/\"\'\'\"/g /app/dist/index.js && docker restart scholarship_gateway"
