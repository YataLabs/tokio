#!/bin/bash
# Installs Tokio Printer Bridge as a macOS launchd service (auto-starts on login).
set -e

PLIST="$HOME/Library/LaunchAgents/com.tokio.printer-bridge.plist"
BRIDGE_PATH="$(cd "$(dirname "$0")/.." && pwd)/server.js"
NODE_PATH="$(which node)"

cat > "$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.tokio.printer-bridge</string>
    <key>ProgramArguments</key>
    <array>
        <string>$NODE_PATH</string>
        <string>$BRIDGE_PATH</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/tokio-bridge.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/tokio-bridge.log</string>
</dict>
</plist>
EOF

launchctl unload "$PLIST" 2>/dev/null || true
launchctl load "$PLIST"
echo "✅ Tokio Printer Bridge installed and started."
echo "   Logs: /tmp/tokio-bridge.log"
echo "   To uninstall: launchctl unload $PLIST && rm $PLIST"
