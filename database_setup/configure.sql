CREATE TABLE quizzes (
  quiz_id INT GENERATED ALWAYS AS IDENTITY,
  quiz_name VARCHAR(255) NOT NULL,
  PRIMARY KEY(quiz_id)
);

CREATE TABLE answers (
  answer_id INT GENERATED ALWAYS AS IDENTITY,
  question_id INT NOT NULL,
  quiz_id INT NOT NULL,
  response VARCHAR(255) NOT NULL,
  PRIMARY KEY(answer_id),
  CONSTRAINT fk_quiz
    FOREIGN KEY(quiz_id) 
	    REFERENCES quizzes(quiz_id)
);
