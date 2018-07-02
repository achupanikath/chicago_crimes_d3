//server side code to provide endpoints and value
//express is used to give the endpoints using jqueries
const express = require("express");
const app = express();
const file = require("./webData.json");//the already written file is used
const bodyParser = require('body-parser')

app.use(bodyParser.json());

app.use(function (req, res, next) {//In case I needed POST
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.get('/primarylist', function (req, res) {//for this endpoint we send the list

    let arr = [];
    arr = file.map(function (elem) {
        return Object.keys(elem)[0];
    })//makes an array of the keys- the list of Primary Types
    res.send(arr);
});


app.get('/arrestgraph/:primary', function (req, res) {
    let sample = req.params.primary;//accepts the choices as query parameter string
    let sampleArray=[]=sample.split(",");//string is split into array using ',' delimiter
    let arr = [];
    //the keys are stored and sent as response
    sampleArray.forEach((item) => {
        file.forEach((elem)=>{
            if(item===Object.keys(elem)[0])
            {
                arr.push(elem);
            }
        });
    });
    res.send(arr);
});

//the following is the server's local host
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`App is listening on port ${port}...`));