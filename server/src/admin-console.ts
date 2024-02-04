import { Client } from 'pg';
import * as readline from 'readline';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { IQuizMetadataDict } from './types';
dotenv.config({path: path.join(__dirname, '../../.env')});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const pgClient = new Client({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: Number(process.env.PGPORT)
});
pgClient.connect();

async function main() {
  let _continue;
  let quiz_id;
  const main_menu : string[] = ["Exit", "List Quizzes", "Edit Name", "Edit Game", "Delete Quiz"];
  do {
    _continue = true;
    const option = await choose_option(main_menu);
    switch (option) {
      case 0:
        _continue = false;
        break;
      case 1:
        await list_quizzes();
        break;
      case 2:
        quiz_id = await prompt_quiz_id();
        if (quiz_id !== "x")
          await edit_name(Number(quiz_id));
        break;
      case 3:
        quiz_id = await prompt_quiz_id();
        if (quiz_id !== "x")
          await edit_game(Number(quiz_id));
        break;
      case 4:
        quiz_id = await prompt_quiz_id();
        if (quiz_id !== "x")
          await delete_entry(Number(quiz_id));
        break;
      default:
        _continue = true;
    }
  } while (_continue);
  rl.close();
}

function prompt(prompt : string) : Promise<string> {
  return new Promise( resolve => rl.question( prompt, ans => { resolve(ans); } ) );
}

async function choose_option(options : string[]) {
  do {
    console.log("\nChoose one of the following options:");
    options.forEach((option, index) => {
      console.log("  " + index + ".  " + option);
    });
    const numericOption = await prompt("\nWhich option do you want to choose: ");
    const number = parseInt(numericOption);
    if (number >= 0 && number < options.length) {
      return number;
    } else {
      console.log("Unknown choice. Please try again.");
    }
  } while (true);
}

rl.on("close", function() {
  console.log("\nClosing application");
  process.exit(0);
});

async function prompt_quiz_id() {
  const { quiz_ids, quizzes } = await list_quizzes();
  while (true) {
    const quiz_id_str = await prompt("\nSelect quiz id or type 'x' to exit: ");
    const quiz_id = parseInt(quiz_id_str);
    if (quizzes[quiz_id]) {
      return quiz_id;
    } else if (quiz_id_str === "x") {
      return "x";
    } else {
      console.log("Unknown choice. Please try again.");
    }
  }
}

async function list_quizzes() : Promise<{ 
  quiz_ids : number[],
  quizzes : IQuizMetadataDict
}> {
  let query =  "SELECT Quiz.quiz_id, name, game \
                FROM Quiz \
                INNER JOIN QuizGameMapping \
                ON Quiz.quiz_id = QuizGameMapping.quiz_id";
  let result = await pgClient.query(query);
  const quiz_ids : number[] = [];
  const quizzes : IQuizMetadataDict = {};
  result.rows.forEach((row) => {
    const quiz_id : number = parseInt(row.quiz_id);
    if (!quizzes[quiz_id]) {
      quiz_ids.push(quiz_id);
      quizzes[quiz_id] = {
        name: row.name,
        games: [ row.game ]
      }
    }
    else {
      quizzes[quiz_id].games.push(row.game);
    }
  });

  console.log("\nHere is the list of quizzes:");
  quiz_ids.forEach(quiz_id => {
    console.log(`${quiz_id}. name=\"${quizzes[quiz_id].name}\", game=\"${quizzes[quiz_id].games}\"`);
  })

  return {quiz_ids, quizzes};
}

async function edit_name(quiz_id : number) {
  const name = await prompt("Input the name you want to use for this quiz: ");
  let query =  "UPDATE Quiz \
                SET name = $1 \
                WHERE quiz_id = $2";
  let params = [name, quiz_id];
  await pgClient.query(query, params);
}

async function edit_game(quiz_id : number) {
  const gamesString = await prompt("Input the games you want to use for this quiz (space-separated): ");
  const games : string[] = gamesString.toLowerCase().split(" ");
  let query =  "DELETE FROM QuizGameMapping \
                WHERE quiz_id = $1";
  let params : any[] = [quiz_id];
  console.log(query);
  await pgClient.query(query, params);

  if (games.length > 0)
  {
    const queryParamsPlaceholder = [];
    params = [quiz_id];
    for (let i=0; i<games.length; i++) {
      queryParamsPlaceholder.push(`($1, $${i + 2})`);
      params.push(games[i]);
    }
    query = `INSERT INTO QuizGameMapping (quiz_id, game) VALUES ${queryParamsPlaceholder.join(", ")}`;
    console.log(query);
    await pgClient.query(query, params);
  }
}

async function delete_entry(quiz_id: number) {
  // delete guess
  let query =  "DELETE FROM Guess \
                WHERE quiz_id = $1";
  let params = [quiz_id];
  await pgClient.query(query, params);

  // delete quiz game mappings
  query =  "DELETE FROM QuizGameMapping \
            WHERE quiz_id = $1";
  params = [quiz_id];
  await pgClient.query(query, params);

  // delete quizzes
  query =  "DELETE FROM Quiz \
            WHERE quiz_id = $1";
  params = [quiz_id];
  await pgClient.query(query, params);
}

main();
