import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { Question } from 'src/app/model/question';
import { GuessSelection } from 'server/src/types'

@Component({
    selector: '[app-question]',
    templateUrl: './question.component.html',
    styleUrls: ['./question.component.css'],
    standalone: false
})
export class QuestionComponent implements OnInit {
  @Input() question!: Question;
  @Input() enabled! : boolean;
  constructor() { }

  ngOnInit(): void { }

  setSelection(selection : GuessSelection) : void {
    this.question.selection = selection;
  }

}
