import express, { Request, Response } from 'express';
import { Client as PgClient, QueryResult } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { GetAllQuizzes, GetQuestions, GetState, QuizToScoredQuiz, RankAllPlayers, Send404Error, ValidateGame} from './helpers';
import { IQuestion, ISubmission as ISubmission, IState, IQuiz, IScoredQuiz } from 'interfaces';

dotenv.config({path: path.join(__dirname, '../../.env')});
const app = express();
const PORT = Number(process.env.WEB_PORT);

app.use(express.static(path.join(__dirname, '../../client/dist')));
app.get('/client/*', (request: Request, response : Response) => response.sendFile(path.join(__dirname, '../../client/dist/index.html')));
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

// Get questions from server - returns IQuestion[]
app.get('/api/questions', async (request : Request, response : Response) => {
  const questions = GetQuestions();
  response.json(questions);
});

// Add quiz to the database - returns nothing
app.post('/api/submission', async (request : Request, response : Response) => {
  const body : ISubmission = request.body;
  const game = body.game;
  const isValid = ValidateGame(game);
  if (!isValid) {
    const errorMessage = `Invalid game '${game}'`;
    console.error(errorMessage);
    response.status(400).send(errorMessage);
    return;
  }

  // Check if quiz is open
  const state : IState = GetState();
  const open = state.open;
  if (!open) {
    const errorMessage = "The submitted quiz with the name '" + body.name + "' was rejected because the quiz is closed.";
    console.error(errorMessage);
    response.status(400).send(errorMessage);
    return;
  }

  // Insert into quiz table
  let query =  "INSERT INTO quizzes(name, game) \
                VALUES ($1, $2) \
                RETURNING quiz_id";
  let params = [request.body.name, game.toLowerCase()];
  let result: QueryResult<any> = await pgClient.query(query, params);
  if (result.rows.length != 1) {
    const errorMessage = `There was not exactly one result with quiz_id ${result.rows.length}`;
    console.error(errorMessage);
    response.status(400).send(errorMessage);
    return;
  }
  const quiz_id = result.rows[0].quiz_id;

  // Insert into guesses table
  const values : string[] = [];
  params = [];
  let paramIndex = 1;
  const questions = GetQuestions();
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

  // TODO: throw errors if questions don't exist and/or if questions aren't accounted for

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
    response.status(200).send('OK');
  } else {
    const errorMessage = "There were no question answered for quiz_id: '" + quiz_id + "'";
    console.error(errorMessage);
    response.status(400).send(errorMessage);
  }
});

// // TODO: get rid of this (is it used?)
// // Get guesses from database - returns IQuiz[]
// app.get('/api/quizzes/:game', async (request : Request, response : Response) => {
//   const game = request.params.game;
//   const isValid = ValidateGame(game);
//   if (!isValid) {
//     console.error(`Invalid game '${game}'`);
//     response.status(400);
//     return;
//   }
//   const data = GetAllQuizzes(pgClient, game);
//   response.json(data);
// });

// Get guesses from database - returns IPlayerData[]
app.get('/api/ranking/:game', async (request : Request, response : Response) => {
  const game = request.params.game;
  const isValid = ValidateGame(game);
  if (!isValid) {
    console.error(`Invalid game '${game}'`);
    response.status(400);
    return;
  }
  const quizzes = await GetAllQuizzes(pgClient, game);
  const questions = await GetQuestions();
  const rankedPlayerData = RankAllPlayers(questions, quizzes);
  response.json(rankedPlayerData);
});

// returns IScoredQuiz
app.get('/api/scored-quiz/:id', async (request : Request, response : Response) : Promise<void> => {
  const quiz_id = Number(request.params.id);
  // Get name
  let query =  "SELECT name \
                FROM quizzes \
                WHERE quiz_id = $1";
  let params : any[] = [quiz_id];
  let result = await pgClient.query(query, params);
  if (result.rows.length != 1) {
    const errorMessage = `There was ${result.rows.length} results for a quiz with quiz id ${quiz_id} instead of exactly 1 result`;
    console.error(errorMessage);
    response.status(400).send(errorMessage);
    return;
  }

  const quiz : IQuiz = { 
    name: result.rows[0].name,
    id: quiz_id,
    guesses: {}
  };

  // get guesses
  query =  "SELECT question_id, guess_value \
            FROM quizzes \
            INNER JOIN guesses \
            ON quizzes.quiz_id = guesses.quiz_id \
            WHERE quizzes.quiz_id = $1";
  params = [quiz_id];
  result = await pgClient.query(query, params);
  result.rows.forEach((row : any) => {
    quiz.guesses[row.question_id] = row.guess_value;
  });
  
  const questions : IQuestion[] = GetQuestions();
  const scoredQuiz : IScoredQuiz = QuizToScoredQuiz(questions, quiz);
  response.json(scoredQuiz);
});

// Ask the server if the quiz is open
app.get('/api/quiz-state', (request : Request, response : Response) => {
  const state = GetState();
  response.json(state as IState);
})

app.get('/api/is-valid-game/:game', async (request : Request, response : Response) => {
  const game : string = request.params.game;
  const status = ValidateGame(game);
  response.json({ status });
});

app.get('/:game', async (request : Request, response : Response) => {
  const game : string = request.params.game;
  if (ValidateGame(game)) {
    response.redirect(`/client/quiz/${game}`)
  }
  else {
    Send404Error(response);
  }
});

app.get('*', (request : Request, response : Response) => {
  Send404Error(response);
});

app.listen(PORT, () => console.log('listening on port ' + PORT));
