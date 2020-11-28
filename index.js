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

function getQuestions() {
  const jsonString = fileSystem.readFileSync('configs/questions.json');
  return JSON.parse(jsonString);
}

// Get questions from server
app.get('/questions', async (request, response) => {
  const questions = getQuestions();
  response.json(questions);
});

// Add quiz to the database
app.post('/answers', async (request, response) => {
  console.log(request.body);

  // Insert into quiz table
  let query =  "INSERT INTO quizzes(quiz_name) \
                VALUES ('" + request.body.name + "') \
                RETURNING quiz_id";
  console.log(query);
  let result = await pgClient.query(query);
  const quiz_id = result.rows[0].quiz_id;
  console.log(quiz_id);

  // Insert into answers table
  const values = [];
  const questions = getQuestions();
  questions.forEach((question) => {
    if (request.body[question._id]) {
      const valueStr = "('" + question._id + "', '" + quiz_id + "', '" + request.body[question._id] + "')";
      values.push(valueStr);
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
    console.log(query);
    await pgClient.query(query);
    response.redirect("/scoreboard/?success");
  } else {
    console.error("There were no question answers for quiz_id: '" + quiz_id + "'");
    response.redirect("/scoreboard/?failure");
  }
});

// Get answers from database
app.get('/answers', async (request, response) => {
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

  // convert quizes object to array
  const data = [];
  quiz_ids.forEach(quiz_id => {
    data.push(quizzes[quiz_id]);
  });
  response.json(data);
});

app.post('/answer', async (request, response) => {
  const quiz_id = request.body._id;
  // Get name
  let query =  "SELECT quiz_name \
                FROM quizzes \
                WHERE quiz_id = '" + quiz_id + "'";
  let result = await pgClient.query(query);
  const data = { name: result.rows[0].quiz_name };

  // get answers
  query =  "SELECT question_id, response \
            FROM quizzes \
            INNER JOIN answers \
            ON quizzes.quiz_id = answers.quiz_id \
            WHERE quizzes.quiz_id = '" + quiz_id + "'";
  result = await pgClient.query(query);
  result.rows.forEach((row) => {
    data[row.question_id] = row.response;
  });
  response.json(data);
});

// Ask the server if the quiz is open
app.get('/quizOpen', (request, response) => {
  response.json({ state: true });
})
