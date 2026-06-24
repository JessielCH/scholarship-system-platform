#!/bin/bash
ssh -i lab.pem -o StrictHostKeyChecking=no ubuntu@100.48.35.245 "CORE_IP=\$(docker inspect scholarship_gateway | grep DOCUMENT_SERVICE_URL | grep -oE '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | head -n 1) && ssh -o StrictHostKeyChecking=no ubuntu@\$CORE_IP 'docker logs scholarship_document_service --tail 100'"
