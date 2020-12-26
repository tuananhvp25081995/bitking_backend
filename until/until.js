let { v4: uuidv4 } = require('uuid');

function uuid() {
    return uuidv4().slice(0, 8)
}

module.exports = { uuid }