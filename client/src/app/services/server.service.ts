import { Injectable } from '@angular/core';
import { IQuestion, ISubmission, IState, IScoredQuiz, IPlayerData } from 'server/interfaces';

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

  async getPlayerDataList(game : string) : Promise<IPlayerData[]> {
    const response = await fetch(`/api/ranking/${game}`);
    return await response.json();
  }

  async getQuiz(id : number) : Promise<IScoredQuiz> {
    const response = await fetch(`/api/scored-quiz/${id}`);
    return await response.json();
  }
}
