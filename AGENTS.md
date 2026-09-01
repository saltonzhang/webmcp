# WebMCP Regression Rules

## Scope

- Operate only on explicitly named test or staging environments.
- Never use state-changing WebMCP tools against a production origin.
- Before a run, use read-only tools to verify the page origin, market state, account context, and balance.

## Natural-language exploration

- Restate the target, scope, test data, and expected result before starting a multi-step exploration.
- Prefer WebMCP business identifiers such as `marketId` and `betId`; do not depend on UI positions, coordinates, or button order.
- Do not invent tool names or arguments. Query tool definitions or read state first when a capability is uncertain.

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

