#!/bin/bash
for i in {1..254}; do
    nc -zvw1 10.4.11.$i 3000 >/dev/null 2>&1 && echo "10.4.11.$i has port 3000 open (API Gateway)"
done
