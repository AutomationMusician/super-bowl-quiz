# Super Bowl Quiz App

## What Is It?

The Super Bowl Quiz App is a web application that allows many players to make predictions about the super bowl, where the player with the most correct predictions wins. Predictions are made before the game starts and points are rewarded in real time during the game as the results of the predictions are known.

In theory, this application can be used to run a prediction competition unrelated to the Super Bowl with some minor modifications.

## How To Run The App

This app can be run in development mode by running `run_development.sh` or in production mode by running `run_production.sh`. Before running these scripts, check the **Requirements** section for the respective software requirements. If running in development mode, run `npm install` before running `run_development.sh`.

## Requirements

### Development Mode

* bash
* docker
* docker-compose
* npm
* node.js

## Proudction mode

* bash
* docker
* docker-compose

## Config files
* `.env`
    * Create a copy of `.env_example` and name it `.env`.
    * Change any of the variables under "Changeable Variables". Make sure that you pick a secure password for `PGPASSWORD`.
* `configs/questions.json`
    * Create a file called `configs/questions.json`. This should be a json representation of an array of "question" objects.
    * question objects should have the following attributes:
        * `question`: The question to ask the user.
        * `left`: The left answer
        * `right`: The right answer
        * `answer`: Which answer is correct ("left", "right", or "unknown")
        * `_id`: A string that is unique to the question
    * Follow this example:
        ```json
        [
            {
                "question": "Who will win?",
                "left": "Chiefs",
                "right": "49ers",
                "answer": "left",
                "_id": "q84XY70Fk55BZxrr"
            },
            {
                "question": "Who will win?",
                "left": "Chiefs",
                "right": "49ers",
                "answer": "right",
                "_id": "XLgSuRbUMo9xuWrD"
            }
        ]
        ```

## Services

There are three services in the `docker-compose.yml` file:
1. `web`: The node js express application that hosts the static files in the `public` folder, and handles GET and POST requests as defined in `index.js`.
1. `postgres`: The database server container that persists it's data to the `data` folder.
1. `initialize_database`: A container that waits for postgres to start and initializes the database by creating the database and the tables inside of it if they don't already exist.

## "run" scripts

The `run_development.sh` does the following things:
1. Using docker-compse, run the postgres service in the background.
1. Using docker-compose, run the initialize_database service in the foreground. Wait until the docker container exits.
1. Run `npm start` to start the non-dockerized web service in the foreground.

The `run_production.sh` does the following things:
1. Using docker-compse, run the postgres service in the background.
1. Using docker-compose, run the initialize_database service in the foreground. Wait until the docker container exits.
1. Using docker-compose, run the dockerized web service in the background.
