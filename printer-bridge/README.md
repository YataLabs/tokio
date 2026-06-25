# Tokio Printer Bridge

Local helper that lets the Tokio POS web app print directly to a USB thermal
printer (e.g. Epson TM-U220) via CUPS, bypassing the browser print dialog.

## Setup (one-time, on the cashier's Mac)

1. Connect the printer via USB, then in **System Settings > Printers & Scanners**
   add it. If macOS doesn't detect it automatically, add it manually and pick
   the **Generic / Raw / Text Only** driver (not a specific Epson driver —
   raw mode is required so ESC/POS bytes pass through untouched).
2. Confirm the queue name:
   ```
   lpstat -p
   ```
   Note the name after `printer ` (e.g. `TM_U220`).

## Running the bridge

```
cd printer-bridge
npm start
```

Leave this running in the background while using the POS. It listens on
`http://127.0.0.1:9123`.

## Connecting it in the app

Go to **Settings > Print Bridge** in Tokio POS, click "Refresh Printers",
select your queue from the list, and click "Test Print".
