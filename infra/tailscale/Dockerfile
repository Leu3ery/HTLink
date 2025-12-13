FROM tailscale/tailscale:latest

# Для Debian/Ubuntu-базированных образов tailscale (обычно так)
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

COPY fortinet-ca.crt /usr/local/share/ca-certificates/fortinet-ca.crt
RUN update-ca-certificates