// -- USEFUL LINKS
// -- https://stackoverflow.com/questions/11303294/querying-after-populate-in-mongoose
// -- https://stackoverflow.com/questions/37571722/mongoose-date-comparison
// -- Mongoose Populate Docs


// When you register with a username, it checks whether the unsername is unique
// ..if unique, sends json username and _id back

// When a user submits an exercise, json response includes
// .. username
// .. description
// .. duration
// .. _id (of the user)
// .. date "Sun Nov 18 2018"

// When asked for exercise data, json response includes
// .. _id
// .. username
// .. count of logs  // length of log array
// .. log []  // array of exercises
// .. ..  { description, duration, date }  // exercise model


const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const { User } = require('./userModel');
const { Exercise } = require('./exerciseModel');
const connect = require('./mongoose');

app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static('public'));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.post('/api/exercise/new-user', async (req, res) => {
  try {
    let username = req.body.username.trim();
    // console.log('username :', username);
    let userFromDb = await User.findOne({ username }).exec();
    if (userFromDb) {
      res.send("Username already exists, please create another one")
    } else {
      let user = await User.create({
        username
      });
      res.status(201).json({
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
    let { userId, description, duration, date } = req.body;
    // console.log('userId :', userId);
    // console.log('description :', description);
    // console.log('duration :', duration, typeof duration);
    // console.log('date :', date);
    date = new Date(date);
    let dateUnix = date.valueOf()
    let user = await User.findById(userId).exec();
    if (!user) {
      res.send('User does not exist')
    } else {
      let exercise = await Exercise.create({
        userId: user._id,
        description: description.trim(),
        duration: Number(duration),
        date: dateUnix 
      });
      await User.findByIdAndUpdate(user._id, {$push: {log: exercise._id}});
      res.status(201).json({
        userId: exercise.userId,
        description: exercise.description,
        duration: exercise.duration,
        date: (new Date(dateUnix)).toDateString()
      });
    }
  } catch (error) {
    res.send(error.message);
  }
});

app.get('/api/exercise/log', async (req, res) => {   //?{userId} &[from] &[to] &[limit]
  // console.log(req.query);
  try {
    let { userId, from:fromDate, to:toDate, limit } = req.query;
    fromDate = fromDate || '2010-01-01';
    toDate = toDate || '2020-01-01';
    fromDate = (new Date(fromDate)).valueOf();
    toDate = (new Date(toDate)).valueOf();

    // console.log('fromDate: ', fromDate);
    // console.log('toDate: ', toDate);

    let user = await User.findById(userId).exec();
    if (!user) {
      res.send("User not found, please check the id");
    } else {
      let filtered = await User.findById(userId).select('-__v').populate({
        path: 'log',
        match: { date: { $gte: fromDate, $lte: toDate }},
        options: { limit: limit},
        select: '-_id -__v'
      }).exec();

      let newLog = filtered.log.map(exercise => {
        // console.log(exercise);
        return {
          date: (new Date(exercise.date)).toDateString(),
          userId: exercise.userId,
          description: exercise.description,
          duration: exercise.duration
        };
      })

      res.json({
        _id: filtered._id,
        username: filtered.username,
        count: filtered.log.length,
        log: newLog,
      });
       
    }
  } catch (error) {
    res.send(error.message);
  }
});

const PORT = process.env.port || 3000;

connect('mongodb://localhost:27017/exercise')
  .then(() => app.listen(3000, () => {
    console.log('server on http://localhost:3000')
  }))
  .catch(e => console.error(e))

