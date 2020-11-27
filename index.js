const express = require('express');
const { Client } = require('pg');
const fileSystem = require('fs');

const app = express();
const PORT = process.env.WEB_PORT;
app.listen(PORT, () => console.log('listening on port ' + PORT));
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded( { extended: true } ));

const pgClient = new Client({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT
});
pgClient.connect();

app.get('/questions', async (request, response) => {
  const rawdata = fileSystem.readFileSync('configs/questions.json');
  const questions = JSON.parse(rawdata);
  response.json(questions);
});

app.post('/answers', (request, response) => {
  const result = pgClient.query('INSERT INTO quizzes(quiz_name) VALUES (' + request.body.name + ')');
  // TODO add stuff for each thing
  response.redirect("/scoreboard/?success");
});

app.get('/answers', (request, response) => {
  answers.find({}, (err, data) => {
    if (err) {å
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

app.get('/quizOpen', (request, response) => {
  response.json({ state: false });
})

process.on('beforeExit', (code) => {
  console.log('Process beforeExit event with code: ', code);
  pgClient.end();
});