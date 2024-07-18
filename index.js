const express = require('express');
const cors = require('cors');
const { logErrors, errorhandler } = require('./middlewares/error.handler');
const routerApi = require('./router')
const app = express();
const port = 3000;
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
}));
app.use(logErrors);
app.use(errorhandler);

routerApi(app)

app.listen(port, () => {
  console.log("mi puerto es " + port);
})
