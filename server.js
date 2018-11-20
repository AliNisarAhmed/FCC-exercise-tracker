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

app.post('/api/exercise/new-user', async (req, res) => {
  try {
    let username = req.body.username.trim();
    console.log('username :', username);
    let userFromDb = await User.findOne({ username }).exec();
    if (userFromDb) {
      res.send("Username already exists, please create another one")
    } else {
      let user = await User.create({
        username
      });
      res.json({
        _id: user._id,
        username
      });
    }
  } catch (error) {
    res.send(error.message);
  }
});

app.post('/api/exercise/add', async (req, res) => {
  try {
    const { userId, description, duration, date } = req.body;
    console.log('userId :', userId);
    console.log('description :', description);
    console.log('duration :', duration, typeof duration);
    console.log('date :', date);
    let user = await User.findById(userId).exec();
    if (!user) {
      res.send('User does not exist')
    } else {
      let exercise = await Exercise.create({
        userId: user._id,
        description: description.trim(),
        duration: Number(duration),
        date: new Date(date) 
      });
      res.status(201).json(exercise);
    }
    
  } catch (error) {
    res.send(error.message);
  }
});

app.get('/api/exercise/log', async (req, res) => {   //?{userId} &[from] &[to] &[limit]
  console.log(req.query);
  let { userId } = req.query;
  let user = await User.findById(userId).populate('log.exercise').exec();
  if (!user) {
    res.send("User not found, please check the id");
  } else {
    res.json(user);
  }
});

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