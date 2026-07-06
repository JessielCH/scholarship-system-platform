$sshCommand = "docker exec scholarship_gateway sed -i 's/rewritePrefix: .\x2Ffinancial./rewritePrefix: \x27\x27/g' /app/dist/index.js && docker restart scholarship_gateway"
ssh -i user_key.pem -o StrictHostKeyChecking=no ubuntu@35.172.67.236 $sshCommand
