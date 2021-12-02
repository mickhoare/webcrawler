/*  ------------------------------------------------------------------------------------
    index.js

    node/express index.js request handler
    ------------------------------------------------------------------------------------- */

const express = require('express');
const webcrawler = require('./webcrawler');
const endPointsString = "0.0.0.0";

const port = process.env.PORT || 3000;
const app = express();

app.get('/webcrawler/test', async function (req, res, next) {
    let apiRequest = req.body || {};
    apiRequest.urlTarget = req.query.url || "https://therecount.github.io/interview-materials/project-a/1.html";
    let results = await webcrawler.test(apiRequest);
    res.status(200).send(results);
});

console.log("wc.Api().Start(port{" + port + "}) = OK...");
app.listen(port, endPointsString);
