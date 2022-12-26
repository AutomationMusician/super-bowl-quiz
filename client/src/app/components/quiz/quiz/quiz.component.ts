import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IGuessDict, IQuestion, IState, ISubmission } from 'server/interfaces';
import { Question } from 'src/app/model/question';
import { ServerService } from 'src/app/services/server.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css']
})
export class QuizComponent implements OnInit {
  questions: Question[] = [];
  questionsEnabled : boolean = false;
  game : string | undefined;

  constructor(
    private route: Router,
    private activatedRouter: ActivatedRoute,
    private server: ServerService
    ) {}

  async ngOnInit(): Promise<void> {
    this.activatedRouter.paramMap.subscribe(params => {
      this.game = params.get('game') as string;
    });

    const quizState : IState = await this.server.getState();
    const quizOpen : boolean = quizState.open;
    if (quizOpen) {
      const iQuestions : IQuestion[] = await this.server.getQuestions();
      this.questions = [];
      iQuestions.forEach(q => this.questions.push(new Question(q)));
    } else {
      // use to close quiz
      this.route.navigate(['/scoreboard']);
    }
  }

  enableQuestions() : void {
    this.questionsEnabled = true;
  }

  isQuizComplete() : boolean {
    return this.questions.every(question => question.selection !== undefined);
  }

  onFormSubmit(form: NgForm) : void {
    if (!this.game) {
      alert('The game id was not found, so the quiz could not be submitted.');
      return;
    }
    if (!form.value.name) {
      alert('The quiz name was not found, so the quiz could not be submitted.');
      return;
    }
    const name : string = form.value.name;
    const guessDict : IGuessDict = {};
    this.questions.forEach(question => {
      if (question.selection)
        guessDict[question.id] = question.selection
    });
    const submission : ISubmission = {
      game: this.game,
      name: name,
      guesses: guessDict
    }
    console.log(submission);
    this.server.submitQuiz(submission);
    this.route.navigate(['/scoreboard']);
  }

}
