import { GuessSelection, IQuestion } from 'server/interfaces';

export class Question implements IQuestion {
    question: string;
    left: string;
    right: string;
    answer: GuessSelection | undefined;
    id: string;
    selection: GuessSelection | undefined;
    
    constructor(iQuestion : IQuestion) {
        this.question = iQuestion.question;
        this.left = iQuestion.left;
        this.right = iQuestion.right;
        this.answer = iQuestion.answer;
        this.id = iQuestion.id;
    }

    public isCorrect() : 'correct' | 'incorrect' | 'unknown' {
        if (this.answer === undefined || this.selection === undefined)
            return 'unknown';
        else if (this.answer === this.selection)
            return 'correct';
        else
            return 'incorrect';
    }
}