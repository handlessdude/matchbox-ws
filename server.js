import { WebSocketServer } from 'ws';
import {v4 as uuid} from "uuid";
const clients = {};
const messages = [];

const wssConfig = {
    port: 8000
}
const wss = new WebSocketServer(wssConfig);

wss.on("connection", ws => {
    const id = uuid();
    clients[id] = ws;
    console.log(`New client ${id}`);

    ws.on('message', (rawMessage) => {
        const data = JSON.parse(rawMessage);
        console.log(`client ${id} | message = ${data}`)
        messages.push({id, data});
        for (const clientId in clients) {
            //сюда видимо пойдет типа "сколько осталось спичек"
            clients[clientId].send(JSON.stringify({id, data}))
        }
    })

    ws.on('close', () => {
        delete clients[id];
        console.log(`Client is closed ${id}`)
    })
})