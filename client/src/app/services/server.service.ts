import { Injectable } from '@angular/core';
import { IQuestion, ISubmission, IState, IScoredQuiz, IPlayerData } from 'server/src/types';

@Injectable({
  providedIn: 'root'
})
export class ServerService {

  constructor() { }

  async isValidGame(game : string) : Promise<boolean> {
    const response : Response = await fetch(`/super-bowl-quiz/api/are-valid-games/${game}`);
    const jsonObject : any = await response.json();
    return jsonObject.status;
  }

  async getState() : Promise<IState> {
    const response : Response = await fetch('/super-bowl-quiz/api/quiz-state');
    return await response.json();
  }

  async getQuestions() : Promise<IQuestion[]> {
    const response = await fetch('/super-bowl-quiz/api/questions');
    return await response.json();
  }

  async submitQuiz(submission : ISubmission) : Promise<Response> {
    const response = await fetch('/super-bowl-quiz/api/submission', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(submission)
    });
    return response;
  }

  async getPlayerDataList(game : string) : Promise<IPlayerData[]> {
    const response = await fetch(`/super-bowl-quiz/api/ranking/${game}`);
    return await response.json();
  }

  async getQuiz(id : number) : Promise<IScoredQuiz> {
    const response = await fetch(`/super-bowl-quiz/api/scored-quiz/${id}`);
    return await response.json();
  }
}
