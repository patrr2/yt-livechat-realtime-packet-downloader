// CAUTION: 99% CHATGPT GENERATED CODE

import { serve } from "https://deno.land/std@0.155.0/http/server.ts";

const list: Array<Record<string, unknown>> = [];
const port = 8000;
const filePath = './data.json';

const handler = async (request: Request): Promise<Response> => {
  if (request.method === "OPTIONS") {
    // Handle CORS preflight request
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (request.method === "POST" && new URL(request.url).pathname === "/upload") {
    try {
      const json = await request.json();
      list.push(json);
      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }
  }

  return new Response("Not Found", { status: 404, headers: { "Access-Control-Allow-Origin": "*" } });
};

const server = serve(handler, { port });
console.log(`HTTP webserver running. Access it at: http://localhost:${port}/`);

async function saveListToFile() {
  try {
    await Deno.writeTextFile(filePath, JSON.stringify(list));
    console.log("Data saved to disk.");
  } catch (error) {
    console.error("Failed to save data to disk:", error);
  }
}

function handleShutdown() {
  console.log("Shutting down...");
  saveListToFile().then(() => Deno.exit());
}

Deno.addSignalListener("SIGINT", handleShutdown);

const statusLog = () => {
  console.log('current list length', list.length)
  console.log('last obj: ', list[list.length-1])
}

setInterval(() => {
  statusLog()
}, 60000)

setTimeout(() => {
  statusLog()
}, 3000)
