import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { IQuestion, IScoredQuiz } from 'server/src/types';
import { Question } from 'src/app/model/question';
import { ServerService } from 'src/app/services/server.service';

const refreshIntervalMs : number = 10000;

@Component({
    selector: 'app-results',
    templateUrl: './results.component.html',
    styleUrls: ['./results.component.css'],
    standalone: false
})
export class ResultsComponent implements OnInit, OnDestroy {
  gameCodes : string | undefined;
  id : number | undefined;
  score: number | undefined;
  questions: Question[] = [];
  public readonly nameSubject = new Subject<string>();
  public readonly gamesSubject = new Subject<string[]>();
  private timeoutId : NodeJS.Timeout | undefined;

  constructor(
    private route: Router,
    private activatedRouter: ActivatedRoute,
    private server: ServerService
  ) { 
    this.activatedRouter.paramMap.subscribe(async params => {
      this.id = Number(params.get('id'));
      this.updateQuestionsLoop();
    });
  }

  private updateQuestionsLoop() : void {
    if (this.id) {
      Promise.all([this.server.getQuestions(), this.server.getQuiz(this.id)])
        .then(promiseArray => {
          const iQuestions : IQuestion[] = promiseArray[0];
          const scoredQuiz : IScoredQuiz = promiseArray[1];

          this.nameSubject.next(scoredQuiz.name);
          this.gamesSubject.next(scoredQuiz.games);
          this.score = scoredQuiz.score;
          this.questions = [];
          iQuestions.forEach(q => {
            const question = new Question(q);
            question.selection = scoredQuiz.guesses[question.id];
            this.questions.push(question);
          });
        });
    }
    this.timeoutId = setTimeout(() => {
      this.updateQuestionsLoop();
    }, refreshIntervalMs);
  }

  ngOnInit() : void {}
  
  ngOnDestroy() : void {
    clearTimeout(this.timeoutId);
  }

}
