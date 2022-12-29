import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IQuestion, IQuiz, IScoredQuiz } from 'server/interfaces';
import { Question } from 'src/app/model/question';
import { ServerService } from 'src/app/services/server.service';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit {
  game : string | undefined;
  id : number | undefined;
  name : string | undefined;
  score: number | undefined;
  questions: Question[] = [];

  constructor(
    private route: Router,
    private activatedRouter: ActivatedRoute,
    private server: ServerService
  ) { 
    this.activatedRouter.paramMap.subscribe(async params => {
      this.id = Number(params.get('id'));
      this.game = params.get('game') as string;
      if (!(await this.server.isValidGame(this.game))) {
        this.route.navigate(['/']);
        return;
      }

      const iQuestions : IQuestion[] = await this.server.getQuestions();
      const scoredQuiz : IScoredQuiz = await this.server.getQuiz(this.id);

      this.name = scoredQuiz.name;
      this.score = scoredQuiz.score;
      this.questions = [];
      iQuestions.forEach(q => {
        const question = new Question(q);
        question.selection = scoredQuiz.guesses[question.id];
        this.questions.push(question);
      });
    });
  }

  ngOnInit(): void {
  }

}
