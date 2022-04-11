/* dependency */
const express = require("express");

/* route */
let routing = require("./route/routing");

/* 상수 */
const app = express();
const PORT = process.env.PORT;
const HOST = process.env.HOST;

app.get("/routing", routing); 

app.listen(PORT, () => {
    console.log(`${new Date} \n-->> Server start on ${HOST}:${PORT}`)
})