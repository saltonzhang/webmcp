# WebMCP Regression Rules

## Scope

- Operate only on explicitly named test or staging environments.
- Never use state-changing WebMCP tools against a production origin.
- Before a run, call `webmcp_list_sources` and select a connected page whose origin and route match the requested environment and use case. A page must be open in a browser so it can register tools, but it does not need to be the active tab.
- If no matching source is connected, call `webmcp_open_page` for the requested URL, then check `webmcp_list_sources` once more. Do not invoke a browser-control skill merely to discover or operate a WebMCP page.
- If the relay still has no matching source, report the relay connection as blocked and give the target URL. Use Browser or Playwright only when the user explicitly requests UI fallback or visual verification.
- Once a matching source is connected, use WebMCP directly. Do not inspect DOM, take screenshots, or use Playwright unless the required WebMCP tool is absent or visual verification is explicitly requested.
- Before a run, use read-only business tools to verify market state, account context, and balance.

## Natural-language execution

- Treat a user request in natural language as an execution request, not merely a search request, unless the user asks only for an explanation or plan.
- Resolve the request into: environment, target page, requested business action, test data, expected outcome, and whether it changes state. Ask only for a missing value that cannot be safely discovered from page tools.
- Before acting, inspect the connected source and available WebMCP tool definitions for the requested page once per page load. Reuse them until the page reports a tool change or a call is stale.
- Prefer WebMCP business identifiers such as `marketId` and `betId`; do not depend on UI positions, coordinates, or button order.
- For a request such as "Flamengo wins, odds 2.10, stake 100", first query markets and current slip state; match the requested market and odds, then add the selection and set the stake. Report a conflict, suspension, changed odds, or insufficient balance instead of silently substituting another option.
- Prefer the structured state returned by a state-changing tool. Call an extra `get_slip` or equivalent only when the tool omits state, before a final action, or when a cross-check is needed.
- A natural-language execution that reveals a repeatable scenario should be proposed for promotion to a JSON case under `cases/`.

## State-changing actions

- After changing selections or stake, verify the structured state returned by that tool; use `get_slip` only when it did not return sufficient state.
- Before `place_bet`, cancel, Cashout, settlement, or any wallet-changing operation, show the origin, selection, odds, stake, expected payout, and balance impact. Wait for explicit user confirmation.
- When odds have drifted, do not submit until the user explicitly approves the current odds.

## Evidence and cleanup

- Record environment, timestamp, tool inputs, structured outputs, receipt/order IDs, and balance before and after any final action.
- Convert repeatable discoveries into a case under `cases/`.
- Clear test slips after exploratory work. Never delete orders, fund records, or message history as cleanup.

## Reporting

- Classify each outcome as passed, failed, blocked, or not run.
- Do not report test-data, environment, or tool-configuration errors as product defects.
