import { Client as PgClient, QueryResult } from 'pg';
import { Response } from 'express';
import { IConfig, IGameQuizListMap, IPlayerData, IQuestion, IQuiz, IScoredQuiz, IState } from "./types";
import * as fs from 'fs';
import * as path from 'path';

export function GetConfig() : IConfig {
    const jsonString : string = fs.readFileSync(path.join(__dirname, '../../config/config.json'), { encoding: 'utf-8'});
    return JSON.parse(jsonString);
}

/**
 * @param {string} games string array of games
 * @return {boolean} if all games are valid
 */
export function ValidateGames(gameCodes : string[], config : IConfig)
{
    const validGames : string[] = Object.keys(config.games);
    for (let i=0; i<validGames.length; i++)
        validGames[i] = validGames[i].toLowerCase();
    for (let i=0; i<gameCodes.length; i++)
        if (!validGames.includes(gameCodes[i].toLowerCase()))
            return false;
    return true;
}

export async function GetAllQuizzesForEachGame(pgClient : PgClient) : Promise<IGameQuizListMap> {
    const quizzes : Map<number,IQuiz> = new Map<number,IQuiz>();

    // Get names
    let query = `SELECT Quiz.quiz_id, Quiz.name \
                 FROM Quiz`;
    let result = await pgClient.query(query);
    result.rows.forEach((row : any) => {
      quizzes.set(row.quiz_id, { id: row.quiz_id, name: row.name, guesses: {} });
    });
  
    // get guesses
    query =  `SELECT quiz_id, question_id, guess_value \
              FROM Guess`;
    result = await pgClient.query(query);
    result.rows.forEach((row : any) => {
      const quiz = quizzes.get(row.quiz_id)!;
      quiz.guesses[row.question_id] = row.guess_value;
    });

    // get guesses
    const gameQuizMap : IGameQuizListMap = {};
    query = `SELECT quiz_id, game \
             FROM QuizGameMapping`;
    result = await pgClient.query(query);
    result.rows.forEach((row : any) => {
        const quiz = quizzes.get(row.quiz_id)!;
        if (!gameQuizMap[row.game]) {
            gameQuizMap[row.game] = [];
        }
        gameQuizMap[row.game].push(quiz);
    });
  
    return gameQuizMap;
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

export function RankAllPlayers(config : IConfig, quizzes : IQuiz[]) : IPlayerData[] {
    const playerDataList : IPlayerData[] = [];
    for (let quiz of quizzes) {

        const playerData : IPlayerData = {
            id: quiz.id,
            name: quiz.name,
            score: ScoreQuiz(config.questions, quiz),
            rank: undefined
        };
        playerDataList.push(playerData);
    }

    if (config.open)
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
