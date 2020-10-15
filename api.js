/* 
Note til mig selv:
- Lav Image og klasser færdigt
- Ryd op i koden og gør det mere overskueligt
- Lav responds til at starte med i endspoint så man ved, hvad man skal skrive
- Lav HTML fejl status sende
- Rapport
*/


//Initialize
const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const bodyParser = require('body-parser'); //For HTTP body-request
const app = express();
const port  = 3000;

app.use(bodyParser.json());

var arrayUsers = [{
    username: 'Alex',
    password: '1234',
    gender: 'male',
    paymentUser: false
},
{
    username: "Hanne",
    password: "12345",
    gender: "female",
    paymentUser: false
}];

var arrayInterests = [{username: 'Alex', interest: 'I like cake'}];

var arrayLikes = [
    {username: 'Alex', likes: ['Hanne', 'Sanne']},
    {username: 'Hanne', likes: ['Berda', 'Alex']}
];

var arrayMatch = [];

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
                throw new Error("Ikke godkendt dog");
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

//HTTP

app.post('/signup', (req, res) => {
    //Validere, om der er et username.
    res.send('To sign up, give username, password, gender and if you want: creditcard')
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

app.delete('/users', isAuth, (req, res) => {

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

app.get('/users', isAuth, (req, res) => {
    res.json(arrayUsers);
    //Not done yet
})

//Interest endpoint

app.get('/interest', isAuth, (req, res) => {
    res.send(arrayInterests);
    //Not done yet
})

app.post('/interest', isAuth, (req, res) => {
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


app.delete('/interest', isAuth, (req, res) => {
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

app.get('/likes', isAuth, (req, res)=> {
    res.send(arrayLikes);
    //Not done yet
})

app.post('/likes', isAuth, (req, res)=> {
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
app.delete('/likes', isAuth, (req, res)=> {
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

app.get('/match', isAuth, (req, res) => {
    res.send(arrayMatch);
})

//Not totally done, therefore no authentification yet.
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

//Login-system v1
/*
app.post('/login', (req, res) => {
    const {username, password } = req.body;
    const user = arrayUsers.find(u => {return u.username === username && u.password === password});

    if (user) {
        const accessToken = jwt.sign({ username: user.username}, privateKey, { algorithm: "HS256" });
        res.json({accessToken});
    } else {
        res.send('Your username or password is incorrect')
    }
});

//Authentification function
function isAuth(req, res, next) {
    if (typeof req.headers.authorization !== "undefined") {
        let token = req.headers.authorization;

        //Token validation
        jwt.verify(token, privateKey, { algorithm: "HS256"}, (err, decoded) => {
            //If an error occured
            if (err) {
                res.status(500).json({ error: "Ikke godkendt"});
                throw new Error("Ikke godkendt dog");
            }
            console.log(decoded)
            return next();
        });
    } else {
        res.status(500).json({ error: "Undefined fejl :("});
        console.log(req.headers.authorization);
        throw new Error("Undefined fejl dog");
    };
};


/*
app.post('/token', (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.send('Fejl token1');
    };
    
    if (!refreshToken.includes(token)) {
        return res.send('Fejl token2');
    };

    jwt.verify(token, refreshTokenSecret, (err, user) => {
        if (err) {
            return res.send('Error i token secret');
        };

        const accessToken = jwt.sign({username: user.username}, accessToken, {expiresIn: '20m'});
        
        res.json({
            accessToken
        });
    });

});

app.post('/logout', (req, res) => {
    const { token } = req.body;
    refreshTokens = refreshTokens.filter(token => t !== token);

    res.send('You logout good :))')
})
*/

app.listen(port, ()=> console.log('server on port 3000'));
