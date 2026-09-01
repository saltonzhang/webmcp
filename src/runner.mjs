import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

function parseArguments(args) {
  const values = { environment: "test1", caseFile: "cases/WEBMCP-BET-001.json" };
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === "--env") {
      values.environment = args[++index];
    } else if (!args[index].startsWith("-")) {
      values.caseFile = args[index];
    } else {
      throw new Error(`unknown argument: ${args[index]}`);
    }
  }
  return values;
}

const arguments_ = parseArguments(process.argv.slice(2));
const casePath = resolve(arguments_.caseFile);
const testCase = JSON.parse(await readFile(casePath, "utf8"));
const environments = JSON.parse(await readFile(resolve("config/environments.json"), "utf8"));
const environment = environments[arguments_.environment];

if (!environment) throw new Error(`unknown environment: ${arguments_.environment}`);
if (!["development", "test", "staging"].includes(environment.kind)) {
  throw new Error(`refusing to run against ${environment.kind} environment: ${arguments_.environment}`);
}

function format(value) {
  return JSON.stringify(value, null, 2);
}

function getPath(object, path) {
  return path.split(".").reduce((value, key) => value?.[key], object);
}

function equal(actual, expected) {
  return JSON.stringify(actual) === JSON.stringify(expected);
}

function containsPartial(actual, expected) {
  if (Array.isArray(expected)) {
    return Array.isArray(actual) && expected.every((item) => actual.some((candidate) => containsPartial(candidate, item)));
  }
  if (expected && typeof expected === "object") {
    return actual && typeof actual === "object" && Object.entries(expected).every(([key, value]) => containsPartial(actual[key], value));
  }
  return Object.is(actual, expected);
}

function assertStep(data, step) {
  for (const [path, expected] of Object.entries(step.expect ?? {})) {
    const actual = getPath(data, path);
    if (!equal(actual, expected)) {
      throw new Error(`expect ${path}=${format(expected)}, received ${format(actual)}`);
    }
  }
  for (const [path, expected] of Object.entries(step.contains ?? {})) {
    const actual = getPath(data, path);
    if (!containsPartial(actual, expected)) {
      throw new Error(`expected ${path} to contain ${format(expected)}, received ${format(actual)}`);
    }
  }
}

class McpClient {
  constructor() {
    this.process = spawn("npx", ["-y", "@mcp-b/webmcp-local-relay@5.1.0"], { stdio: ["pipe", "pipe", "pipe"] });
    this.nextId = 1;
    this.pending = new Map();
    this.buffer = "";
    this.process.stdout.on("data", (chunk) => this.onData(chunk));
    this.process.on("exit", (code) => this.rejectPending(new Error(`relay exited with code ${code}`)));
  }

  onData(chunk) {
    this.buffer += chunk;
    let newline;
    while ((newline = this.buffer.indexOf("\n")) >= 0) {
      const line = this.buffer.slice(0, newline);
      this.buffer = this.buffer.slice(newline + 1);
      if (!line.trim()) continue;
      const message = JSON.parse(line);
      const pending = this.pending.get(message.id);
      if (!pending) continue;
      this.pending.delete(message.id);
      message.error ? pending.reject(new Error(format(message.error))) : pending.resolve(message.result);
    }
  }

  rejectPending(error) {
    for (const { reject } of this.pending.values()) reject(error);
    this.pending.clear();
  }

  request(method, params) {
    return new Promise((resolveRequest, rejectRequest) => {
      const id = this.nextId++;
      this.pending.set(id, { resolve: resolveRequest, reject: rejectRequest });
      this.process.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id, method, params })}\n`);
    });
  }

  notify(method, params) {
    this.process.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", method, params })}\n`);
  }

  close() {
    this.process.kill();
  }
}

function unwrapToolResult(result) {
  const text = result.content?.find((item) => item.type === "text")?.text;
  if (!text) throw new Error(`tool returned no text content: ${format(result)}`);
  return JSON.parse(text);
}

const client = new McpClient();
let failed = false;

try {
  await client.request("initialize", {
    protocolVersion: "2025-03-26",
    capabilities: {},
    clientInfo: { name: "webmcp-regression", version: "0.1.0" }
  });
  client.notify("notifications/initialized", {});

  const tools = (await client.request("tools/list", {})).tools;
  const sources = unwrapToolResult(await client.request("tools/call", {
    name: "webmcp_list_sources",
    arguments: {}
  })).sources;
  if (!sources.some((source) => source.origin === environment.origin)) {
    throw new Error(`blocked: no connected WebMCP page for ${environment.origin}; open ${environment.webmcpPageUrl ?? environment.baseUrl}`);
  }
  const toolName = (base) => {
    const matches = tools.filter((tool) => tool.name === base || tool.name.startsWith(`${base}_`));
    if (matches.length !== 1) {
      throw new Error(`expected one connected ${base} tool, found ${matches.map((tool) => tool.name).join(", ") || "none"}`);
    }
    return matches[0].name;
  };

  console.log(`ENV ${arguments_.environment}: ${environment.origin}`);
  console.log(`CASE ${testCase.id}: ${testCase.name}`);
  for (const [index, step] of testCase.steps.entries()) {
    const result = await client.request("tools/call", {
      name: toolName(step.tool),
      arguments: step.input ?? {}
    });
    const data = unwrapToolResult(result);
    assertStep(data, step);
    console.log(`PASS ${index + 1}/${testCase.steps.length} ${step.tool}`);
  }
  console.log(`RESULT passed: ${testCase.id}`);
} catch (error) {
  failed = true;
  console.error(`RESULT failed: ${testCase.id}`);
  console.error(error.message);
} finally {
  client.close();
}

if (failed) process.exitCode = 1;
