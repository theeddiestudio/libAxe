const MAX_CONNECTIONS_PER_USER = 5;
const HEARTBEAT_MS = 25_000; // 25s

// clients are the open connections of the user
const clients = new Map();

const addClient = (userId, res) => {
    const key = String(userId);
    const open = clients.get(key) ?? new Set();

    if (open.size >= MAX_CONNECTIONS_PER_USER) return false;

    open.add(res);
    clients.set(key, open);
    return true;
}

const removeClient = (userId, res) => {
    const key = String(userId);
    const open = clients.get(key);
    if (!open) return;

    open.delete(res);
    if (open.size === 0) clients.delete(key);
};

// push one event to every open tab of one user.
// returns the number of tabs
const sendToUser = (userId, event, data) => {
    const open = clients.get(String(userId));
    if (!open) return 0;

    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const res of open) res.write(message);
    return open.size;
}

// hangup on every open tab of one user (used at logout)
//security feature to prevent connection persiting after logout
const closeUserStreams = (userId) => {
    const key = String(userId);
    const open = clients.get(key);
    if(!open) return;

    for (const res of [...open]) res.end();
    clients.delete(key);
}

// keeps connections from looking idle
// line with : at beginning is a comment and browsers ignore ir
const pingAll = () => {
    for(const open of clients.values()) {
        for (const res of open) res.write(': ping\n\n');
    }
};

// call pingAll every 25s
const heartbeat = setInterval(pingAll, HEARTBEAT_MS);
heartbeat.unref();

const connectionCount = () => {
    let total = 0;
    for (const open of clients.values()) total += open.size;
    return total
}

export {addClient, removeClient, sendToUser, closeUserStreams, pingAll, connectionCount};