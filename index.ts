
import * as express_core from 'express-serve-static-core';
import * as pg from 'pg';
import { Question, State, Quiz } from './interfaces';
const express = require('express');
const fs = require('fs').promises;
require('dotenv').config();

const app : express_core.Express = express();
const PORT : number = parseInt(process.env['WEB_PORT'] || '3000');
app.listen(PORT, () => console.log('listening on port ' + PORT));
app.use(express.static(__dirname + '/dist/client'));
app.use(express.json());
app.use(express.urlencoded( { extended: true } ));

const pgClient : pg.Client = new pg.Client();
pgClient.connect();

// get questions from questions.json
async function getQuestions() : Promise<Question[]> {
  const jsonString : string = await fs.readFile('configs/questions.json');
  return JSON.parse(jsonString) as Question[];
}

// get state from stat.json
async function getState() : Promise<State> {
  const jsonString : string = await fs.readFile('configs/state.json');
  return JSON.parse(jsonString) as State;
}

// Get questions from server
app.get('/api/questions', async (request : express_core.Request, response : express_core.Response) => {
  const questions : Question[] = await getQuestions();
  response.json(questions);
});

// Add quiz to the database
app.post('/api/answers', async (request : express_core.Request, response : express_core.Response) => {
  // Check if quiz is open
  const state : State = await getState();
  const open : boolean = state.open;
  if (!open) {
    console.error("The submitted quiz with the name '" + request.body.name + "' was rejected because the quiz is closed.");
    response.redirect("/scoreboard/?failure");
    return;
  }

  // Insert into quiz table
  let query : string = "INSERT INTO quizzes(quiz_name) \
                        VALUES ($1) \
                        RETURNING id";
  let params : any[] = [request.body.name];
  let result : pg.QueryResult = await pgClient.query(query, params);
  const quiz_id : number = result.rows[0].id;

  // Insert into answers table
  const values : string[] = [];
  params = [];
  let paramIndex : number = 1;
  const questions : Question[] = await getQuestions();
  questions.forEach((question : Question) => {
    const response : string | undefined = request.body[question.id];
    if (response) {
      params.push(question.id);
      params.push(quiz_id);
      params.push(response);
      const valueStr : string = "($" + paramIndex + ", $" + (paramIndex+1) + ", $" + (paramIndex+2) + ")";
      values.push(valueStr);
      paramIndex += 3;
    } else {
      console.error("Question id '" + question.id + "' does not exist");
    }
  });

  if (values.length > 0) {
    const queryArray : string[] = ["INSERT INTO answers(question_id, quiz_id, response) VALUES"];
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
app.get('/api/answers', async (request : express_core.Request, response : express_core.Response) => {
  const quizzes = new Map<number, Quiz>();
  const quiz_ids : number[] = [];

  // Get names
  let query : string = "SELECT id, name FROM quizzes";
  let result : pg.QueryResult = await pgClient.query(query);
  result.rows.forEach((row) => {
    quizzes.set(row.id, { 
      id: row.id, 
      name: row.name,
      responses: new Map<string, string>()
    });
    quiz_ids.push(row.id);
  });

  // get answers
  query = "SELECT quizzes.quiz_id, question_id, response \
           FROM quizzes \
           INNER JOIN answers \
           ON quizzes.quiz_id = answers.quiz_id";
  result = await pgClient.query(query);
  result.rows.forEach((row) => {
    quizzes.get(row.quiz_id)?.responses.set(row.question_id, row.response);
  });

  // convert quizzes object to an array
  const data : Quiz[] = [];
  quiz_ids.forEach(id => {
    data.push(quizzes.get(id) as Quiz);
  });
  response.json(data);
});

// Get a specific player's quiz answers
app.get('/api/answer', async (request : express_core.Request, response : express_core.Response) => {
  const quiz_id : number = request.body.id;
  // Get name
  let query : string =  "SELECT name \
                FROM quizzes \
                WHERE id = $1";
  let params : any[] = [quiz_id];
  let result : pg.QueryResult = await pgClient.query(query, params);
  const responses = new Map<string, string>();
  const quiz : Quiz = {
    id: quiz_id,
    name: result.rows[0].name,
    responses: responses
  }

  // get answers
  query = "SELECT question_id, response \
           FROM quizzes \
           INNER JOIN answers \
           ON quizzes.quiz_id = answers.quiz_id \
           WHERE quizzes.quiz_id = $1";
  params = [quiz.id];
  result = await pgClient.query(query, params);
  result.rows.forEach((row) => {
    responses.set(row.question_id, row.response);
  });
  response.json(quiz);
});

// Ask the server if the quiz is open
app.get('/api/quizState', async (request : express_core.Request, response : express_core.Response) => {
  const state : State = await getState();
  response.json(state);
})

// Default 404 response
app.use((request : express_core.Request, response : express_core.Response) => {
  response.redirect('/');
})