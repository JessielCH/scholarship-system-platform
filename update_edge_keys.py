import re

with open('.github/workflows/cd-apps.yml', 'r') as f:
    content = f.read()

# Add SCP keys to EDGE nodes before pulling docker-compose
edge_setup = """
            # Edge Nodes (ASG)
            for IP in $EDGE_PRIVATE_IPS; do
              echo "Checking connection to Edge $IP..."
              if ! ssh -o ConnectTimeout=5 ubuntu@$IP "exit" 2>/dev/null; then
                echo "WARNING: Edge Node $IP is unreachable. Skipping."
                continue
              fi
              sudo ssh ubuntu@$IP "mkdir -p deployment/compose/keys"
              sudo scp keys/*.pem ubuntu@$IP:~/deployment/compose/keys/
              sudo -E /usr/local/bin/docker-compose -H ssh://ubuntu@$IP -f deployment/compose/edge.yml pull
              sudo -E /usr/local/bin/docker-compose -H ssh://ubuntu@$IP -f deployment/compose/edge.yml up -d
            done
"""

content = re.sub(r'# Edge Nodes \(ASG\)\n.*?done\n', edge_setup, content, flags=re.DOTALL)

with open('.github/workflows/cd-apps.yml', 'w') as f:
    f.write(content)
