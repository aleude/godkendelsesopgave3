//Initialize
const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser'); //For HTTP body-request
const app = express();
const port  = 3000;

app.use(bodyParser.json());

//Classes

class User {
    constructor(username, password, gender) {
        this.username = username;
        this.password = password;
        this.gender = gender;
    }
    like() {};
    dislike() {};
}

class paymentUser extends User {
    constructor(username, password, gender, creditCard) {
        super(username, password, gender);
        this.creditCard = creditCard;
    }
    superlike() {};
}

class freeUser extends User {
    constructor(username, password, gender) {
        super(username, password, gender);
    }
    likeLimits() {};
}

//HTTP

var users = [{
    username: 'alex',
    password: '1234',
    gender: 'male',
    paymentUser: false
}];

var usersInterest = [{username: 'alex', interest: 'I like Apple'}];




app.post('/users', (req, res) => {
    //Validere, om der er et username.
    let user;

    if (req.body.username == undefined) {
        res.send('Something went wrong');
        return;
    }
    //Validere om brugeren eksisterer i forvejen
    if (user = users.find(u => {return u.username === req.body.username})) {
        res.send('Findes')
        return;
    } 

    //Decides if the user has paid
    if (req.body.creditCard !== undefined) {
        user = {
            username: req.body.username,
            password: req.body.password,
            gender: req.body.gender,
            creditCard: req.body.creditCard,
            paymentUser: true
        }
        users.push(user);
        res.send("Your paid account is created");
        return;
    }

    //If the user hasn't paid
    user = {
        username: req.body.username,
        password: req.body.password,
        gender: req.body.gender,
        paymentUser: false
    }
    users.push(user);
    res.send("Your free account is created");


});

app.delete('/users', (req, res) => {

    //Validates if the user exists or not
    const user = users.find(u => {return u.username === req.body.username})
    if (!user) {
        res.send('User do not exists. Cannot delete');
        return;
    }
    
    //Removes user from both user- and interestlist
    const indexUsers = users.indexOf(user);
    users.splice(indexUsers, 1);

    const indexInterest = usersInterest.indexOf(user);
    usersInterest.splice(indexInterest, 1);
    res.send('User deleted')
})

app.get('/users', (req, res) => {
    res.json(users);
    //Not done yet
})

//Interest endpoint

app.get('/interest', (req, res) => {
    res.send(usersInterest);
    //Not done yet
})

app.post('/interest', (req, res) => {
    let user = users.find(u => {return u.username === req.body.username})
    if (!user) {
        res.send('User do not exists. Cannot create interest');
        return;
    }
    user = {
        username: req.body.username,
        interest: req.body.interest
    }
    usersInterest.push(user)
    res.send('Your interest is updated with' + req.body.interest);
});


app.delete('/interest', (req, res) => {
    //Validates if the user exists or not
    const user = users.find(u => {return u.username === req.body.username})
    if (!user) {
        res.send('User do not exists. Cannot delete interest');
        return;
    }
    const indexInterest = usersInterest.indexOf(user);
    usersInterest.splice(indexInterest, 1);

    res.send('Your interest is deleted')
})




app.listen(port, ()=> console.log('server on port 3000'));
