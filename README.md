# datetime-mcp

[![npm](https://img.shields.io/npm/v/datetime-mcp)](https://www.npmjs.com/package/datetime-mcp)
[![license](https://img.shields.io/npm/l/datetime-mcp)](./LICENSE)

A lightweight [MCP](https://modelcontextprotocol.io) server that exposes the host OS clock as date/time tools over stdio transport.

## Quick Start

```bash
npx datetime-mcp
```

Or install globally:

```bash
npm install -g datetime-mcp
```

## Tools

### `datetime.now`

Returns the current date/time from the host OS clock.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `tz`      | no       | IANA timezone (e.g. `America/New_York`) |

```json
{
  "tz": "Australia/Perth",
  "utcIso": "2026-01-22T03:30:00.000Z",
  "epochMs": 1737516600000,
  "human": "Thu, 22 Jan 2026, 11:30:00 AWST"
}
```

### `datetime.parse`

Parses a date/time string and returns canonical forms.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `value`   | yes      | Date/time string parseable by JS `Date` |
| `tz`      | no       | IANA timezone for human-readable output |

```json
{
  "input": "2026-01-22",
  "tz": "Australia/Perth",
  "utcIso": "2026-01-22T00:00:00.000Z",
  "epochMs": 1737504000000,
  "human": "Thu, 22 Jan 2026, 08:00:00 AWST"
}
```

### `datetime.health`

Returns server health metrics including monotonic time (won't jump with NTP adjustments).

```json
{
  "wallEpochMs": 1737516600000,
  "monotonicMs": 12345678,
  "processUptimeMs": 5000
}
```

## Configuration

### Claude Code

Add to `~/.claude/settings.json` or project `.mcp.json`:

```json
{
  "mcpServers": {
    "datetime": {
      "command": "npx",
      "args": ["-y", "datetime-mcp"],
      "env": {
        "MCP_TZ": "Australia/Perth"
      }
    }
  }
}
```

### Claude Desktop

Add to your Claude Desktop MCP config:

```json
{
  "mcpServers": {
    "datetime": {
      "command": "npx",
      "args": ["-y", "datetime-mcp"],
      "env": {
        "MCP_TZ": "Australia/Perth"
      }
    }
  }
}
```

### Environment Variables

| Variable | Default            | Description |
|----------|--------------------|-------------|
| `MCP_TZ` | `Australia/Perth` | Default IANA timezone |

## Development

```bash
pnpm install
pnpm dev       # run with tsx (hot reload)
pnpm build     # compile TypeScript
pnpm start     # run compiled output
```

## License

MIT
