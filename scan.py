import socket
for i in range(1, 255):
    ip = f"10.4.11.{i}"
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(0.1)
        if s.connect_ex((ip, 3000)) == 0:
            print(f"Edge Node found: {ip}")
        s.close()
    except Exception:
        pass
