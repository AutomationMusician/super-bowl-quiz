function main() {
  fetchData()
    .then(data => {
      scorePlayers(data.questions, data.answers);
      createHtml(data.answers);
    });
}

async function fetchData() {
  const promises = [getQuestions(), getAnswers()];
  const results = await Promise.all(promises);
  return {
    questions: results[0],
    answers: results[1]
  };
}

async function getAnswers() {
    const response = await fetch('/answers');
    return await response.json();
}

async function getQuestions() {
  const response = await fetch('/questions');
  return await response.json();
}

function scorePlayers(questions, players) {
  // score players
  for (let player of players) {
    let numCorrect = 0;
    let numIncorrect = 0;

    for (let question of questions) {
      const qid = question._id;
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

function createHtml(players) {
  const tbody = document.getElementById("tableBody");
  // delete children of tbody
  let first = tbody.firstElementChild;
  while (first) {
      first.remove();
      first = tbody.firstElementChild;
  }

  for (let player of players) {
    const anchor = document.createElement('a');
    anchor.href = "/results/?" + player._id;
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

setInterval(main, 10 * 1000);

// check for successful Quiz
const url = window.location.href;
const successMessage = url.slice(url.indexOf("?") + 1);
if (successMessage == "success") {
  const successElement = document.createElement('div');
  const body = document.getElementsByTagName('body')[0];
  successElement.id = "success";
  successElement.textContent = "Quiz Successfully Submitted!";
  body.prepend(successElement);
}
