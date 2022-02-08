const tbody = document.getElementById('tableBody');
const buttons = [];

async function getGame() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
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

function setLinks(game) {
  const quiz = document.getElementById('quiz_anchor');
  quiz.href = `/index.html?game=${game}`;
  const scoreboard = document.getElementById('scoreboard_anchor');
  scoreboard.href = `/scoreboard/index.html?game=${game}`;
  const form = document.getElementById('form');
  form.setAttribute("action", `/answers/${game}`);
}

function enableButtons() {
  for (let button of buttons) {
    button.disabled = false;
  }
}

function setToComplete(id) {
  document.getElementById(id).className = "complete";
  let allComplete = true;
  for (let row of tbody.children) {
    if (row.className == "incomplete") {
      allComplete = false;
      break;
    }
  }
  if (allComplete) {
    document.getElementById('done').disabled = false;
    document.getElementById('form').setAttribute("onsubmit", "return true");
  }
}

async function getQuestions() {
  const response = await fetch('/questions');
  const questions = await response.json();
  console.log(questions);
  for (let question of questions) {
    const row = document.createElement('tr');
    const id = question.id + "row";
    row.id = id;
    row.className = "incomplete";
    tbody.appendChild(row);

    const data = [];
    for (let i=0; i<3; i++) {
      data[i] = document.createElement('td');
      if (i == 0) {
        data[i].textContent = question.question;
      } else {
        const input = document.createElement('input');
        const label = document.createElement('label');
        const currentCell = (i == 1) ? "left" : "right";

        input.type = "radio";
        input.name = question.id;
        input.id = question.id + currentCell;
        input.value = currentCell;
        input.disabled = true;
        input.setAttribute("onClick", "setToComplete('" + id + "')");
        buttons.push(input);

        label.textContent = " " + question[currentCell];
        label.htmlFor = input.id;

        data[i].appendChild(input);
        data[i].appendChild(label);
      }
    }

    for (let i=0; i<data.length; i++)
      row.appendChild(data[i]);
  }
}

async function main() {
  const game = await getGame();
  if (game) {
    setLinks(game);
    const response = await fetch('/quizState');
    const json = await response.json();
    const quizOpen = json.open;
    if (quizOpen) {
      getQuestions();
    } else {
      // use to close quiz
      window.location.replace(`/scoreboard?game=${game}`);
    }
  }
}

main();
