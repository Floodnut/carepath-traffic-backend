/* dependency */
const express = require("express");

/* route */
let routing = require("./route/routing");

/* 상수 */
const app = express();
const PORT = 9002;
const HOST = '0.0.0.0';

app.get("/routing", routing); 

app.listen(PORT, () => {
    console.log(`${new Date} \n-->> Server start on ${HOST}:${PORT}`)
})
