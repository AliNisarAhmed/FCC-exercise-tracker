// server.js
// where your node app starts

// init project
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const { User } = require('./userModel');
const { Exercise } = require('./exerciseModel');
const connect = require('./mongoose');

app.use(bodyParser.urlencoded({extended: false}));

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.post('/api/exercise/new-user', (req, res) => {
  console.log(req.body.username);
  let user = new User({
    username: req.body.username,
  });
  user.save().then((doc) => {
    res.json({
      username: doc.username,
      _id: doc._id
    })
  }, (e) => {
    console.log('error :', e);
    res.send(e.message);
  })
})

const PORT = process.env.port || 3000;

connect('mongodb://localhost:27017/exercise')
  .then(() => app.listen(3000, () => {
    console.log('server on http://localhost:3000')
  }))
  .catch(e => console.error(e))


// When you register with a username, it checks whether the unsername is unique
// ..if unique, sends json username and _id back

// When a user submits an exercise, json response includes
// .. username
// .. description
// .. duration
// .. _id (of the user)
// .. date "Sun Nov 18 2018"

// When asled for exercise data, json response includes
// .. _id
// .. username
// .. count of logs  // length of log array
// .. log []  // array of exercises
// .. ..  { description, duration, date }  // exercise model