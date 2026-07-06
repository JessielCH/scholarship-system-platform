scp -i c:\Users\jjcha\Desktop\Proyectos\Distribuida\user_key.pem -o StrictHostKeyChecking=no c:\Users\jjcha\Desktop\Proyectos\Distribuida\index_remote.js ubuntu@35.172.67.236:/home/ubuntu/index.js
ssh -i c:\Users\jjcha\Desktop\Proyectos\Distribuida\user_key.pem -o StrictHostKeyChecking=no ubuntu@35.172.67.236 "docker cp /home/ubuntu/index.js scholarship_gateway:/app/dist/index.js"
ssh -i c:\Users\jjcha\Desktop\Proyectos\Distribuida\user_key.pem -o StrictHostKeyChecking=no ubuntu@35.172.67.236 "docker restart scholarship_gateway"
