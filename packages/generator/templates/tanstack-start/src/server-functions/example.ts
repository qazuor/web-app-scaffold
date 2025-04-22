// This is a server function that can be imported and called from the client
// It will be executed on the server

export async function getServerTime() {
    return {
        time: new Date().toISOString(),
        environment: 'server',
    };
}
