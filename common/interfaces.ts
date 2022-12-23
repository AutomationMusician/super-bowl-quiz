export interface Question {
    question: string;
    left: string;
    right: string;
    answer: string;
    id: string;
}

export interface State {
    open: boolean
}

export interface Quiz {
    id: number;
    name: string;
    responses: Map<string, string>; // question_id to response
}
