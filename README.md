# MCP Server & AI Chat Web App

This repository contains a full-stack application demonstrating the **Model Context Protocol (MCP)** using a custom MCP server and an Express-based client, powered by the Groq API (Llama 3).

## Project Structure

The workspace is divided into two primary directories:

- **`mcp-server/`**: A TypeScript-based MCP server providing functionality to scrape and extract text content from websites.
- **`ai-chat/`**: A Node.js (Express) client application providing a web UI. It functions as an MCP Client and leverages Groq's Llama 3 model to process user chat, automatically interpreting and calling server-side MCP tools when necessary.

## Features

- **Web Scraping Tool (`html-extractor`)**: The MCP server registers a tool that can download website HTML, clean it, extract the body text, and return it to the LLM. 
- **LLM Tool Calling**: The `ai-chat` Express server acts as an MCP client. If a user asks a question requiring website context, the LLM requests the use of the `html-extractor` tool, the client executes it via the local MCP server over standard I/O (stdio), and the LLM responds with the web context.

## Prerequisites

- Node.js (v18+ recommended)
- A [Groq API Key](https://console.groq.com/) for LLM access.

## Setup Instructions

### 1. Configure the MCP Server

1. Navigate to the `mcp-server` directory:
   ```bash
   cd mcp-server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the TypeScript server:
   ```bash
   npm run build
   ```
   *Note: Building is required because the client expects the compiled file at `../mcp-server/dist/index.js`.*

### 2. Configure the AI Chat Client

1. Navigate to the `ai-chat` directory:
   ```bash
   cd ai-chat
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Establish your environment variables by creating a `.env` file in the `ai-chat` directory:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```

### 3. Run the Application

Start the Express application (the MCP server is automatically spawned via stdio):
```bash
cd ai-chat
npm run dev
```

The server will start on port 3000. Open your browser and navigate to:
[http://localhost:3000](http://localhost:3000)

## How It Works

1. **User input**: You chat with the AI on the local web interface safely. Let's say you ask it to summarize a web page.
2. **Groq LLM**: The server proxies your request to Groq SDK, providing the tools listed by the MCP Server.
3. **Tool Execution**: The LLM chooses to execute `html-extractor`. The `ai-chat` Client executes it via MCP over stdio to the `mcp-server`.
4. **Extraction**: `mcp-server` parses the HTTP response, scrubs tags using Cheerio, and delivers clean text back.
5. **Final Output**: The LLM summarizes the ingested text into a friendly response.
