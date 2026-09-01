# WebMCP Regression Rules

## Scope

- Operate only on explicitly named test or staging environments.
- Never use state-changing WebMCP tools against a production origin.
- Before a run, use read-only tools to verify the page origin, market state, account context, and balance.

## Natural-language execution

- Treat a user request in natural language as an execution request, not merely a search request, unless the user asks only for an explanation or plan.
- Resolve the request into: environment, target page, requested business action, test data, expected outcome, and whether it changes state. Ask only for a missing value that cannot be safely discovered from page tools.
- Before acting, inspect the connected source and available WebMCP tool definitions for the requested page. Use only tools actually registered by that page.
- Prefer WebMCP business identifiers such as `marketId` and `betId`; do not depend on UI positions, coordinates, or button order.
- For a request such as "Flamengo wins, odds 2.10, stake 100", first query markets and current slip state; match the requested market and odds, then add the selection and set the stake. Report a conflict, suspension, changed odds, or insufficient balance instead of silently substituting another option.
- After every meaningful action, read the applicable structured state and compare it with the user's request.
- A natural-language execution that reveals a repeatable scenario should be proposed for promotion to a JSON case under `cases/`.

## State-changing actions

- After changing selections or stake, call `get_slip` and verify the structured state.
- Before `place_bet`, cancel, Cashout, settlement, or any wallet-changing operation, show the origin, selection, odds, stake, expected payout, and balance impact. Wait for explicit user confirmation.
- When odds have drifted, do not submit until the user explicitly approves the current odds.

## Evidence and cleanup

- Record environment, timestamp, tool inputs, structured outputs, receipt/order IDs, and balance before and after any final action.
- Convert repeatable discoveries into a case under `cases/`.
- Clear test slips after exploratory work. Never delete orders, fund records, or message history as cleanup.

## Reporting

- Classify each outcome as passed, failed, blocked, or not run.
- Do not report test-data, environment, or tool-configuration errors as product defects.
