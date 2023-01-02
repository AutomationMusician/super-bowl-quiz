CREATE TABLE quizzes (
  quiz_id INT GENERATED ALWAYS AS IDENTITY,
  name VARCHAR(255) NOT NULL,
  game VARCHAR(255) NOT NULL,
  PRIMARY KEY(quiz_id)
);

CREATE TABLE guesses (
  guess_id INT GENERATED ALWAYS AS IDENTITY,
  question_id VARCHAR(32) NOT NULL,
  quiz_id INT NOT NULL,
  guess_value VARCHAR(16) NOT NULL,
  PRIMARY KEY(guess_id),
  CONSTRAINT fk_quiz
    FOREIGN KEY(quiz_id) 
	    REFERENCES quizzes(quiz_id)
);
