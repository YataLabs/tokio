#!/bin/bash
PLIST="$HOME/Library/LaunchAgents/com.tokio.printer-bridge.plist"
launchctl unload "$PLIST" 2>/dev/null || true
rm -f "$PLIST"
echo "✅ Tokio Printer Bridge removed."
