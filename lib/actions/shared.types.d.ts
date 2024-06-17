import { IUser } from "@/database/user.model";
import { Schema } from "mongoose";


export interface GetQuestionsParams {
    page? : number;
    pageSize? : number;
    searchQuery?: number;
    filter?:number
}

export interface CreateQuestionProps {
    title:string,
    content:string,
    tags:string[],
    author: Schema.Types.ObjectId | IUser,
    path: string
}