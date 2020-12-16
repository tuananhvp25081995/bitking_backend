const ticketService = require('../middle/TIcketService');

const data = []

exports.length = function length() {
    return data.length;
}

exports.enqueue = function enqueue(item) {
    data.unshift(item)
    return true;
}

function dequeue() {
    let item = data.pop()
    return item;
}

exports.checkQueue = async function checkQueue() {
    while (data.length != 0) {
        const value = dequeue()
        try {
            await ticketService.UpdateTicket(value)
        } catch (e) {
            console.log("whileloop error:", e);
        }
    }
}