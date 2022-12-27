import { Injectable } from '@angular/core';
import { IQuestion, ISubmission, IState, IQuiz } from 'server/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ServerService {

  constructor() { }

  async getState() : Promise<IState> {
    const response : Response = await fetch('/api/quiz-state');
    return await response.json();
  }

  async getQuestions() : Promise<IQuestion[]> {
    const response = await fetch('/api/questions');
    return await response.json();
  }

  async submitQuiz(submission : ISubmission) : Promise<Response> {
    const response = await fetch('/api/submission', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(submission)
    });
    return response;
  }

  async getGuesses(game : string) : Promise<IQuiz[]> {
    const response = await fetch(`/api/submission/${game}`);
    return await response.json();
  }
}
