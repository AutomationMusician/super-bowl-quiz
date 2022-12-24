export interface IQuestion {
    question: string;
    left: string;
    right: string;
    answer: string;
    id: string;
}

export interface IState {
    open: boolean
}

export interface IQuiz {
    id: number;
    name: string;
    responses: Map<string, string>; // question_id to response
}
