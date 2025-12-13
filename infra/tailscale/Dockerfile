FROM tailscale/tailscale:latest

RUN apk add --no-cache ca-certificates

COPY fortinet-ca.crt /usr/local/share/ca-certificates/fortinet-ca.crt

RUN update-ca-certificates