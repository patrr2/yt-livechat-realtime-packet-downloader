class SniffedResponse {
    constructor(originalResponse) {
        this.transformStream = new TransformStream()
        this.writeableStream = this.transformStream.writable
        this.readableStream = this.transformStream.readable

        this.forwardResponse = new Response(this.readableStream)

        Object.defineProperty(this.forwardResponse, 'headers', {value: originalResponse.headers})
        Object.defineProperty(this.forwardResponse, 'ok', {value: originalResponse.ok})
        Object.defineProperty(this.forwardResponse, 'redirected', {value: originalResponse.redirected})
        Object.defineProperty(this.forwardResponse, 'status', {value: originalResponse.status})
        Object.defineProperty(this.forwardResponse, 'statusText', {value: originalResponse.statusText})
        Object.defineProperty(this.forwardResponse, 'type', {value: originalResponse.type})
        Object.defineProperty(this.forwardResponse, 'url', {value: originalResponse.url})

        this.text = this.readStreamFully(originalResponse.body)

        this.text.then(async text => {
            console.log('Read response body, forwarding:', text.substring(0, 100), '...')
            const writer = this.writeableStream.getWriter()
            writer.write(new TextEncoder().encode(text))
            writer.close()
        })
    }

    async readStreamFully(readableStream) {
        const reader = readableStream.getReader()
        const list = []

        while (true) {
            const { done, value } = await reader.read()

            if (done) {
                break
            }

            list.push(new TextDecoder().decode(value))
        }

        return list.join('')
    }
}

const originalFetch = window.fetch;

window.fetch = async function(...args) {

    const response = originalFetch(...args);

    if (args[0].url?.includes('/youtubei/v1/live_chat/get_live_chat')) {
        const resp = await response
        console.log('Fetched live chat data:', resp);

        const sniffedResponse = new SniffedResponse(resp)

        sniffedResponse.text.then(async str => {
            console.log('Uploading chat packet to server:', JSON.stringify(str).length, 'chars');
            let resp = await fetch('http://localhost:8000/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: str,
            });
            console.log('response', resp)
        }).catch(error => {
            console.log('Error reading fetch response as JSON:', error);
        });
       
        return await sniffedResponse.forwardResponse;
    }


    return await response;
};
