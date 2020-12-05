const { Client } = require('pg');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const pgClient = new Client({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT
});
pgClient.connect();

async function main() {
  let _continue;
  let quiz_id;
  const main_menu = ["Exit", "Edit Name", "Delete Entry"];
  do {
    _continue = true;
    const option = await choose_option(main_menu);
    switch (option) {
      case 0:
        _continue = false;
        break;
      case 1:
        quiz_id = await prompt_quiz_id();
        if (quiz_id !== "x")
          await edit_name(quiz_id);
        break;
      case 2:
        quiz_id = await prompt_quiz_id();
        if (quiz_id !== "x")
          await delete_entry(quiz_id);
        break;
      default:
        _continue = true;
    }
  } while (_continue);
  rl.close();
}

function prompt(prompt) {
  return new Promise( resolve => rl.question( prompt, ans => { resolve(ans); } ) );
}

async function choose_option(options) {
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
  const quiz_id_set = new Set();
  let query =  "SELECT quiz_id, quiz_name \
                FROM quizzes";
  let result = await pgClient.query(query);
  console.log("\nHere is the list of quizzes:");
  result.rows.forEach((row) => {
    quiz_id_set.add(parseInt(row.quiz_id));
    console.log("  " + row.quiz_id + " => '" + row.quiz_name + "'");
  });

  while (true) {
    const quiz_id_str = await prompt("\nSelect quiz id or type 'x' to exit: ");
    const quiz_id = parseInt(quiz_id_str);
    if (quiz_id_set.has(quiz_id)) {
      return quiz_id;
    } else if (quiz_id_str === "x") {
      return "x";
    } else {
      console.log("Unknown choice. Please try again.");
    }
  }
}

async function edit_name(quiz_id) {
  const name = await prompt("Input the name you want to use for this quiz: ");
  let query =  "UPDATE quizzes \
                SET quiz_name = $1 \
                WHERE quiz_id = $2";
  let params = [name, quiz_id];
  await pgClient.query(query, params);
}

async function delete_entry(quiz_id) {
  // delete answers
  let query =  "DELETE FROM answers \
                WHERE quiz_id = $1";
  let params = [quiz_id];
  await pgClient.query(query, params);

  // delete quizzes
  query =  "DELETE FROM quizzes \
            WHERE quiz_id = $1";
  params = [quiz_id];
  await pgClient.query(query, params);
}

main();