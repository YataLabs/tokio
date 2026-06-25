const http = require("http");
const { execFile } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const PORT = process.env.PRINTER_BRIDGE_PORT || 9123;

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

const server = http.createServer((req, res) => {
  setCors(res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "GET" && req.url === "/printers") {
    execFile("lpstat", ["-p"], (err, stdout) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
        return;
      }
      const printers = stdout
        .split("\n")
        .filter((line) => line.startsWith("printer "))
        .map((line) => line.split(" ")[1]);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ printers }));
    });
    return;
  }

  if (req.method === "POST" && req.url.startsWith("/print")) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const queue = url.searchParams.get("queue");
    if (!queue) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Missing queue param" }));
      return;
    }

    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const buf = Buffer.concat(chunks);
      const tmpFile = path.join(os.tmpdir(), `tokio-receipt-${Date.now()}.bin`);
      fs.writeFile(tmpFile, buf, (writeErr) => {
        if (writeErr) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: writeErr.message }));
          return;
        }
        execFile("lp", ["-d", queue, "-o", "raw", tmpFile], (printErr) => {
          fs.unlink(tmpFile, () => {});
          if (printErr) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: printErr.message }));
            return;
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: true }));
        });
      });
    });
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Printer bridge listening on http://127.0.0.1:${PORT}`);
});
