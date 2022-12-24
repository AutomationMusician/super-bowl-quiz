import { Injectable } from '@angular/core';
import { Question, State } from 'common/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ServerService {

  constructor() { }

  async getState() : Promise<State> {
    const response : Response = await fetch('/api/quiz-state');
    const state : State = await response.json();
    return state;
  }

  async getQuestions() : Promise<Question[]> {
    const response = await fetch('/api/questions');
    return await response.json();
  }
}
