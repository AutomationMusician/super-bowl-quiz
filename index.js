const express = require('express');
const { Client } = require('pg');
const fs = require('fs');

const app = express();
const PORT = process.env.WEB_PORT || 3000;
app.listen(PORT, () => console.log('listening on port ' + PORT));
app.use(express.static(__dirname + '/dist'));
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

function getQuestions() {
  const jsonString = fs.readFileSync('configs/questions.json');
  return JSON.parse(jsonString);
}

function getState() {
  const jsonString = fs.readFileSync('configs/state.json');
  return JSON.parse(jsonString);
}

// Get questions from server
app.get('/api/questions', async (request, response) => {
  const questions = getQuestions();
  response.json(questions);
});

// Add quiz to the database
app.post('/api/answers', async (request, response) => {
  // Check if quiz is open
  const open = getState().open;
  if (!open) {
    console.error("The submitted quiz with the name '" + request.body.name + "' was rejected because the quiz is closed.");
    response.redirect("/scoreboard/?failure");
    return;
  }

  // Insert into quiz table
  let query =  "INSERT INTO quizzes(quiz_name) \
                VALUES ($1) \
                RETURNING quiz_id";
  let params = [request.body.name];
  let result = await pgClient.query(query, params);
  const quiz_id = result.rows[0].quiz_id;

  // Insert into answers table
  const values = [];
  params = [];
  let paramIndex = 1;
  const questions = getQuestions();
  questions.forEach((question) => {
    if (request.body[question._id]) {
      params.push(question._id);
      params.push(quiz_id);
      params.push(request.body[question._id]);
      const valueStr = "($" + paramIndex + ", $" + (paramIndex+1) + ", $" + (paramIndex+2) + ")";
      values.push(valueStr);
      paramIndex += 3;
    } else {
      console.error("Question id '" + question._id + "' does not exist");
    }
  });

  if (values.length > 0) {
    const queryArray = ["INSERT INTO answers(question_id, quiz_id, response) VALUES"];
    values.forEach((valueStr, index) => {
      queryArray.push(" \n");
      queryArray.push(valueStr);
      if (index < values.length - 1) {
        queryArray.push(",");
      } else {
        queryArray.push(";");
      }
    });
    query = queryArray.join('');
    await pgClient.query(query, params);
    console.log("'" + request.body.name + "' submitted a quiz");
    response.redirect("/scoreboard/?success");
  } else {
    console.error("There were no question answers for quiz_id: '" + quiz_id + "'");
    response.redirect("/scoreboard/?failure");
  }
});

// Get answers from database
app.get('/api/answers', async (request, response) => {
  const quizzes = {};
  const quiz_ids = [];

  // Get names
  let query =  "SELECT quiz_id, quiz_name FROM quizzes";
  let result = await pgClient.query(query);
  result.rows.forEach((row) => {
    quizzes[row.quiz_id] = { _id: row.quiz_id, name: row.quiz_name };
    quiz_ids.push(row.quiz_id);
  });

  // get answers
  query =  "SELECT quizzes.quiz_id, question_id, response \
            FROM quizzes \
            INNER JOIN answers \
            ON quizzes.quiz_id = answers.quiz_id";
  result = await pgClient.query(query);
  result.rows.forEach((row) => {
    quizzes[row.quiz_id][row.question_id] = row.response;
  });

  // convert quizzes object to an array
  const data = [];
  quiz_ids.forEach(quiz_id => {
    data.push(quizzes[quiz_id]);
  });
  response.json(data);
});

app.post('/api/answer', async (request, response) => {
  const quiz_id = request.body._id;
  // Get name
  let query =  "SELECT quiz_name \
                FROM quizzes \
                WHERE quiz_id = $1";
  let params = [quiz_id];
  let result = await pgClient.query(query, params);
  const data = { name: result.rows[0].quiz_name };

  // get answers
  query =  "SELECT question_id, response \
            FROM quizzes \
            INNER JOIN answers \
            ON quizzes.quiz_id = answers.quiz_id \
            WHERE quizzes.quiz_id = $1";
  params = [quiz_id];
  result = await pgClient.query(query, params);
  result.rows.forEach((row) => {
    data[row.question_id] = row.response;
  });
  response.json(data);
});

// Ask the server if the quiz is open
app.get('/api/quizState', (request, response) => {
  const state = getState();
  response.json(state);
})

// Default 404 response
app.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!");
})