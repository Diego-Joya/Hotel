const jwt = require('jsonwebtoken');

const secret = 'jajaja';
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInJvbGUiOiJjdXN0b21lciIsImlhdCI6MTczMTQ0NzI0M30.UBmqwz0I6GqHY12ki4rv1HU6T_AZGxrttBqkle5A6GU";
function verifyToken(token, secret) {
    return jwt.verify(token, secret);
}

const payload = verifyToken(token, secret);
console.log(payload);