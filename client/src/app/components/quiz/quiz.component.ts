import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Question, State } from 'common/interfaces';
import { ServerService } from 'src/app/services/server.service';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css']
})
export class QuizComponent implements OnInit {
  questions: Question[] = [];

  constructor(
    private route: Router,
    private server: ServerService
    ) {}

  async ngOnInit(): Promise<void> {
    const quizState : State = await this.server.getState();
    const quizOpen = quizState.open;
    if (quizOpen) {
      this.questions = await this.server.getQuestions();
    } else {
      // use to close quiz
      this.route.navigate(['/scoreboard']);
    }
  }

}
