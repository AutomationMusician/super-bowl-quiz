import { Injectable } from '@angular/core';
import { IQuestion, IState } from 'server/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ServerService {

  constructor() { }

  async getState() : Promise<IState> {
    const response : Response = await fetch('/api/quiz-state');
    const state : IState = await response.json();
    return state;
  }

  async getQuestions() : Promise<IQuestion[]> {
    const response = await fetch('/api/questions');
    return await response.json();
  }
}
