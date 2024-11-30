const jwt = require('jsonwebtoken');

const secret = 'jajaja';
const payload = {
    sub: 1,
    role: 'customer',
    expiresIn: '1h',
}

function signToken(payload, secret) {
    return jwt.sign(payload, secret);

}

const token = signToken(payload,secret);
console.log(token);