---
name: webmcp
description: "Execute a natural-language request through the current page's WebMCP relay tools only. Use when the user invokes $webmcp for a test or staging website operation; do not use for UI or visual testing."
---

# WebMCP Direct Execution

Use WebMCP as the only interaction surface for this request. Do not load a browser-control skill, inspect DOM, claim a browser tab, use Playwright, or search the web.

1. Resolve the named environment and target page from the user's request. Read the repository's `config/environments.json`; do not operate on a production environment.
2. Call `webmcp_list_sources`. Select a source whose origin and route match the target page.
3. If no source matches, call `webmcp_open_page` for the target URL and check sources once more. If it still does not connect, report the relay as blocked and stop.
4. Call `webmcp_list_tools` once. Use only tools registered by the selected source. Do not invent tool names or parameters.
5. Use read-only tools to resolve business IDs and verify current state. Parallelize independent reads only after the source and tool list are known.
6. Execute the requested non-final actions with those IDs. Prefer the structured state returned by each action; do not issue redundant state reads.
7. Before an action that creates or changes an order, wallet, settlement, Cashout, or other financial state, present the exact environment, selection, current odds, amount, expected result, and balance impact. Wait for the user's explicit confirmation.

For a request such as “Flamengo 胜、赔率必须为 2.10、下注单设置为 100、不要提交”, query the markets and slip, match the exact active market and odds, add the selection, set the stake, and return the resulting structured slip. If the requested market is unavailable, suspended, or at a different odds, report that result rather than substituting another selection.
