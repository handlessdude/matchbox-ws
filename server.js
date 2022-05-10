import { WebSocketServer } from 'ws';
import {v4 as uuid} from "uuid";
import {
    writeFile,
    readFileSync,
    existsSync
} from "fs";

const clients = {};

const log = existsSync('log') && readFileSync('log')
const messages = JSON.parse(log) || [];

const wss = new WebSocketServer({
    port: 8000
});

wss.on("connection", ws => {
    const id = uuid();
    clients[id] = ws;
    console.log(`New client ${id}`);
    ws.send(JSON.stringify(messages))

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

process.on('SIGINT', () => {
    wss.close();
    writeFile('log', JSON.stringify(messages), error => {
        if(error){
        console.log(error)
        }
        process.exit();
    })

})