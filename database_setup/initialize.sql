CREATE TABLE quizzes (
  id INT GENERATED ALWAYS AS IDENTITY,
  name VARCHAR(255) NOT NULL,
  PRIMARY KEY(id)
);

CREATE TABLE answers (
  answer_id INT GENERATED ALWAYS AS IDENTITY,
  question_id VARCHAR(32) NOT NULL,
  quiz_id INT NOT NULL,
  response VARCHAR(16) NOT NULL,
  PRIMARY KEY(answer_id),
  CONSTRAINT fk_quiz
    FOREIGN KEY(quiz_id) 
	    REFERENCES quizzes(id)
);
