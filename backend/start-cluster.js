import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const instances = [
  { name: "Server 1", script: "src/server.js", port: 4001 },
  { name: "Server 2", script: "src/server.js", port: 4002 },
  { name: "Load Balancer", script: "src/load-balancer.js", port: 8080 }
];

console.log("Starting Socket.IO + Redis Adapter Cluster...");

const children = [];

instances.forEach((instance) => {
  const env = { ...process.env, PORT: instance.port.toString() };
  const scriptPath = path.resolve(__dirname, instance.script);
  
  // Launch the node process
  const child = spawn("node", [scriptPath], { env });
  children.push(child);

  child.stdout.on("data", (data) => {
    const lines = data.toString().trim().split("\n");
    lines.forEach((line) => {
      if (line.trim()) {
        console.log(`[${instance.name}] ${line}`);
      }
    });
  });

  child.stderr.on("data", (data) => {
    const lines = data.toString().trim().split("\n");
    lines.forEach((line) => {
      if (line.trim()) {
        console.error(`[${instance.name} ERROR] ${line}`);
      }
    });
  });

  child.on("close", (code) => {
    console.log(`[${instance.name}] Process exited with code ${code}`);
  });
});

// Terminate all child processes on exit
process.on("exit", () => {
  children.forEach((child) => child.kill());
});
process.on("SIGINT", () => {
  children.forEach((child) => child.kill());
  process.exit();
});
