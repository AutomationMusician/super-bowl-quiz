import express, { Request, Response } from 'express';
import { Client as PgClient, QueryResult } from 'pg';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { IQuestion, ISubmission as ISubmission, IState } from './interfaces';
import { request } from 'http';

dotenv.config({path: path.join(__dirname, '../.env')});
const app = express();
const PORT = process.env.WEB_PORT;
app.listen(PORT, () => console.log('listening on port ' + PORT));

app.use(express.static(path.join(__dirname, '../client/dist')));
app.get('/client/*', (request: Request, response : Response) => response.sendFile(path.join(__dirname, '../client/dist/index.html')));


app.use(express.json());
app.use(express.urlencoded( { extended: true } ));

const pgClient = new PgClient({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: Number(process.env.PGPORT)
});
pgClient.connect();

function getQuestions() : IQuestion[] {
  const jsonString : string = fs.readFileSync(path.join(__dirname, '../configs/questions.json'), { encoding: 'utf-8'});
  return JSON.parse(jsonString);
}

function getState() : IState {
  const jsonString : string = fs.readFileSync(path.join(__dirname, '../configs/state.json'), { encoding: 'utf-8'});
  return JSON.parse(jsonString);
}

function validateGame(game : string) : boolean {
  const jsonString : string = fs.readFileSync(path.join(__dirname, '../configs/games.json'), { encoding: 'utf-8'});
  const validGames : string[] = JSON.parse(jsonString);
  return validGames.includes(game);
}

// Get questions from server
app.get('/api/questions', async (request : Request, response : Response) => {
  const questions = getQuestions();
  response.json(questions);
});

// Add quiz to the database
app.post('/api/submission', async (request : Request, response : Response) => {
  const body : ISubmission = request.body;
  const game = body.game;
  const isValid = validateGame(game);
  if (!isValid) {
    console.error(`Invalid game '${game}'`)
    response.status(400);
    return;
  }

  // Check if quiz is open
  const state : IState = getState();
  const open = state.open;
  if (!open) {
    console.error("The submitted quiz with the name '" + body.name + "' was rejected because the quiz is closed.");
    // TODO: change this redirect
    // response.redirect(`/scoreboard/index.html?game=${game}&status=failure`);
    return;
  }

  // Insert into quiz table
  let query =  "INSERT INTO quizzes(name, game) \
                VALUES ($1, $2) \
                RETURNING quiz_id";
  let params = [request.body.name, game];
  let result: QueryResult<any> = await pgClient.query(query, params);
  if (result.rows.length != 1) {
    console.error(`There was not exactly one result with quiz_id ${result.rows.length}`);
    response.status(400);
    return;
  }
  const quiz_id = result.rows[0].quiz_id;

  // Insert into guesses table
  const values : any[] = [];
  params = [];
  let paramIndex = 1;
  const questions = getQuestions();
  questions.forEach((question) => {
    if (body.guesses[question.id]) {
      params.push(question.id);
      params.push(quiz_id);
      params.push(body.guesses[question.id]);
      const valueStr = "($" + paramIndex + ", $" + (paramIndex+1) + ", $" + (paramIndex+2) + ")";
      values.push(valueStr);
      paramIndex += 3;
    } else {
      console.error("Question id '" + question.id + "' does not exist");
    }
  });

  if (values.length > 0) {
    const queryArray = ["INSERT INTO guesses(question_id, quiz_id, guess_value) VALUES"];
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
    console.log("'" + body.name + "' submitted a quiz");
    response.redirect(`/scoreboard/index.html?game=${game}&status=success`);
  } else {
    console.error("There were no question guesses for quiz_id: '" + quiz_id + "'");
    response.redirect(`/scoreboard/index.html?game=${game}&status=failure`);
  }
});

// Get guesses from database
app.get('/api/guesses/:game', async (request : Request, response : Response) => {
  const game = request.params.game;
  const isValid = validateGame(game);
  if (!isValid) {
    console.error(`Invalid game '${game}'`)
    response.status(400);
    return;
  }

  const quizzes : any = {};
  const quiz_ids : any[] = [];

  // Get names
  let query =  "SELECT quiz_id, name FROM quizzes WHERE game = $1";
  let params = [game];
  let result = await pgClient.query(query, params);
  result.rows.forEach((row : any) => {
    quizzes[row.quiz_id] = { id: row.quiz_id, name: row.name };
    quiz_ids.push(row.quiz_id);
  });

  // get guesses
  query =  "SELECT quizzes.quiz_id, question_id, guess_value \
            FROM quizzes \
            INNER JOIN guesses \
            ON quizzes.quiz_id = guesses.quiz_id \
            WHERE game = $1";
  params = [game];
  result = await pgClient.query(query, params);
  result.rows.forEach((row : any) => {
    quizzes[row.quiz_id][row.question_id] = row.guess_value;
  });

  // convert quizzes object to an array
  const data : any[] = [];
  quiz_ids.forEach(quiz_id => {
    data.push(quizzes[quiz_id]);
  });
  response.json(data);
});

app.post('/api/answer', async (request : Request, response : Response) : Promise<void> => {
  const quiz_id = request.body.id;
  // Get name
  let query =  "SELECT name, game \
                FROM quizzes \
                WHERE quiz_id = $1";
  let params = [quiz_id];
  let result = await pgClient.query(query, params);
  if (result.rows.length != 1) {
    console.error(`There was not exactly one result with quiz_id ${result.rows.length}`);
    response.status(400);
    return;
  }
  const data : any = { name: result.rows[0].name };

  // get guesses
  query =  "SELECT question_id, guess_value \
            FROM quizzes \
            INNER JOIN guesses \
            ON quizzes.quiz_id = guesses.quiz_id \
            WHERE quizzes.quiz_id = $1";
  params = [quiz_id];
  result = await pgClient.query(query, params);
  result.rows.forEach((row : any) => {
    data[row.question_id] = row.guess_value;
  });
  response.json(data);
});

// Ask the server if the quiz is open
app.get('/api/quiz-state', (request : Request, response : Response) => {
  const state = getState();
  response.json(state as IState);
})

app.post('/api/is-valid-game', async (request : Request, response : Response) => {
  const status = validateGame(request.body.game);
  response.json({ status });
});
