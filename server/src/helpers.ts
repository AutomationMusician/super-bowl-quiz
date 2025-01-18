import { Client as PgClient, QueryResult } from 'pg';
import { Response } from 'express';
import { IPlayerData, IQuestion, IQuiz, IScoredQuiz, IState } from "./types";
import * as fs from 'fs';
import * as path from 'path';

export function GetQuestions() : IQuestion[] {
    const jsonString : string = fs.readFileSync(path.join(__dirname, '../../config/config.json'), { encoding: 'utf-8'});
    return JSON.parse(jsonString).questions;
}

export function GetOpen() : boolean {
    const jsonString : string = fs.readFileSync(path.join(__dirname, '../../config/config.json'), { encoding: 'utf-8'});
    return JSON.parse(jsonString).open;
}

export function ValidateGame(game : string) : boolean {
    return ValidateGames([game]);
}

/**
 * @param {string} games string array of games
 * @return {boolean} if all games are valid
 */
export function ValidateGames(games : string[])
{
    const jsonString : string = fs.readFileSync(path.join(__dirname, '../../config/config.json'), { encoding: 'utf-8'});
    const validGames : string[] = Object.keys(JSON.parse(jsonString).gameCodes);
    for (let i=0; i<validGames.length; i++)
        validGames[i] = validGames[i].toLowerCase();
    for (let i=0; i<games.length; i++)
        if (!validGames.includes(games[i].toLowerCase()))
            return false;
    return true;
}

export async function GetAllQuizzes(pgClient : PgClient, games : string[]) : Promise<IQuiz[]> {
    const quizzes : Map<number,IQuiz> = new Map<number,IQuiz>();
  
    // generate params for placeholder
    const paramsPlaceholderArray = [];
    for (let i=1; i<=games.length; i++)
        paramsPlaceholderArray.push(`$${i}`);
    const paramsPlaceholder = paramsPlaceholderArray.join(", ");

    // Get names
    let query = `SELECT Quiz.quiz_id, Quiz.name \
                 FROM QuizGameMapping \
                 INNER JOIN Quiz \
                 ON Quiz.quiz_id = QuizGameMapping.quiz_id \
                 WHERE QuizGameMapping.game IN (${paramsPlaceholder})`;
    let result = await pgClient.query(query, games);
    result.rows.forEach((row : any) => {
      quizzes.set(row.quiz_id, { id: row.quiz_id, name: row.name, guesses: {} });
    });
  
    // get guesses
    query =  `SELECT Quiz.quiz_id, question_id, guess_value \
              FROM Quiz \
              INNER JOIN Guess \
              ON Quiz.quiz_id = Guess.quiz_id \
              INNER JOIN QuizGameMapping \
              ON  Quiz.quiz_id = QuizGameMapping.quiz_id \
              WHERE QuizGameMapping.game IN (${paramsPlaceholder})`;
    result = await pgClient.query(query, games);
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
    const scoredQuiz : IScoredQuiz = {
        id: quiz.id,
        name: quiz.name,
        guesses: quiz.guesses,
        score: ScoreQuiz(questions, quiz)
    };
    return scoredQuiz;
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

    if (GetOpen())
    {
        return playerDataList;
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

export function Send404Error(response : Response) {
    response.status(404).send('<p>Page not found</p>');
}
