import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function connectClient() {
    const transport = new StdioClientTransport({
        command: "node",
        args: ["../mcp-server/dist/index.js"],
    })
    const client = new Client({
        name: "ai-chat-client",
        version: "1.0.0"
    });
    await client.connect(transport);
    return client;
}

export default connectClient