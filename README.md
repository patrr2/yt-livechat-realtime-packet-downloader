Windows 10 running guide to download raw live chat packets from youtube as they are coming
1. start server with `deno run --allow-net --allow-write server.ts`
2. inject inject.js to live-running youtube chat popup (note: not sure if you need to change Top Chat to Live Chat to download all message packets) (note: for some reason the only the popup mode uses the global fetch function)
3. when done, ctrl+c (SIGINT on windows) the server.ts, which will write data.json

Working mechanism explained
1. creates a proxy for window.fetch() that has a special mechanism for get_live_chat requests
2. that special mechanism awaits for the response, reads and stores the response body, creates a fake response object, writes the saved response body to that object and returns that fake response object (`forwardResponse`) to the original fetch() caller (this fake response object is needed because ReadableStream can only be read once)
3. send the stored response body to local server that stores it in an array and writes the array on disk when user does CTRL+C on the server
