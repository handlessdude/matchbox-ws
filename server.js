import { WebSocketServer } from 'ws';
import {hri} from "human-readable-ids";
const Actions = ["1","2","3"]
let gameState = {
    matches: 33,
    lastTurn: {
        clientId: '',
        action: ''
    },
    loser: null
}
/**
 * chooses what to do.
 * */
export function actionReducer( clientId, action ) {
    logOnServer("===============================================================")

    logOnServer(gameState)

    if(Actions.includes(action)) {
        let newMatches = gameState.matches;
        logOnServer(newMatches)
        if(clientId===gameState.lastTurn.clientId && gameState.matches>1){
            /*if its player of last turn who wants to change their amount of matches taken we'll provide that opportunity.*/
            newMatches += Number(gameState.lastTurn.action)
            logOnServer(' after plus ', newMatches)
        }
        newMatches -= Number(action)
        logOnServer(' after minus ', newMatches)

        gameState = {
            ...gameState,
            matches: newMatches,
            lastTurn: {
                clientId,
                action
            },
        }
        logOnServer(gameState)
        logOnServer("===============================================================")
        return true
    }
    return false
}
import {sendToClient, logOnServer } from "./logging.js"

const clients = {};
const twoPlayersAppeared = () => Object.keys(clients).length>1

const wss = new WebSocketServer({
    port: 8000
});
wss.on("connection", ws => {
    if(twoPlayersAppeared()){
        sendToClient(ws, `Too many players on server. Try join later.`)
        ws.close()
        return
    }
    const id = hri.random();
    clients[id] = ws;

    sendToClient(ws, `Your ID = ${id}`)

    logOnServer(`New client ${id} appeared`);
    Object.entries(clients).forEach(([clientId, clientWs]) => {
        if (clientId!==id || twoPlayersAppeared()) {
            sendToClient(clientWs, `${clientId!==id? `New client ${id} appeared. ` : ``} ${twoPlayersAppeared()? 'Two players here. Game start!' : ''}`)
        }
    })

    ws.on('message', (rawMessage) => {
        const action = JSON.parse(rawMessage);
        logOnServer(`client ${id}: ${action}`, typeof action)
        if(!twoPlayersAppeared()) {
            sendToClient(ws, "Second player did not arrived yet. Be patient!")
            return
        }
        const amIPrevPlayer = id===gameState.lastTurn.clientId
        if(actionReducer(id, action)){
            const gameIsOver = gameState.matches <= 0
            const message = gameIsOver? `Game is over!\n${gameState.lastTurn.clientId} has taken all the matches!\nThe winner is ${Object.keys(clients).find((key) => key!==gameState.lastTurn.clientId)}!!!!!!!!!!!!!!!`
                                        :`client ${id} ${amIPrevPlayer? "changes their mind and ":""} takes ${action} matches.\nMatches on the table: ${gameState.matches}`
            logOnServer(message)
            Object.values(clients).forEach(clientWs => {
                sendToClient(clientWs, message)
            })
            if(gameIsOver){
                Object.values(clients).forEach(clientWs => clientWs.close())
            }
        } else {
            sendToClient(ws,`Unknown action: ${action}. Try something else!`)
        }
    })

    ws.on('close', () => {
        delete clients[id];
        logOnServer(`Client is closed ${id}`)
    })
})
