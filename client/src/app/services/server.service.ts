import { Injectable } from '@angular/core';
import { IQuestion, ISubmission, IState, IScoredQuiz, IPlayerData, IGameRankingMap } from 'server/src/types';

@Injectable({
  providedIn: 'root'
})
export class ServerService {

  constructor() { }

  async getGameName(gameCode : string) : Promise<string | undefined> {
    const response : Response = await fetch(`/super-bowl-quiz/api/is-valid-game/${gameCode}`);
    const jsonObject : any = await response.json();
    return jsonObject.gameName;
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

  async getGameRankingMap() : Promise<IGameRankingMap> {
    const response = await fetch(`/super-bowl-quiz/api/ranking`);
    return await response.json();
  }

  async getQuiz(id : number) : Promise<IScoredQuiz> {
    const response = await fetch(`/super-bowl-quiz/api/scored-quiz/${id}`);
    return await response.json();
  }
}
