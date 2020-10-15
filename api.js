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

class Image {

};

//HTTP

var arrayUsers = [{
    username: 'Alex',
    password: '1234',
    gender: 'male',
    paymentUser: false
},
{
    username: "Hanne",
    password: "1234",
    gender: "female",
    paymentUser: false
}];

var arrayInterests = [{username: 'Alex', interest: 'I like cake'}];

var arrayLikes = [
    {username: 'Alex', likes: ['Hanne', 'Sanne']},
    {username: 'Hanne', likes: ['Berda', 'Alex']}
];

var arrayMatch = [];

app.post('/users', (req, res) => {
    //Validere, om der er et username.
    let user;

    if (req.body.username == undefined) {
        res.send('Something went wrong');
        return;
    }
    //Validere om brugeren eksisterer i forvejen
    if (user = arrayUsers.find(u => {return u.username === req.body.username})) {
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
        arrayUsers.push(user);
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
    arrayUsers.push(user);
    res.send("Your free account is created");


});

app.delete('/users', (req, res) => {

    //Validates if the user exists or not
    const user = arrayUsers.find(u => {return u.username === req.body.username})
    if (!user) {
        res.send('User do not exists. Cannot delete');
        return;
    }
    
    //Removes user from both user- and interestlist
    const indexUsers = arrayUsers.indexOf(user);
    arrayUsers.splice(indexUsers, 1);

    const indexInterest = arrayInterests.indexOf(user);
    arrayInterests.splice(indexInterest, 1);
    res.send('User deleted')
})

app.get('/users', (req, res) => {
    res.json(arrayUsers);
    //Not done yet
})

//Interest endpoint

app.get('/interest', (req, res) => {
    res.send(arrayInterests);
    //Not done yet
})

app.post('/interest', (req, res) => {
    let user = arrayUsers.find(u => {return u.username === req.body.username})
    if (!user) {
        res.send('User do not exists. Cannot create interest');
        return;
    }
    user = {
        username: req.body.username,
        interest: req.body.interest
    }
    arrayInterests.push(user)
    res.send('Your interest is updated with' + req.body.interest);
});


app.delete('/interest', (req, res) => {
    //Validates if the user exists or not
    const user = arrayUsers.find(u => {return u.username === req.body.username})
    if (!user) {
        res.send('User do not exists. Cannot delete interest');
        return;
    }
    const indexInterest = arrayInterests.indexOf(user);
    arrayInterests.splice(indexInterest, 1);

    res.send('Your interest is deleted')
})

//Match

app.get('/likes', (req, res)=> {
    res.send(arrayLikes);
    //Not done yet
})

app.post('/likes', (req, res)=> {
    const user = arrayUsers.find(u => {return u.username === req.body.username})
    if (!user) {
        res.send('User do not exist');
        return;
    };

    let x = {
        username: req.body.username,
        likes: req.body.likes
    }

    arrayLikes.push(x);
    res.send('You do now like these users: ' + req.body.likes);

});

//IMPORTANT: DOESN'T WORK OPTIMAL, NEED FIX
app.delete('/likes', (req, res)=> {
    const user = arrayLikes.find(u => {return u.username === req.body.username})
    if (!user) {
        res.send('User do not exist or has liked anyone yet');
        return;
    };

    const dislike = arrayUsers.find(u => {return u.dislike === req.body.dislike})

    if (!dislike) {
        const iLike = arrayLikes.indexOf(user);
        arrayLikes.splice(iLike, 1);
        res.send('Your likes are now deleted') 
        return;
    }

    const outArray = arrayLikes.indexOf(user);
    const inArray = arrayLikes[outArray].likes.indexOf(dislike);
    arrayLikes.splice(arrayLikes[outArray].likes[inArray],1);
    res.send('Your like of ' + req.body.dislike + " are now deleted");


})

//Match

app.get('/match', (req, res) => {
    res.send(arrayMatch);
})

app.post('/match', (req, res) => {
    const user = arrayUsers.find(u => {return u.username === req.body.username})
    const matchUser = arrayLikes.find(u => {return u.username === req.body.matchUser})

    //validates if the user requesting exists
    if (!user) {
        res.send('User do not exist');
        return;
    };

    //validates if matchUser exists or has ever liked someone (if in arrayLikes)
    if (!matchUser) {
        res.send('User dont exists or has liked anyone');
        return;
    }

    /* If matchUser exists in arrayLikes, then this part should validate if requesting user
    exists in the matchUsers inner likes-array */

    /* Til vejledere: Det er denne del her, jeg skal lave kode til, som jeg ikke
    kan finde ud af. Et af mine forsøg er herunder*/
    var i = arrayLikes.indexOf(matchUser)
    var innerArray = arrayLikes[i].likes.includes(user)
    if (innerArray == false) {
        res.send(`The person ${matchUser} haven't liked you yet`)
        return;
    }

    //If both users have liked eachother, add new match to array
    let matchIdx = arrayMatch.length + 1
    let x = {
        matchId: matchIdx,
        user1: req.body.username,
        user2: req.body.matchUser 
    }
    arrayMatch.push(x);
    res.send(`You've now matched with ${matchUser}`);
    
});




app.listen(port, ()=> console.log('server on port 3000'));
