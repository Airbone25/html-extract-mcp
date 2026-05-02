import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from 'zod'
import axios from 'axios'
import * as cheerio from 'cheerio'

const server = new McpServer({
    name: "web-summary",
    version: "1.0.0"
})

server.registerTool("html-extractor", {
    description: "Read the url given and extract the html content of the page. Return the content as a string.",
    inputSchema: {
        url: z.string().describe("url from which html content is extracted")
    }
},
    async ({ url }) => {
        try {
            const summary = await fetchWebsite(url)
            return {
                content: [
                    { type: "text", text: summary }
                ]
            }
        } catch (error) {
            return {
                content: [
                    { type: "text", text: "Failed to save user" }
                ]
            }
        }
    }
)

async function fetchWebsite(url: string): Promise<string> {
    try {
        const res = await fetch(url)
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`)
        }
        const $ = cheerio.load(await res.text())
        $("script,style,noscript").remove()
        const text = $("body").text()
        const cleaned = text.replace(/\s+/g, " ").trim().slice(0, 3000)
        return cleaned
    } catch (error) {
        console.error("Error fetching website:", error)
        return "Failed to fetch website content."
    }
}

async function main() {
    const transport = new StdioServerTransport()
    await server.connect(transport)
    console.log("MCP Server is running...")
}

main()