/* 
Note til mig selv:
- Lav Image og klasser færdigt
- Ryd op i koden og gør det mere overskueligt
- Lav responds til at starte med i endspoint så man ved, hvad man skal skrive
- Lav HTML fejl status sende
- Rapport
- Klassediagram
*/


//Initializes modules
const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser'); //For HTTP body-request
const app = express();
const port = 3000;

app.use(bodyParser.json());

//Private key for JWT-token
const privateKey = 'This is a privateKey';

//ARRAYS: ---------------------

//Arrays as list of users with properties.
var arrayUsers = [{
    username: 'Alex',
    password: 'mycodeissecret',
    gender: 'male',
    paymentUser: false
},
{
    username: "Hanne",
    password: "12345",
    gender: "female",
    creditCard: "3029-4938-2948-2948",
    paymentUser: true
}];

//Array with users interests
var arrayInterests = [{username: 'Alex', interest: 'I like cake, football, softball, icecream and Apple'}];

//Array with users and the users they liked
var arrayLikes = [
    {username: 'Alex', likes: ['Hanne', 'Sanne']},
    {username: 'Hanne', likes: ['Berda', 'Alex']}
];

//Array with matched users
var arrayMatch = [];


//CLASSES: -----------------

//Superclass for user-functionality
class User {
    constructor(username, password, gender) {
        this.username = username;
        this.password = password;
        this.gender = gender;
    };
    like() {
        //Should connect to Like class
    };
    dislike() {};
    changeInterests() {};
    uploadImages() {
        //Should connect to Image class
    };
};

//Subclass with paymentUser functionality
class PaymentUser extends User {
    constructor(username, password, gender, creditCard) {
        super(username, password, gender);
        this.creditCard = creditCard;
    };
    superlike() {};
};

//Subclass with freeUser functionality
class FreeUser extends User {
    constructor(username, password, gender) {
        super(username, password, gender);
    };
    likeLimits() {};
    changeInterestLimit() {
        //Methods where free users only can have limited interests.
    };
};


//Image class
class Image {
    constructor(fileName, fileType, fileDate, fileDescription, uploadDate) {
        this.fileName = fileName;
        this.fileDate = fileDate;
        this.fileType = fileType;
        this.fileDescription = fileDescription
        this.uploadDate = uploadDate;
    };

    //Methods to upload images

};

//Like/matchmaking class
class Likes {
    constructor() {};

    //Methods to matchmaking between two users.
};

//Match class
class Match {
    constructor(matchID, matchUser1, matchUser2) {
        this.matchID = matchID;
        this.matchUser1 = matchUser1;
        this.matchUser2 = matchUser2;
    };

    message() {};
    deleteMatch() {};
};

//LOGIN: -------------------

//Login system. Validates if user exists in database (array) and gives token if true 
app.post('/login', (req, res) => {
    
    //Validates if user exists
    const {username, password} = req.body;
    const user = arrayUsers.find(u => {return u.username === username && u.password === password});

    //Creates token or error message
    if (user) {
        let token = jwt.sign({username: user.username}, privateKey, {algorithm: 'HS256'});
        res.send(token);
    } else {
        res.status(404);
        res.send('Your username or password is incorrect. Remember to signup')
        
    };
});

//Validatefunction to validate users token
function isAuth(req, res, next) {
    if (typeof req.headers.authorization !== "undefined") {
        let token = req.headers.authorization;

        //Token validation
        jwt.verify(token, privateKey, {algorithm: "HS256"}, (err, decoded) => {
            //If an error occurred
            if (err) {
                res.status(500);
                throw new Error("Token is not accepted or an error occurred");
            }
            console.log(decoded)
            return next();
        });
    } else {
        //If an error occurred
        res.status(500);
        console.log(req.headers.authorization);
        throw new Error("Something went wrong with authentification");
    };
};


//HTTP-REQUESTS / ENDPOINTS ----------------

//Sign-up endpoint
app.post('/signup', (req, res) => {
    //Informs users what to inform
    res.send('Inform username, password, gender and eventuelly creditcard to sign up')
    
    let user;

    if (req.body.username == undefined) {
        res.status(404);
        res.send('Not done yet');
        return;
    }
    //Validates if username exists in database
    if (user = arrayUsers.find(u => {return u.username === req.body.username})) {
        res.status(404);
        res.send('The username exist. Chose another username');
        return;
    };

    //Decides if the user has chosen payment account
    //This part should be linked to paymentUser class
    if (req.body.creditCard !== undefined) {
        user = {
            username: req.body.username,
            password: req.body.password,
            gender: req.body.gender,
            creditCard: req.body.creditCard,
            paymentUser: true
        };
        arrayUsers.push(user);
        res.status(202);
        res.send("Your payment user has been created. Have fun!");
        return;
    };

    //If the user has chosen no payment option = free account
    //This part should be linked to freeUser class
    user = {
        username: req.body.username,
        password: req.body.password,
        gender: req.body.gender,
        paymentUser: false
    };
    arrayUsers.push(user);
    res.status(202);
    res.send("Your account without payment has been created. Remember you have limitations");


});

//Delete from userlist endpoint
app.delete('/users', isAuth, (req, res) => {

    //Validates username
    const user = arrayUsers.find(u => {return u.username === req.body.username})
    if (!user) {
        res.status(404);
        res.send(`User don't exists. Can't delete user`);
        return;
    };
    
    //Removes user from both all arrays
    const indexUsers = arrayUsers.indexOf(user);
    arrayUsers.splice(indexUsers, 1);

    const indexInterest = arrayInterests.indexOf(user);
    arrayInterests.splice(indexInterest, 1);

    const indexLikes = arrayLikes.indexOf(user);
    arrayLikes.splice(indexLikes, 1);
   
    res.status(200);
    res.send(`You'r user is deleted`);
});

//Gets userlist
app.get('/users', isAuth, (req, res) => {
    res.status(200);
    res.send(arrayUsers);
});

//Interest-endpoint list
app.get('/interest', isAuth, (req, res) => {
    res.status(200);
    res.send(arrayInterests);
});

//Post new interest
app.post('/interest', isAuth, (req, res) => {

    //Validates username
    let user = arrayUsers.find(u => {return u.username === req.body.username})
    if (!user) {
        res.send(403);
        res.send(`User don't exists. Can't create interest`);
        return;
    };

    user = {
        username: req.body.username,
        interest: req.body.interest
    };
    arrayInterests.push(user)
    res.status(202);
    res.send('Your interest is updated with ' + req.body.interest);
});

//Delete user interests
app.delete('/interest', isAuth, (req, res) => {

    //Validates username
    const user = arrayUsers.find(u => {return u.username === req.body.username})
    if (!user) {
        res.status(404);
        res.send(`User don't exists. Can't delete interests`);
        return;
    };
    const indexInterest = arrayInterests.indexOf(user);
    arrayInterests.splice(indexInterest, 1);
    res.status(202);
    res.send('Your interests are deleted');
});

//Likes/Matchmaking endpoint
//Get lists with likes
app.get('/likes', isAuth, (req, res)=> {
    res.status(200);
    res.send(arrayLikes);
});

//Post new likes
app.post('/likes', isAuth, (req, res)=> {

    //Validates username
    const user = arrayUsers.find(u => {return u.username === req.body.username})
    if (!user) {
        res.status(404);
        res.send('User do not exist');
        return;
    };

    //Post new likes
    let x = {
        username: req.body.username,
        likes: req.body.likes
    };

    arrayLikes.push(x);
    res.status(202);
    res.send('You do now like these users: ' + req.body.likes);

});

//This part doesn't work fully yet. -> Go to rapport
app.delete('/likes', isAuth, (req, res)=> {
    //Validates username
    const user = arrayLikes.find(u => {return u.username === req.body.username})
    if (!user) {
        res.status(404);
        res.send('User do not exist or has liked anyone yet');
        return;
    };

    const dislike = arrayUsers.find(u => {return u.dislike === req.body.dislike})

    //Removes all likes
    if (!dislike) {
        const iLike = arrayLikes.indexOf(user);
        arrayLikes.splice(iLike, 1);
        res.status(200);
        res.send('Your likes are now deleted') ;
        return;
    };

    //This part doesn't work yet. Should remove individual likes based on usernames
    const outArray = arrayLikes.indexOf(user);
    const inArray = arrayLikes[outArray].likes.indexOf(dislike);
    arrayLikes.splice(arrayLikes[outArray].likes[inArray],1);
    res.status(200);
    res.send('Your like of ' + req.body.dislike + " are now deleted");


});

//Match endpoint:

//Get match list
app.get('/match', isAuth, (req, res) => {
    res.status(200);
    res.send(arrayMatch);
});

//Go to report (rapporten), this part doesn't work as expected yet
app.post('/match', (req, res) => {
    const user = arrayUsers.find(u => {return u.username === req.body.username})
    const matchUser = arrayLikes.find(u => {return u.username === req.body.matchUser})

    //Validates if the user requesting exists
    if (!user) {
        res.status(404);
        res.send('User do not exist');
        return;
    };

    //Validates if matchUser exists or has ever liked someone (if in arrayLikes)
    if (!matchUser) {
        res.status(404);
        res.send('User dont exists or has liked anyone');
        return;
    };

    /* If matchUser exists in arrayLikes, then this part should validate if requesting user
    exists in the matchUsers inner likes-array */

    /* Til godkendelsesopgave 3: I kan se et af mine forsøg til det ovenstående herunder.
    Det har ikke lykkedes mig at få det til at virke korrekt endnu.*/
    var i = arrayLikes.indexOf(matchUser)
    var innerArray = arrayLikes[i].likes.includes(user)
    if (innerArray == false) {
        res.status(404);
        res.send(`The person ${matchUser} haven't liked you yet`);
        return;
    };

    //If both users have liked eachother, add new match to array with a MatchID
    let matchIdx = arrayMatch.length + 1
    let x = {
        matchId: matchIdx,
        matchUser1: req.body.username,
        matchUser2: req.body.matchUser 
    };
    arrayMatch.push(x);
    res.status(200);
    res.send(`You've now matched with ${matchUser}`);
    
});

//Server listening
app.listen(port, ()=> console.log('server on port 3000'));
