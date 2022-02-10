const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

async function main() {
  const game = await getGame();
  if (game) {
    setLinks(game);
    fetchAndCreate(game);
    setInterval(() => fetchAndCreate(game), 10 * 1000);
  }
}

function fetchAndCreate(game)
{
  fetchData(game)
  .then(data => {
    scorePlayers(data.questions, data.answers);
    createHtml(data.answers, game);
  });
}

async function getGame() {
  const game = urlParams.get('game');

  // validate game
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ game })
  }
  const response = await fetch('/isValidGame', options);
  const responseJsonObj = await response.json();
  if (responseJsonObj.status)
    return game;
  else
    return undefined;
}

async function fetchData(game) {
  const promises = [getQuestions(), getAnswers(game)];
  const results = await Promise.all(promises);
  return {
    questions: results[0],
    answers: results[1]
  };
}

async function getAnswers(game) {
    const response = await fetch(`/answers/${game}`);
    return await response.json();
}

async function getQuestions() {
  const response = await fetch('/questions');
  return await response.json();
}

function setLinks(game) {
  const quiz = document.getElementById('quiz_anchor');
  quiz.href = `/index.html?game=${game}`;
  const scoreboard = document.getElementById('scoreboard_anchor');
  scoreboard.href = `/scoreboard/index.html?game=${game}`;
}

function scorePlayers(questions, players) {
  // score players
  for (let player of players) {
    let numCorrect = 0;
    let numIncorrect = 0;

    for (let question of questions) {
      const qid = question.id;
      const correctAnswer = question.answer;
      const givenAnswer = player[qid];

      let result = "";
      if (givenAnswer == correctAnswer) {
        result = "correct";
        numCorrect++;
      } else if (correctAnswer == "left" || correctAnswer == "right") {
        result = "incorrect";
        numIncorrect++;
      }
    }
    const totalQuestions = numCorrect + numIncorrect;
    if (totalQuestions == 0)
      player.score = 0;
    else
      player.score = Math.round(100*numCorrect/totalQuestions);
  }

  // sort players by score
  players.sort((player1, player2) => {
    return player2.score - player1.score;
  });

  // create Rank
  let rank = -1;
  let score = 101;
  for (let i=0; i<players.length; i++) {
    const player = players[i];
    if (player.score == score) {
      player.rank = rank;
    } else {
      rank = i + 1;
      player.rank = rank;
      score = player.score;
    }
  }
}

function createHtml(players, game) {
  const tbody = document.getElementById("tableBody");
  // delete children of tbody
  let first = tbody.firstElementChild;
  while (first) {
      first.remove();
      first = tbody.firstElementChild;
  }

  for (let player of players) {
    const anchor = document.createElement('a');
    anchor.href = `/results/index.html?player=${player.id}&game=${game}`;
    anchor.textContent = player.name;

    const data = [];
    for (let i = 0; i < 3; i++)
      data[i] = document.createElement('td');
    if (player.score != 0)
      data[0].textContent = String(player.rank);
    data[1].appendChild(anchor);
    data[1].className = "nameCell";
    data[2].textContent = player.score + " %";
    data[2].className = "score";

    const tr = document.createElement('tr');
    if (player.score != 0) {
      switch (player.rank) {
        case 1:
          tr.className = "gold";
          break;
        case 2:
          tr.className = "silver";
          break;
        case 3:
          tr.className = "bronze";
          break;
      }
    }

    for (let i = 0; i < data.length; i++)
      tr.appendChild(data[i]);
    tbody.appendChild(tr);
  }
}

main();

// check for successful Quiz
const status = urlParams.get("status");
if (status == "success") {
  const successElement = document.createElement('div');
  const body = document.getElementsByTagName('body')[0];
  successElement.id = "success";
  successElement.textContent = "Quiz Successfully Submitted!";
  body.prepend(successElement);
} else if (status == "failure") {
  const failureElement = document.createElement('div');
  const body = document.getElementsByTagName('body')[0];
  failureElement.id = "failure";
  failureElement.textContent = "Quiz failed to be submitted! Please Notify Josh.";
  body.prepend(failureElement);
}
