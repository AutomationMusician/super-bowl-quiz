CREATE DATABASE super_bowl_quiz;

\c super_bowl_quiz

CREATE TABLE Quiz (
  quiz_id INT GENERATED ALWAYS AS IDENTITY,
  name VARCHAR(255) NOT NULL,
  PRIMARY KEY(quiz_id)
);

CREATE TABLE QuizGameMapping (
  quiz_id INT NOT NULL,
  game VARCHAR(255) NOT NULL,
  PRIMARY KEY(quiz_id, game),
  CONSTRAINT fk_quiz_game_mapping_quiz_id
    FOREIGN KEY(quiz_id) 
	    REFERENCES Quiz(quiz_id)
);

CREATE TABLE Guess (
  guess_id INT GENERATED ALWAYS AS IDENTITY,
  question_id VARCHAR(32) NOT NULL,
  quiz_id INT NOT NULL,
  guess_value VARCHAR(16) NOT NULL,
  PRIMARY KEY(guess_id),
  CONSTRAINT fk_guess_quiz_id
    FOREIGN KEY(quiz_id) 
	    REFERENCES Quiz(quiz_id)
);
