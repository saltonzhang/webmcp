# WebMCP Regression

Reusable WebMCP regression cases and a lightweight runner for the Helix test page.

`AGENTS.md` is the operational policy for Codex and must be followed for every exploration or automated run. The default cases deliberately avoid final, balance-changing bet placement.

## Prerequisites

1. Open the WebMCP-enabled test page in a browser, for example `https://www-test1-br.helix.city/en/webmcp-test`.
2. Configure the local relay in the AI client. Restrict it to the test origin:

```toml
[mcp_servers.webmcp-local-relay]
command = "npx"
args = ["-y", "@mcp-b/webmcp-local-relay@5.1.0", "--widget-origin", "https://www-test1-br.helix.city"]
```

3. Confirm `webmcp_list_sources` and `webmcp_list_tools` show one connected test page.

## Run cases

```bash
npm test
npm run test:case -- cases/WEBMCP-BET-001.json
```

The runner uses the relay's MCP protocol, discovers the current dynamic WebMCP tool names, calls each declared tool, and checks JSON assertions. It prints a readable pass/fail report and exits non-zero on failure.

## Case format

Each JSON case contains a unique ID, tags, preconditions, ordered WebMCP calls, and assertions. `expect` checks exact values at dot paths; `contains` looks for partial objects in arrays.

See [cases/WEBMCP-BET-001.json](cases/WEBMCP-BET-001.json) for the initial single-bet preparation regression and [docs/webmcp-exploration-policy.md](docs/webmcp-exploration-policy.md) for the team workflow.

