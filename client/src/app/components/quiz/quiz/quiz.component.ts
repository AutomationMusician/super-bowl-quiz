import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IGuessDict, IQuestion, IState, ISubmission } from 'server/src/types';
import { Question } from 'src/app/model/question';
import { ServerService } from 'src/app/services/server.service';
import { NgForm } from '@angular/forms';
import { BannerType } from '../../common/banner/banner.component';

const bannerChangeDelayMs : number = 200;

@Component({
    selector: 'app-quiz',
    templateUrl: './quiz.component.html',
    styleUrls: ['./quiz.component.css'],
    standalone: false
})
export class QuizComponent implements OnInit {
  private gameCodes : string[] = [];
  private name : string | undefined = undefined;

  questions: Question[] = [];
  questionsEnabled : boolean = false;
  bannerType : BannerType;
  bannerMessage : string | undefined;

  constructor(
    private route: Router,
    private server: ServerService
    ) {}

  async ngOnInit(): Promise<void> {
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

  updateGameCodes(gameCodes: string[]) {
    this.gameCodes = gameCodes;
    this.enableQuestionsIfReady();
  }

  updateName(name: string | undefined) {
    this.name = name;
    this.enableQuestionsIfReady();
  }

  enableQuestionsIfReady() : void {
    this.questionsEnabled = this.gameCodes.length > 0 && this.name !== undefined;
  }

  isQuizComplete() : boolean {
    return this.questionsEnabled && this.questions.every(question => question.selection !== undefined);
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
    if (!this.name) {
      setTimeout(() => {
        this.bannerType = 'failure';
        this.bannerMessage = 'The quiz name was not found, so the quiz could not be submitted.';
      }, bannerChangeDelayMs);
      return;
    }
    const guessDict : IGuessDict = {};
    this.questions.forEach(question => {
      if (question.selection)
        guessDict[question.id] = question.selection
    });
    const submission : ISubmission = {
      games: this.gameCodes,
      name: this.name,
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
