import re

with open('.github/workflows/cd-apps.yml', 'r') as f:
    content = f.read()

# Remove tf outputs for Core, Security, Compute
content = re.sub(r'^\s*echo "CORE_PRIVATE_IP=\$\(terraform output -raw core_private_ip\)".*\n', '', content, flags=re.MULTILINE)
content = re.sub(r'^\s*echo "SECURITY_PRIVATE_IP=\$\(terraform output -raw security_private_ip\)".*\n', '', content, flags=re.MULTILINE)
content = re.sub(r'^\s*echo "COMPUTE_PRIVATE_IP=\$\(terraform output -raw compute_private_ip\)".*\n', '', content, flags=re.MULTILINE)

# Remove env vars in ssh-action block
content = re.sub(r'^\s*CORE_PRIVATE_IP: \$\{\{ env\.CORE_PRIVATE_IP \}\}.*\n', '', content, flags=re.MULTILINE)
content = re.sub(r'^\s*SECURITY_PRIVATE_IP: \$\{\{ env\.SECURITY_PRIVATE_IP \}\}.*\n', '', content, flags=re.MULTILINE)
content = re.sub(r'^\s*COMPUTE_PRIVATE_IP: \$\{\{ env\.COMPUTE_PRIVATE_IP \}\}.*\n', '', content, flags=re.MULTILINE)

# Remove env vars from 'envs' parameter
content = re.sub(r',CORE_PRIVATE_IP,SECURITY_PRIVATE_IP,COMPUTE_PRIVATE_IP', '', content)
content = re.sub(r',CORE_PRIVATE_IP,SECURITY_PRIVATE_IP', '', content)

# Remove ssh-keyscan
content = re.sub(r'^\s*ssh-keyscan -H \$SECURITY_PRIVATE_IP >> ~/.ssh/known_hosts.*\n', '', content, flags=re.MULTILINE)
content = re.sub(r'^\s*ssh-keyscan -H \$CORE_PRIVATE_IP >> ~/.ssh/known_hosts.*\n', '', content, flags=re.MULTILINE)
content = re.sub(r'^\s*ssh-keyscan -H \$COMPUTE_PRIVATE_IP >> ~/.ssh/known_hosts.*\n', '', content, flags=re.MULTILINE)
content = re.sub(r'^\s*sudo ssh-keyscan -H \$SECURITY_PRIVATE_IP \| sudo tee -a /root/\.ssh/known_hosts.*\n', '', content, flags=re.MULTILINE)
content = re.sub(r'^\s*sudo ssh-keyscan -H \$CORE_PRIVATE_IP \| sudo tee -a /root/\.ssh/known_hosts.*\n', '', content, flags=re.MULTILINE)
content = re.sub(r'^\s*sudo ssh-keyscan -H \$COMPUTE_PRIVATE_IP \| sudo tee -a /root/\.ssh/known_hosts.*\n', '', content, flags=re.MULTILINE)

# Remove exports
content = re.sub(r'^\s*export CORE_PRIVATE_IP="\$CORE_PRIVATE_IP".*\n', '', content, flags=re.MULTILINE)
content = re.sub(r'^\s*export SECURITY_PRIVATE_IP="\$SECURITY_PRIVATE_IP".*\n', '', content, flags=re.MULTILINE)
content = re.sub(r'^\s*export COMPUTE_PRIVATE_IP="\$COMPUTE_PRIVATE_IP".*\n', '', content, flags=re.MULTILINE)

# Fix docker check loop
content = re.sub(r'\$DATABASE_PRIVATE_IP \$SECURITY_PRIVATE_IP \$CORE_PRIVATE_IP \$BROKER_PRIVATE_IP \$COMPUTE_PRIVATE_IP', '$DATABASE_PRIVATE_IP $BROKER_PRIVATE_IP', content)
content = re.sub(r'\$DATABASE_PRIVATE_IP \$SECURITY_PRIVATE_IP \$CORE_PRIVATE_IP \$EDGE_PRIVATE_IPS', '$DATABASE_PRIVATE_IP $EDGE_PRIVATE_IPS', content)
content = re.sub(r'\$DATABASE_PRIVATE_IP \$SECURITY_PRIVATE_IP \$CORE_PRIVATE_IP \$BROKER_PRIVATE_IP \$EDGE_PRIVATE_IPS', '$DATABASE_PRIVATE_IP $BROKER_PRIVATE_IP $EDGE_PRIVATE_IPS', content)

# Remove docker-compose deployment blocks
content = re.sub(r'\s*# Core Node.*?-f deployment/compose/core\.yml up -d\n', '\n', content, flags=re.DOTALL)
content = re.sub(r'\s*# Security Node.*?-f deployment/compose/security\.yml up -d\n', '\n', content, flags=re.DOTALL)
content = re.sub(r'\s*# Compute Node.*?-f deployment/compose/compute\.yml up -d\n', '\n', content, flags=re.DOTALL)

with open('.github/workflows/cd-apps.yml', 'w') as f:
    f.write(content)
