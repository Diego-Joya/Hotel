const express = require('express');
const {logErrors, errorhandler} = require('./middlewares/error.handler');
const routerApi= require('./router')
const app = express();
const port = 3000;
app.use(express.json());
app.use(logErrors);
app.use(errorhandler);

routerApi(app)

app.listen(port,()=>{
  console.log("mi puerto es " + port);
})
