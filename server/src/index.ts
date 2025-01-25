import express, { Request, Response } from 'express';
import { Client as PgClient, QueryResult } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { GetAllQuizzesForEachGame, GetConfig, QuizToScoredQuiz, RankAllPlayers, Send404Error, ValidateGames} from './helpers';
import { IQuestion, ISubmission, IQuiz, IScoredQuiz, IState, IGameRankingMap } from './types';

dotenv.config({path: path.join(__dirname, '../../.env')});
const app = express();
const PORT = 3000;

app.use('/super-bowl-quiz/', express.static(path.join(__dirname, '../../client/dist')));
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
app.get('/super-bowl-quiz/api/questions', async (request : Request, response : Response) => {
  const questions = GetConfig().questions;
  response.json(questions);
});

// Add quiz to the database - returns nothing
app.post('/super-bowl-quiz/api/submission', async (request : Request, response : Response) => {
  const body : ISubmission = request.body;

  const config = GetConfig();

  const games = body.games;
  const isValid = ValidateGames(games, config); // TODO: make this validate a list of games and then insert it later
  if (!isValid) {
    const errorMessage = `One of the games is invalid '${JSON.stringify(games)}'`;
    console.error(errorMessage);
    response.status(400).send(errorMessage);
    return;
  }

  // Check if quiz is open
  if (!config.open) {
    const errorMessage = "The submitted quiz with the name '" + body.name + "' was rejected because the quiz is closed.";
    console.error(errorMessage);
    response.status(400).send(errorMessage);
    return;
  }

  // Insert into quiz table
  let query =  "INSERT INTO Quiz(name) \
                VALUES ($1) \
                RETURNING quiz_id";
  let params = [request.body.name];
  let result: QueryResult<any> = await pgClient.query(query, params);
  if (result.rows.length != 1) {
    const errorMessage = `There was not exactly one result with quiz_id ${result.rows.length}`;
    console.error(errorMessage);
    response.status(400).send(errorMessage);
    return;
  }
  const quiz_id = result.rows[0].quiz_id;

  // Insert into quiz game mapping table
  games.forEach(async game => {
    query =  "INSERT INTO QuizGameMapping(quiz_id, game) \
              VALUES ($1, $2)";
    params = [quiz_id, game.toLowerCase()];
    await pgClient.query(query, params);
  })

  // Insert into Guess table
  const values : string[] = [];
  params = [];
  let paramIndex = 1;
  const questions = config.questions;
  for (let question of questions) {
    if (body.guesses[question.id]) {
      params.push(question.id);
      params.push(quiz_id);
      params.push(body.guesses[question.id]);
      const valueStr = "($" + paramIndex + ", $" + (paramIndex+1) + ", $" + (paramIndex+2) + ")";
      values.push(valueStr);
      paramIndex += 3;
    } else {
      const errorMessage = "Question id '" + question.id + "' does not exist in the list of guesses";
      console.error(errorMessage);
      response.status(400).send(errorMessage);
      return;
    }
  }

  if (values.length > 0) {
    const queryArray = ["INSERT INTO Guess(question_id, quiz_id, guess_value) VALUES"];
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
    const errorMessage = "There were no questions answered for quiz_id: '" + quiz_id + "'";
    console.error(errorMessage);
    response.status(400).send(errorMessage);
  }
});

// Get guesses from database - returns IPlayerData[]
app.get('/super-bowl-quiz/api/ranking', async (request : Request, response : Response) => {
  const gameQuizListMap = await GetAllQuizzesForEachGame(pgClient);
  const config = await GetConfig();
  const gameRankingMap : IGameRankingMap = {};
  for (const [gameCode, quizList] of Object.entries(gameQuizListMap)) {
    gameRankingMap[config.games[gameCode]] = RankAllPlayers(config, quizList);
  }
  response.json(gameRankingMap);
});

// returns IScoredQuiz
app.get('/super-bowl-quiz/api/scored-quiz/:id', async (request : Request, response : Response) : Promise<void> => {
  const quiz_id = Number(request.params.id);
  // Get name
  let query =  "SELECT name \
                FROM Quiz \
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
            FROM Quiz \
            INNER JOIN Guess \
            ON Quiz.quiz_id = Guess.quiz_id \
            WHERE Quiz.quiz_id = $1";
  params = [quiz_id];
  result = await pgClient.query(query, params);
  result.rows.forEach((row : any) => {
    quiz.guesses[row.question_id] = row.guess_value;
  });
  
  const questions : IQuestion[] = GetConfig().questions;
  const scoredQuiz : IScoredQuiz = QuizToScoredQuiz(questions, quiz);
  response.json(scoredQuiz);
});

// Ask the server if the quiz is open
app.get('/super-bowl-quiz/api/quiz-state', (request : Request, response : Response) => {
  const config = GetConfig();
  response.json({ open: config.open } as IState);
});

app.get('/super-bowl-quiz/api/is-valid-game/:gameCode', async (request : Request, response : Response) => {
  const gameCode : string = request.params.gameCode.toLowerCase();
  const config = GetConfig();
  response.json({ gameName: config.games[gameCode] });
});

// catch all redirect to angular index.html
app.get('/super-bowl-quiz/*', (request: Request, response : Response) => response.sendFile(path.join(__dirname, '../../client/dist/index.html')));

// catch all 404 error
app.get('*', (request : Request, response : Response) => {
  Send404Error(response);
});

app.listen(PORT, () => console.log('listening on port ' + PORT));
