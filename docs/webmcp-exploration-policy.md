# WebMCP Exploration Policy

## Purpose

Natural language is a first-class execution mode for exploratory testing and temporary business operations; declared cases are used for repeatable regression. Both must use the same environment boundaries and evidence standard. The detailed AI workflow is in [自然语言执行规范](natural-language-execution.md).

## Request template

Use this shape when asking an AI to explore a workflow:

```text
Environment: test1
Goal: verify odds-change protection
Scope: m1 only; do not submit a final bet
Data: stake 100
Expected: placement without odds acceptance is rejected with odds-drift detail
Evidence: include tool input, structured output, and final slip state
```

## Promotion to regression

When an exploratory result matters, add a JSON case with:

- a stable case ID such as `WEBMCP-BET-004`;
- explicit test-data preconditions;
- one WebMCP tool call per step;
- assertions against stable structured fields or error codes;
- no final financial action unless the case is marked destructive and executed only with an approved isolated account.

## Outcome labels

| Label | Meaning |
| --- | --- |
| passed | Every declared assertion matched. |
| failed | A product response did not match an assertion. |
| blocked | A prerequisite such as relay, test data, or environment was unavailable. |
| not run | The case was intentionally skipped before any meaningful step. |
