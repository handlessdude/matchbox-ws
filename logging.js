/**
 * системный id
 * */
const SYSTEM = "SYSTEM";

export const sendToClient = (_ws, message) => {
    _ws.send(JSON.stringify([{
        id: SYSTEM,
        message
    }]))
}
export const sendArrayToClient = (_ws, messages) => {
    _ws.send(JSON.stringify(messages))
}
export const logOnServer = (message) => {
    console.log(message)
}