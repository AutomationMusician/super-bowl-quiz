import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Question } from '../../../interfaces/question';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css']
})
export class QuizComponent implements OnInit {
  questions: Question[] = [];

  constructor(private route:Router) {}

  async ngOnInit(): Promise<void> {
    const response = await fetch('/api/quizState');
    const json = await response.json();
    const quizOpen = json.open;
    if (quizOpen) {
      const response = await fetch('/api/questions');
      this.questions = await response.json();
    } else {
      // use to close quiz
      this.route.navigate(['/scoreboard']);
    }
  }

}
