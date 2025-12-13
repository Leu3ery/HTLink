FROM tailscale/tailscale:latest

RUN apk add --no-cache ca-certificates

# Добавляем сертификат Fortinet
COPY fortinet-ca.crt /usr/local/share/ca-certificates/fortinet-ca.crt

RUN update-ca-certificates