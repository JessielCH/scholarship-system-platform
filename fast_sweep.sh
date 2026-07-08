for i in {1..254}; do
    nc -zvw1 10.4.11.$i 22 2>/dev/null && echo "10.4.11.$i has port 22 open" &
done
wait
