function main() {
  const promises = [getQuestions(), getAnswers()];
  Promise.all(promises)
    .then(results => {
      const questions = results[0];
      const answers = results[1];
      if (answers == null)
        window.location.replace("/scoreboard");
      else
        createHTML(questions, answers);
    });
}

async function getQuestions() {
  const response = await fetch('/questions');
  return await response.json();
}

async function getAnswers() {
  const url = window.location.href;
  const uid = url.slice(url.indexOf("?") + 1);
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ _id: uid })
  }
  const response = await fetch('/answer', options);
  return await response.json();
}

function createHTML(questions, answers) {
  document.getElementById("name").value = answers.name;
  const tbody = document.getElementById('tableBody');
  // delete children of tbody
  let first = tbody.firstElementChild;
  while (first) {
      first.remove();
      first = tbody.firstElementChild;
  }

  let numCorrect = 0;
  let numIncorrect = 0;

  for (let question of questions) {
    const qid = question._id;
    const correctAnswer = question.answer;
    const givenAnswer = answers[qid];
    //console.log("correct: " + correctAnswer + "\tGiven: " + givenAnswer);

    let result = "";
    if (givenAnswer == correctAnswer) {
      result = "correct";
      numCorrect++;
    } else if (correctAnswer == "left" || correctAnswer == "right") {
      result = "incorrect";
      numIncorrect++;
    }

    const row = document.createElement('tr');
    if (result != "")
      row.className = result;
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
          input.name = question._id;
          input.id = question._id + currentCell;
          input.disabled = true;
          input.checked = (givenAnswer == currentCell);

          label.textContent = " " + question[currentCell];
          label.htmlFor = input.id;

          data[i].appendChild(input);
          data[i].appendChild(label);
        }
    }

    for (let i=0; i<data.length; i++)
      row.appendChild(data[i]);
    tbody.appendChild(row);
  }
  const numQuestions = numCorrect + numIncorrect;
  let score;
  if (numQuestions == 0)
    score = 0;
  else
    score = Math.round(100*numCorrect/numQuestions);

  const fractionLabel = document.getElementById("fractionLabel");
  const scoreLabel = document.getElementById("scoreLabel");
  scoreLabel.textContent = "Score: " + score + "%";
  fractionLabel.textContent = "Number Correct: " + numCorrect + "/" + numQuestions;
}

main();

setInterval(main, 10 * 1000);
