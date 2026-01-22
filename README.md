# datetime-mcp

A lightweight MCP (Model Context Protocol) server that provides date/time tools via stdio transport.

## Installation

```bash
npm install -g datetime-mcp
```

Or use directly with npx:

```bash
npx datetime-mcp
```

## Tools

### datetime.now

Returns the current date/time from the host OS clock.

**Parameters:**
- `tz` (optional): IANA timezone string (e.g., `Australia/Perth`, `America/New_York`)

**Returns:**
```json
{
  "tz": "Australia/Perth",
  "utcIso": "2026-01-22T03:30:00.000Z",
  "epochMs": 1737516600000,
  "human": "Thu, 22 Jan 2026, 11:30:00 AWST"
}
```

### datetime.health

Returns server health information including monotonic time (won't jump with NTP adjustments).

**Returns:**
```json
{
  "wallEpochMs": 1737516600000,
  "monotonicMs": 12345678,
  "processUptimeMs": 5000
}
```

### datetime.parse

Parses a date/time string and returns canonical forms.

**Parameters:**
- `value` (required): A date/time string parseable by JavaScript's `Date` constructor
- `tz` (optional): IANA timezone for human-readable output

**Returns:**
```json
{
  "input": "2026-01-22",
  "tz": "Australia/Perth",
  "utcIso": "2026-01-22T00:00:00.000Z",
  "epochMs": 1737504000000,
  "human": "Thu, 22 Jan 2026, 08:00:00 AWST"
}
```

## Configuration

### Claude Code / Claude Desktop

Add to your MCP settings:

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

Or with global install:

```json
{
  "mcpServers": {
    "datetime": {
      "command": "datetime-mcp",
      "env": {
        "MCP_TZ": "Australia/Perth"
      }
    }
  }
}
```

### Environment Variables

- `MCP_TZ`: Default IANA timezone (defaults to `Australia/Perth`)

## Development

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm dev

# Build
pnpm build

# Start built server
pnpm start
```

## License

MIT
