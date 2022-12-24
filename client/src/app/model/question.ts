import { IQuestion } from 'server/interfaces';

export class Question implements IQuestion {
    question: string;
    left: string;
    right: string;
    answer: string;
    id: string;
    selection: 'left' | 'right' | undefined;
    
    constructor(iQuestion : IQuestion) {
        this.question = iQuestion.question;
        this.left = iQuestion.left;
        this.right = iQuestion.right;
        this.answer = iQuestion.answer;
        this.id = iQuestion.id;
    }
}