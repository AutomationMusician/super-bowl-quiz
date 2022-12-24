import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IQuestion, IState } from 'common/interfaces';
import { Question } from '../../model/question';
import { ServerService } from 'src/app/services/server.service';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css']
})
export class QuizComponent implements OnInit {
  questions: Question[] = [];
  questionsEnabled : boolean = false;

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

  enableQuestions() : void {
    console.log("Questions enabled!");
    // this.questions.forEach(question => question)
    this.questionsEnabled = true;
  }

}
