import re

with open('.github/workflows/cd-apps.yml', 'r') as f:
    content = f.read()

# Fix seeder execution to run on DATABASE_PRIVATE_IP instead of CORE_PRIVATE_IP
content = re.sub(r'sudo ssh -o StrictHostKeyChecking=no ubuntu@\$CORE_PRIVATE_IP "sudo docker run', 'sudo ssh -o StrictHostKeyChecking=no ubuntu@$DATABASE_PRIVATE_IP "sudo docker run', content)

# Check if scripts/ are copied to DATABASE_PRIVATE_IP
# If not, let's just make sure they are copied to DATABASE_PRIVATE_IP
copy_scripts = """
            # Copy scripts to database node for seeding
            sudo ssh -o StrictHostKeyChecking=no ubuntu@$DATABASE_PRIVATE_IP "mkdir -p scripts"
            sudo scp -o StrictHostKeyChecking=no -r scripts/* ubuntu@$DATABASE_PRIVATE_IP:~/scripts/
"""
if "sudo scp -o StrictHostKeyChecking=no -r scripts/* ubuntu@$DATABASE_PRIVATE_IP:~/scripts/" not in content:
    # We can inject this right before the seeder runs
    content = re.sub(r'(echo "Waiting for services to be ready before seeding...")', copy_scripts + r'\n            \1', content)

with open('.github/workflows/cd-apps.yml', 'w') as f:
    f.write(content)
