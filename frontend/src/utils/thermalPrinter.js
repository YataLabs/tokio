const ESC = 0x1b;
const GS = 0x1d;

const encoder = new TextEncoder();

const BRIDGE_URL_KEY = "tokio_printer_bridge_url";
const BRIDGE_QUEUE_KEY = "tokio_printer_queue";
const DEFAULT_BRIDGE_URL = "http://127.0.0.1:9123";

let cachedDevice = null;
let cachedEndpoint = null;

export function isWebUSBSupported() {
  return typeof navigator !== "undefined" && !!navigator.usb;
}

export function getBridgeUrl() {
  return localStorage.getItem(BRIDGE_URL_KEY) || DEFAULT_BRIDGE_URL;
}

export function setBridgeUrl(url) {
  localStorage.setItem(BRIDGE_URL_KEY, url);
}

export function getBridgeQueue() {
  return localStorage.getItem(BRIDGE_QUEUE_KEY) || "";
}

export function setBridgeQueue(queue) {
  localStorage.setItem(BRIDGE_QUEUE_KEY, queue);
}

export async function listBridgePrinters() {
  const res = await fetch(`${getBridgeUrl()}/printers`);
  if (!res.ok) throw new Error("Print bridge not reachable. Is it running?");
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.printers || [];
}

async function sendViaBridge(bytes) {
  const queue = getBridgeQueue();
  const res = await fetch(`${getBridgeUrl()}/print?queue=${encodeURIComponent(queue)}`, {
    method: "POST",
    headers: { "Content-Type": "application/octet-stream" },
    body: bytes,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) {
    throw new Error(data.error || "Print bridge failed");
  }
}

function concat(arrays) {
  const total = arrays.reduce((sum, a) => sum + a.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const a of arrays) {
    out.set(a, offset);
    offset += a.length;
  }
  return out;
}

function findOutEndpoint(device) {
  for (const config of device.configurations) {
    for (const iface of config.interfaces) {
      for (const alt of iface.alternates) {
        const outEp = alt.endpoints.find((e) => e.direction === "out");
        if (outEp) {
          return {
            configurationValue: config.configurationValue,
            interfaceNumber: iface.interfaceNumber,
            alternateSetting: alt.alternateSetting,
            endpointNumber: outEp.endpointNumber,
          };
        }
      }
    }
  }
  return null;
}

async function openDevice(device) {
  const found = findOutEndpoint(device);
  if (!found) throw new Error("No compatible USB endpoint found on this printer");

  await device.open();
  if (!device.configuration || device.configuration.configurationValue !== found.configurationValue) {
    await device.selectConfiguration(found.configurationValue);
  }
  await device.claimInterface(found.interfaceNumber);
  try {
    await device.selectAlternateInterface(found.interfaceNumber, found.alternateSetting);
  } catch {
    // some printers reject this if there's only one alternate; safe to ignore
  }
  return found.endpointNumber;
}

export async function requestPrinter() {
  if (!isWebUSBSupported()) throw new Error("WebUSB is not supported in this browser");
  const device = await navigator.usb.requestDevice({ filters: [] });
  cachedEndpoint = await openDevice(device);
  cachedDevice = device;
  return device;
}

export async function getSavedPrinter() {
  if (!isWebUSBSupported()) return null;
  const devices = await navigator.usb.getDevices();
  if (devices.length === 0) return null;
  const device = devices[0];
  cachedEndpoint = await openDevice(device);
  cachedDevice = device;
  return device;
}

export function getConnectedPrinter() {
  return cachedDevice;
}

export async function forgetPrinter() {
  if (cachedDevice) {
    try {
      await cachedDevice.close();
    } catch {
      // ignore
    }
    try {
      await cachedDevice.forget?.();
    } catch {
      // ignore
    }
  }
  cachedDevice = null;
  cachedEndpoint = null;
}

async function send(bytes) {
  if (getBridgeQueue()) {
    await sendViaBridge(bytes);
    return;
  }
  if (!cachedDevice) {
    const saved = await getSavedPrinter();
    if (!saved) throw new Error("No printer connected. Connect a printer in Settings.");
  }
  await cachedDevice.transferOut(cachedEndpoint, bytes);
}

function formatMoney(value) {
  return "Rp " + Math.round(value).toLocaleString("id-ID");
}

function justify(left, right, width) {
  const space = Math.max(1, width - left.length - right.length);
  return left + " ".repeat(space) + right;
}

export async function printReceipt(transaction, cash, { width = 32 } = {}) {
  const parts = [];

  parts.push(new Uint8Array([ESC, 0x40])); // init

  // header
  parts.push(new Uint8Array([ESC, 0x61, 0x01])); // center
  parts.push(new Uint8Array([GS, 0x21, 0x11])); // double width/height
  parts.push(encoder.encode("Tokio\n"));
  parts.push(new Uint8Array([GS, 0x21, 0x00])); // normal size
  parts.push(encoder.encode(`${new Date(transaction.created_at).toLocaleString("id-ID")}\n`));
  parts.push(encoder.encode(`Receipt #${transaction.id}\n`));

  parts.push(new Uint8Array([ESC, 0x61, 0x00])); // left align
  parts.push(encoder.encode("-".repeat(width) + "\n"));

  for (const it of transaction.items) {
    parts.push(encoder.encode(`${it.item_name} x${it.quantity}\n`));
    parts.push(encoder.encode(justify("", formatMoney(it.subtotal), width) + "\n"));
  }

  parts.push(encoder.encode("-".repeat(width) + "\n"));

  parts.push(new Uint8Array([ESC, 0x45, 0x01])); // bold on
  parts.push(encoder.encode(justify("Total", formatMoney(transaction.total_price), width) + "\n"));
  parts.push(new Uint8Array([ESC, 0x45, 0x00])); // bold off

  parts.push(encoder.encode(justify("Payment", transaction.payment_method.toUpperCase(), width) + "\n"));
  parts.push(encoder.encode(justify("Cashier", transaction.cashier, width) + "\n"));

  if (cash) {
    parts.push(encoder.encode(justify("Cash", formatMoney(cash.received), width) + "\n"));
    parts.push(encoder.encode(justify("Kembalian", formatMoney(cash.change), width) + "\n"));
  }

  parts.push(encoder.encode("\n"));
  parts.push(new Uint8Array([ESC, 0x61, 0x01])); // center
  parts.push(encoder.encode("Thank you for your purchase!\n"));
  parts.push(encoder.encode("\n\n\n"));

  parts.push(new Uint8Array([GS, 0x56, 0x00])); // full cut

  await send(concat(parts));
}
