export type GuessSelection = 'left' | 'right';

export interface IQuestion {
    question: string;
    left: string;
    right: string;
    answer: GuessSelection | undefined;
    id: string;
}

export interface ISubmission {
    game: string;
    name: string;
    guesses: IGuessDict;
}

export interface IState {
    open: boolean
}

export interface IQuiz {
    id: number;
    name: string;
    guesses: IGuessDict; 
}

export interface IQuizMetadata {
    id: number;
    name: string;
    games: string[]; 
}

export interface IQuizMetadataDict {
    [id: number]: {
        name: string;
        games: string[]; 
    };
}

export interface IScoredQuiz extends IQuiz {
    score: number;
}

export interface IGuessDict {
    // question_id to response
    [index: string]: GuessSelection;
}

export interface IPlayerData {
    id: number;
    name: string;
    score: number;
    rank: number | undefined;
}
