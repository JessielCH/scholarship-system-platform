import re

with open('.github/workflows/cd-apps.yml', 'r') as f:
    content = f.read()

# Add BROKER_PRIVATE_IP to env: block in deploy-qa and deploy-staging
content = re.sub(r'(\s+)(DATABASE_PRIVATE_IP: \$\{\{ env\.DATABASE_PRIVATE_IP \}\})', r'\1\2\1BROKER_PRIVATE_IP: ${{ env.BROKER_PRIVATE_IP }}', content)

# Add BROKER_PRIVATE_IP to envs: list
content = re.sub(r'(envs: .*?DATABASE_PRIVATE_IP)', r'\1,BROKER_PRIVATE_IP', content)

with open('.github/workflows/cd-apps.yml', 'w') as f:
    f.write(content)
