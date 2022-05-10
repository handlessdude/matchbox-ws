import { WebSocketServer } from 'ws';
import {v4 as uuid} from "uuid";
import {
    writeFile,
    readFileSync,
    existsSync
} from "fs";

/**
 * системный id
 * */
const SYSTEM = "SYSTEM";
const clients = {};

const log = existsSync('log') && readFileSync('log', 'utf-8');
const messages = log? JSON.parse(log) : [];

const wss = new WebSocketServer({
    port: 8000
});

wss.on("connection", ws => {
    const id = uuid();
    clients[id] = ws;

    console.log(`New client ${id} appeared`);
    Object.entries(clients).forEach(([clientId, clientWs]) => {
        if (clientId!==id) {
            clientWs.send(JSON.stringify([{
                id: SYSTEM,
                data: `New client ${id} appeared`
            }]))
        }
    })

    ws.send(JSON.stringify([{
        id: SYSTEM,
        data: `Your ID = ${id}`
    }]))
    /*отошлем также историю сообщений*/
    ws.send(JSON.stringify(messages))

    ws.on('message', (rawMessage) => {
        const data = JSON.parse(rawMessage);
        console.log(`client ${id}: ${data}`)
        messages.push({id, data});
        Object.values(clients).forEach(clientWs => {
            clientWs.send(JSON.stringify([{id, data}]))
        })
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