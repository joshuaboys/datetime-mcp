# Project Review: datetime-mcp

## Overview

A lightweight MCP (Model Context Protocol) server providing date/time tools over stdio transport, intended for use with Claude Code, Claude Desktop, or any MCP-compatible client. Single-file TypeScript implementation exposing three tools: `datetime.now`, `datetime.parse`, and `datetime.health`.

---

## Strengths

1. **Clean, focused scope** -- The project does one thing well. Three tools with clear purpose, no unnecessary abstractions.

2. **Good error handling in `formatHuman`** (`src/server.ts:10-28`) -- Catches `RangeError` from `Intl.DateTimeFormat` and re-throws with a clear message about invalid IANA timezones.

3. **Input truncation for error messages** (`src/server.ts:41-53`) -- `formatInputForError` prevents unbounded strings from flooding logs.

4. **Correct use of stderr for logging** (`src/server.ts:128`) -- Under stdio transport, stdout is the protocol channel, so logging to stderr is correct.

5. **Sensible use of `Intl.DateTimeFormat`** -- Leverages the runtime's ICU database for timezone conversion rather than pulling in a heavy library like `moment-timezone`.

6. **Proper npm packaging setup** -- `files`, `bin`, `engines`, `prepublishOnly` are all configured correctly. Keywords are well-chosen for discoverability.

7. **Good README** -- Clear configuration examples for Claude Code/Desktop, tool documentation with example outputs, development instructions.

---

## Issues Found

### Bug: Committed `dist/` is out of sync with source

The checked-in `dist/server.js` does not match `src/server.ts`. Specifically:

- **Version mismatch**: `dist/server.js` reports `version: "1.0.0"` while `src/server.ts` and `package.json` both say `"0.1.0"`.
- **Missing code**: The committed dist is missing the `try/catch` in `formatHuman`, the `formatInputForError` function, and the truncated error messages in `parsePayload`.

This means anyone running the published/installed package gets an older build with fewer protections. The dist should be rebuilt and recommitted, or (better) excluded from version control entirely.

**Recommendation**: Add `dist/` to `.gitignore` and remove it from git tracking. The `prepublishOnly` script already ensures dist is built before `npm publish`. Tracking build artifacts in git leads to exactly this kind of drift.

### Version string duplication

The version `"0.1.0"` appears in both `package.json:2` and `src/server.ts:83`. When you bump the version, you must remember to update both. This is error-prone, as demonstrated by the `dist/server.js` having `"1.0.0"` while `package.json` has `"0.1.0"`.

**Recommendation**: Read the version from `package.json` at runtime or use a build-time replacement.

### No tests

There are zero tests. The project has pure functions (`formatHuman`, `nowPayload`, `parsePayload`, `healthPayload`, `formatInputForError`) that are straightforward to unit test.

Key things worth testing:
- `parsePayload` with invalid date strings
- `formatHuman` with invalid timezones
- `formatInputForError` with strings above/below the truncation threshold
- `healthPayload` returns expected shape
- Edge cases like empty string to `parsePayload`

### No tool descriptions on MCP tools

The `server.tool()` calls at `src/server.ts:86-122` provide parameter descriptions via Zod but no top-level **tool description**. MCP clients use tool descriptions to decide when to invoke a tool. The current `McpServer.tool()` API supports a description string as the second argument.

Without descriptions, LLM clients must guess from the tool name alone.

### `datetime.parse` relies on `new Date(value)` parsing

`src/server.ts:56` -- JavaScript's `Date` constructor parsing is notoriously inconsistent across runtimes. For example:
- `new Date("01/02/2026")` is January 2 in the US but could be interpreted differently
- `new Date("2026-1-5")` behaves differently on V8 vs other engines
- Two-digit years have surprising behavior

The Zod description says "A date/time string parseable by JS Date" which is fair warning, but the tool would be more reliable with guidance toward ISO 8601 strings.

### `datetime.parse` doesn't handle timezone in parsing

When a user passes `value: "2026-01-22T10:00:00"` (no Z or offset), `new Date()` interprets it as local time on the server. The `tz` parameter only affects the *output* formatting, not the *parsing*. This could confuse users who expect `tz` to influence how the input is interpreted.

### Hardcoded default timezone

`src/server.ts:6` -- `DEFAULT_TZ` falls back to `"Australia/Perth"`. While `MCP_TZ` env var allows override, a more neutral default like `"UTC"` would be less surprising for the majority of users.

### `.gitignore` is overly broad

The `.gitignore` is a generic GitHub Node.js template with entries for Next.js, Nuxt, Gatsby, SvelteKit, Vuepress, Firebase, DynamoDB, etc. None of these are relevant to this project.

### No `isError` flag on tool error responses

When tools throw (e.g., invalid timezone, unparseable date), the error propagates as an unhandled exception. MCP best practice is to catch errors within the tool handler and return `{ isError: true, content: [...] }` so the client gets a structured error response rather than a transport-level failure.

### No CI/CD

No GitHub Actions workflow or other CI configuration exists. There is no automated way to verify the build works on a clean checkout.

---

## Summary of Recommendations (Priority Order)

| Priority | Issue | Recommendation |
|----------|-------|----------------|
| **High** | `dist/` out of sync | Rebuild and recommit, or add `dist/` to `.gitignore` |
| **High** | No tool descriptions | Add description strings to all `server.tool()` calls |
| **High** | No error handling in tool handlers | Wrap handlers in try/catch, return `isError: true` |
| **Medium** | Duplicate version string | Read version from `package.json` at runtime |
| **Medium** | No tests | Add unit tests for pure functions |
| **Medium** | `Date` parsing ambiguity | Document limitations or recommend ISO 8601 input |
| **Low** | Hardcoded Perth default | Consider UTC as a more neutral default |
| **Low** | Bloated `.gitignore` | Trim to project-relevant entries |
| **Low** | No CI/CD | Add a GitHub Actions workflow for build + test |
