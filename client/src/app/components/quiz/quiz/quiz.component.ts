import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IGuessDict, IQuestion, IState, ISubmission } from 'server/src/types';
import { Question } from 'src/app/model/question';
import { ServerService } from 'src/app/services/server.service';
import { NgForm } from '@angular/forms';
import { BannerType } from '../../banner/banner.component';

const bannerChangeDelayMs : number = 200;

@Component({
    selector: 'app-quiz',
    templateUrl: './quiz.component.html',
    styleUrls: ['./quiz.component.css'],
    standalone: false
})
export class QuizComponent implements OnInit {
  questions: Question[] = [];
  questionsEnabled : boolean = false;
  gameCodes : string | undefined;
  bannerType : BannerType;
  bannerMessage : string | undefined;

  constructor(
    private route: Router,
    private activatedRouter: ActivatedRoute,
    private server: ServerService
    ) {}

  ngOnInit(): void {
    this.activatedRouter.paramMap.subscribe(async params => {
      this.gameCodes = params.get('game') as string;
      if (!(await this.server.areValidGames(this.gameCodes))) {
        this.route.navigate(['/']);
        return;
      }
      
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
    });

  }

  enableQuestions() : void {
    this.questionsEnabled = true;
  }

  isQuizComplete() : boolean {
    return this.questions.every(question => question.selection !== undefined);
  }

  async onFormSubmit(form: NgForm) : Promise<void> {
    this.bannerType = undefined;
    this.bannerMessage = undefined;
    if (!this.gameCodes) {
      setTimeout(() => {
        this.bannerType = 'failure';
        this.bannerMessage = 'The game id was not found, so the quiz could not be submitted.';
      }, bannerChangeDelayMs);
      return;
    }
    console.log(form.value.name);
    if (!form.value.name) {
      setTimeout(() => {
        this.bannerType = 'failure';
        this.bannerMessage = 'The quiz name was not found, so the quiz could not be submitted.';
      }, bannerChangeDelayMs);
      return;
    }
    const name : string = form.value.name;
    const guessDict : IGuessDict = {};
    this.questions.forEach(question => {
      if (question.selection)
        guessDict[question.id] = question.selection
    });
    const submission : ISubmission = {
      games: this.gameCodes,
      name: name,
      guesses: guessDict
    }
    const submissionResponse = await this.server.submitQuiz(submission);
    if (submissionResponse.ok) {
      this.route.navigate(
        ['/scoreboard'],
        { queryParams: { status: 'success' } }
      );
    }
    else {
      const tempBannerMessage = `Error. Http status: ${submissionResponse.status}, Message: ${await submissionResponse.text()}`;
      setTimeout(() => {
        this.bannerType = 'failure';
        this.bannerMessage = tempBannerMessage;
      }, bannerChangeDelayMs);
    }
  }

}
