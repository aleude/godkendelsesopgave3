const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const bodyParser = require('body-parser'); //For HTTP body-request
const app = express();
const port  = 3000;

//Login and authentication

app.post('/login', (req, res) => {
    const {username, password} = req.body;
    const user = arrayUsers.find(u => {return u.username === username && u.password === password});

    if (user) {let privateKey = fs.readFileSync('./private.pem', 'utf8');
    let token = jwt.sign({username: user.username}, privateKey, {algorithm: 'HS256'});
    res.send(token);
    } else {
        res.send('Your username or password is incorrect. You can also signup')
    }
});

function isAuth(req, res, next) {
    if (typeof req.headers.authorization !== "undefined") {
        let token = req.headers.authorization;
        let privateKey = fs.readFileSync('./private.pem', 'utf8');
        
        //Token validation
        jwt.verify(token, privateKey, {algorithm: "HS256"}, (err, decoded) => {
            //If an error occured
            if (err) {
                res.status(500).json({ error: "Ikke godkendt"});
                throw new Error("Ikke godkendt igen");
            }
            console.log(decoded)
            return next();
        });
    } else {
        res.status(500).json({ error: "Undefined fejl :(. Husk at sætte key til authentification"});
        console.log(req.headers.authorization);
        throw new Error("Undefined fejl dog");
    };
};
