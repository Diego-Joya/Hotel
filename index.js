const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { logErrors, errorhandler } = require('./middlewares/error.handler');
const routerApi = require('./router')
const app = express();
const path = require('path');
const port = 3000;
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http:192.168.0.11:5173'
];


// app.use(cors({
//   origin: 'http://localhost:5173',
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
//   credentials: true,
// }));
app.use(cors({
  origin: function (origin, callback) {
    // Permite solicitudes sin origen (como desde Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
}));



app.use(logErrors);
app.use(errorhandler);
require('./utils/auth');

routerApi(app)

app.listen(port, () => {
  console.log("mi puerto es " + port);
})
