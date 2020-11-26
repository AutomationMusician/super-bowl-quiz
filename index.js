const express = require('express');
const pgClient = require('pg');
const fileSystem = require('fs');

const app = express();
const PORT = process.env.PORT;
app.listen(PORT, () => console.log('listening on port ' + PORT));
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded( { extended: true } ));

const pg = pgClient();
pg.connect();

app.get('/questions', async (request, response) => {
  const rawdata = fileSystem.readFileSync('questions.json');
  const questions = JSON.parse(rawdata);
  response.json(questions);
});

const answers = new datastore('answers2020.db');
answers.loadDatabase();
app.post('/answers', (request, response) => {
  answers.insert(request.body);
  response.send("<script>window.location.replace(\"/scoreboard/?success\");</script>");
});

app.get('/answers', (request, response) => {
  answers.find({}, (err, data) => {
    if (err) {
      console.log(err);
      response.send("An error in querying the answer database has occurred");
    } else {
      response.json(data);
    }
  });
});

app.post('/answer', (request, response) => {
  const userID = request.body._id;
  answers.findOne({_id: userID}, (err, data) => {
    if (err) {
      console.log(err);
      response.send("An error in querying the answer database has occurred");
    } else {
      response.json(data);
    }
  });
});

app.get('/answers2020.db', (request, response) => {
  const rawdata = fileSystem.readFileSync("answers2020.db");
  response.send(rawdata);
});

app.get('/quizOpen', (request, response) => {
  response.json({ state: false });
})

process.on('beforeExit', (code) => {
  console.log('Process beforeExit event with code: ', code);
  pg.end();
});