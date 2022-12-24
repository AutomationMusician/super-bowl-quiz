import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { Question } from '../../model/question';

@Component({
  selector: '[app-question]',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.css']
})
export class QuestionComponent implements OnInit {
  @Input() question!: Question;
  @Input() enabled! : boolean;
  constructor() { }

  ngOnInit(): void { }

}
