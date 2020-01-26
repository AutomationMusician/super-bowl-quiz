const express = require('express');
const datastore = require('nedb');
const fileSystem = require('fs');

const app = express();
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log('listening on port ' + PORT));
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded( { extended: true } ));

app.get('/questions', async (request, response) => {
  let rawdata = fileSystem.readFileSync('questions2020.json');
  let questions = JSON.parse(rawdata);
  response.json(questions);
});

const answers = new datastore('answers2020.db');
answers.loadDatabase();
app.post('/answers', (request, response) => {
  answers.insert(request.body);
  response.send("<script>window.location.replace(\"/scoreboard/?success\");</script>");
});

app.get('/answers', (request, response) => {
  answers.find({}, (err, data) => {
    if (err) {
      console.log(err);
      response.send("An error in querying the answer database has occurred");
    } else {
      response.json(data);
    }
  });
});

app.post('/answer', (request, response) => {
  const userID = request.body._id;
  answers.findOne({_id: userID}, (err, data) => {
    if (err) {
      console.log(err);
      response.send("An error in querying the answer database has occurred");
    } else {
      response.json(data);
    }
  });
});
