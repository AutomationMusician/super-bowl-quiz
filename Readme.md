# Super Bowl Quiz App

## What Is It?

The Super Bowl Quiz App is a web application that allows many players to make predictions about the super bowl, where the player with the most correct predictions wins. Predictions are made before the game starts and points are rewarded in real time during the game as the results of the predictions are known.

In theory, this application can be used to run a prediction competition unrelated to the Super Bowl with some minor modifications.

## How To Run The App

### Development

1. Run the `postgres` (with port 5432 exposed) and `super_bowl_quiz_initialize_database` docker compose services in [website-orchestrator](https://github.com/AutomationMusician/website-orchestrator)
1. Run the server by `cd`ing into the server directory and running `npm run dev`
1. Run the client by `cd`ing into the client directory and running `npm run start`
1. Navigate to `localhost:4200/super-bowl-quiz/`

### Production
1. Create the directory website-orchestrator/config/super_bowl_quiz/
1. Create your [config.json file](#config-file) and place it in that director
1. See the Readme.md of the [website-orchestrator](https://github.com/AutomationMusician/website-orchestrator) to run the software

## Config file

The config.json file contains the dynamic configuration for the applications. See `config/config.example.json` for an example. It includes the following sections:

### open
`open` is a boolean value determining whether the quiz is open (`true`) or closed (`false`). When the quiz is open, users will be able to take and submit quizzes. When the quiz is closed, users will not be redirected away from the quiz page, any quizzes that are submitted are not accepted, and the quizzes will be ranked in the scoreboard page.

## games
`games` is a JSON dictionary of the game codes for a game to the names of those games. All game code should be unique from each other and all game names should be should be unique from each other.

```json
{
    "game1code": "Game 1 name",
    "game2code": "Game 2 name",
    "game3code": "Game 3 name",
    "game4code": "Game 4 name",
    "game5code": "Game 5 name"
}
```

### questions
`questions` should be a json representation of an array of "question" objects. question objects should have the following attributes:
* `id`: A string that is unique to the question
* `question`: The question to ask the user.
* `left`: The left answer
* `right`: The right answer
* `answer`: Which answer is correct ("left", "right", or remove from the json object if not known yet)

Follow this example:
```json
[
    {
        "question": "Who will win?",
        "left": "Chiefs",
        "right": "49ers",
        "answer": "left",
        "id": "q84XY70Fk55BZxrr"
    },
    {
        "question": "Who will win?",
        "left": "Chiefs",
        "right": "49ers",
        "id": "XLgSuRbUMo9xuWrD"
    }
]
```

## Services

There are multiple super_bowl_quiz services in the [`docker-compose.yml` file of website-orchestrator](https://github.com/AutomationMusician/website-orchestrator/blob/main/docker-compose.yml):
1. `super_bowl_quiz`: The angular client and express server application that hosts the application.
1. `postgres`: The database server container that persists it's data to the `data` folder.
1. `super_bowl_quiz_admin_console`: A console application to edit and delete quizzes after they have been entered.
1. `super_bowl_quiz_initialize_database`: A container that waits for postgres to start and initializes the database by creating the database and the tables inside of it if they don't already exist.
1. `super_bowl_quiz_pg_dump`: A container that takes a snapshot of the super_bowl_quiz database and saves it to a file.
1. `super_bowl_quiz_pg_load`: A container that reads the pg_dump snapshot and reloads it into the database.

