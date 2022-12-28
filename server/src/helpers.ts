import { Client as PgClient, QueryResult } from 'pg';
import { IPlayerData, IQuestion, IQuiz, IScoredQuiz, IState } from "interfaces";
import * as fs from 'fs';
import * as path from 'path';

export function GetQuestions() : IQuestion[] {
    const jsonString : string = fs.readFileSync(path.join(__dirname, '../../configs/questions.json'), { encoding: 'utf-8'});
    return JSON.parse(jsonString);
}

export function GetState() : IState {
    const jsonString : string = fs.readFileSync(path.join(__dirname, '../../configs/state.json'), { encoding: 'utf-8'});
    return JSON.parse(jsonString);
}

export function ValidateGame(game : string) : boolean {
    const jsonString : string = fs.readFileSync(path.join(__dirname, '../../configs/games.json'), { encoding: 'utf-8'});
    const validGames : string[] = JSON.parse(jsonString);
    return validGames.includes(game);
}

export async function GetAllQuizzes(pgClient : PgClient, game : string) : Promise<IQuiz[]> {
    const quizzes : Map<number,IQuiz> = new Map<number,IQuiz>();
  
    // Get names
    let query =  "SELECT quiz_id, name FROM quizzes WHERE game = $1";
    let params = [game];
    let result = await pgClient.query(query, params);
    result.rows.forEach((row : any) => {
      quizzes.set(row.quiz_id, { id: row.quiz_id, name: row.name, guesses: {} });
    });
  
    // get guesses
    query =  "SELECT quizzes.quiz_id, question_id, guess_value \
              FROM quizzes \
              INNER JOIN guesses \
              ON quizzes.quiz_id = guesses.quiz_id \
              WHERE game = $1";
    params = [game];
    result = await pgClient.query(query, params);
    result.rows.forEach((row : any) => {
      const quiz = quizzes.get(row.quiz_id);
      if (!quiz) {
        throw new Error(`Quiz with id ${row.quiz_id} not found`);
      }
      quiz.guesses[row.question_id] = row.guess_value;
    });
  
    // convert quizzes object to an array
    const data : IQuiz[] = [];
    for (const [quiz_id, quiz] of quizzes) {
      data.push(quiz);
    }
    return data;
}

export function ScoreQuiz(questions : IQuestion[], quiz : IQuiz) : number {
    let numCorrect : number = 0;
    let numIncorrect : number = 0;

    for (let question of questions) {
        const qid = question.id;
        const correctAnswer = question.answer;
        const givenAnswer = quiz.guesses[qid];

        if (givenAnswer === correctAnswer) {
            numCorrect++;
        } else if (correctAnswer) {
            numIncorrect++;
        }
    }
    const totalQuestions = numCorrect + numIncorrect;
    if (totalQuestions !== 0)
        return Math.round(100*numCorrect/totalQuestions);
    return 0;
}

export function QuizToScoredQuiz(questions : IQuestion[], quiz : IQuiz) : IScoredQuiz {
    return {
        id: quiz.id,
        name: quiz.name,
        guesses: quiz.guesses,
        score: ScoreQuiz(questions, quiz)
    } as IScoredQuiz;
}

export function RankAllPlayers(questions : IQuestion[], quizzes : IQuiz[]) : IPlayerData[] {
    const playerDataList : IPlayerData[] = [];
    for (let quiz of quizzes) {

        const playerData : IPlayerData = {
            id: quiz.id,
            name: quiz.name,
            score: ScoreQuiz(questions, quiz),
            rank: undefined
        };
        playerDataList.push(playerData);
    }

    // sort players by score
    playerDataList.sort((player1, player2) => {
        return player2.score - player1.score;
    });

    // create Rank
    let prevRank : number = -1;
    let prevScore : number = 101;
    for (let i=0; i<playerDataList.length; i++) {
        const player = playerDataList[i];
        if (player.score == prevScore) {
            player.rank = prevRank;
        } else {
            prevRank = i + 1;
            player.rank = prevRank;
            prevScore = player.score;
        }
    }
    return playerDataList;
}