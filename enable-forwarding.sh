#!/bin/sh
echo "
nat-anchor \"com.apple/*\" all
rdr-anchor \"com.apple/*\" all
rdr pass inet proto tcp from any to any port 80 -> 127.0.0.1 port 8080
rdr pass inet proto tcp from any to any port 443 -> 127.0.0.1 port 8443
" | sudo pfctl -ef -
sudo pfctl -s nat
