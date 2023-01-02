# Super Bowl Quiz App

## What Is It?

The Super Bowl Quiz App is a web application that allows many players to make predictions about the super bowl, where the player with the most correct predictions wins. Predictions are made before the game starts and points are rewarded in real time during the game as the results of the predictions are known.

In theory, this application can be used to run a prediction competition unrelated to the Super Bowl with some minor modifications.

## How To Run The App

Before following these steps, check the **Requirements** section for the respective software requirements.

This app can be run in development mode using the following these steps:
1. Run `run_db.sh`
1. Start server
    1. `cd` into the server directory
    1. Run `npm install` if you haven't already
    1. Run `npm run dev`
1. Start client
    1. `cd` into the client directory
    1. Run `npm install` if you haven't already
    1. Run `npm run start`
1. Connect to the site at the URL `localhost:4200/<game>`

This app can be run in production mode using the following steps:
1. Run `run_production.sh`
1. Connect to the site at the URL `localhost:<WEB_PORT>/<game>`, where `WEB_PORT` is defined by the value in `.env`.


## Requirements

### Development Mode

* bash
* docker
* docker-compose
* npm
* node.js

## Production mode

* bash
* docker
* docker-compose

## Config files

### .env
* Create a copy of `.env_example` and name it `.env`.
* Change any of the variables under "Changeable Variables". Make sure that you pick a secure password for `PGPASSWORD`.

### configs/questions.json
* Create a file called `configs/questions.json`. This should be a json representation of an array of "question" objects.
* question objects should have the following attributes:
    * `id`: A string that is unique to the question
    * `question`: The question to ask the user.
    * `left`: The left answer
    * `right`: The right answer
    * `answer`: Which answer is correct ("left", "right", or remove from the json object if not known yet)
* Follow this example:
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
### configs/state.json
* The `configs/state.json` file is a json object that specifies the state of the application. Create the `configs/state.json` file based on this example:
    ```json
    {
        "open": true
    }
    ```
* The `configs/state.json` object has the following attributes:
    * `open`: a boolean value determining whether the quiz is open (`true`) or closed (`false`). When the quiz is open, users will be able to take and submit quizzes. When the quiz is closed, users will not be redirected away from the quiz page and any quizzes that are submitted are not accepted.

## configs/games.json
Create a file called `configs/games.json`. This should be a json array of simultaneous games hosted by this site.

    ```json
    [
        "game1",
        "game2"
    ]
    ```

## Services

There are three services in the `docker-compose.yml` file:
1. `web`: The node js express application that hosts the static files in the `public` folder, and handles GET and POST requests as defined in `index.js`.
1. `admin-console`: A console application to edit and delete quizzes after they have been entered.
1. `postgres`: The database server container that persists it's data to the `data` folder.
1. `initialize_database`: A container that waits for postgres to start and initializes the database by creating the database and the tables inside of it if they don't already exist.

## "run" scripts

The `run_db.sh` does the following things:
1. Using docker-compose, run the postgres service in the background.
1. Using docker-compose, run the initialize_database service in the foreground. Wait until the docker container exits.

The `run_production.sh` does the following things:
1. Using docker-compose, run the postgres service in the background.
1. Using docker-compose, run the initialize_database service in the foreground. Wait until the docker container exits.
1. If not already built, this will build the web service container.
1. Using docker-compose, run the dockerized web service in the background.

## Admin Console

The Admin Console is a console application to edit and delete quizzes after they have been entered. Run in development mode with the command `npm run admin-console` and run in production mode with `docker-compose run admin-console`.
