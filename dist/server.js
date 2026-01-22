#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
const DEFAULT_TZ = process.env.MCP_TZ?.trim() || "Australia/Perth";
function formatHuman(date, tz) {
    // Uses the runtime's Intl/ICU timezone database to render in a specific IANA timezone.
    return new Intl.DateTimeFormat("en-GB", {
        timeZone: tz,
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZoneName: "short",
    }).format(date);
}
function nowPayload(tz) {
    const d = new Date(); // <-- comes from the host OS clock
    return {
        tz,
        utcIso: d.toISOString(),
        epochMs: d.getTime(),
        human: formatHuman(d, tz),
    };
}
function parsePayload(value, tz) {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
        throw new Error(`Unable to parse date value: ${value}`);
    }
    return {
        input: value,
        tz,
        utcIso: d.toISOString(),
        epochMs: d.getTime(),
        human: formatHuman(d, tz),
    };
}
function healthPayload() {
    // Monotonic time (won't jump backwards/forwards with NTP clock changes)
    const monotonicMs = Number(process.hrtime.bigint() / 1000000n);
    const wallEpochMs = Date.now();
    const processUptimeMs = Math.round(process.uptime() * 1000);
    return { wallEpochMs, monotonicMs, processUptimeMs };
}
async function main() {
    const server = new McpServer({
        name: "datetime-mcp",
        version: "1.0.0",
    });
    server.tool("datetime.now", {
        tz: z.string().optional().describe("IANA timezone, e.g. Australia/Perth"),
    }, async ({ tz }) => {
        const zone = tz || DEFAULT_TZ;
        const payload = nowPayload(zone);
        return {
            content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
        };
    });
    server.tool("datetime.health", {}, async () => {
        const payload = healthPayload();
        return {
            content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
        };
    });
    server.tool("datetime.parse", {
        value: z.string().describe("A date/time string parseable by JS Date"),
        tz: z.string().optional().describe("IANA timezone, e.g. Australia/Perth"),
    }, async ({ value, tz }) => {
        const zone = tz || DEFAULT_TZ;
        const payload = parsePayload(value, zone);
        return {
            content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
        };
    });
    const transport = new StdioServerTransport();
    await server.connect(transport);
    // stderr is safe for logs under stdio transport (clients may show/ignore it)
    console.error(`datetime-mcp running (default TZ=${DEFAULT_TZ}) via stdio`);
}
main().catch((err) => {
    console.error("datetime-mcp fatal error:", err);
    process.exit(1);
});
