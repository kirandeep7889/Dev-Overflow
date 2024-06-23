"use server"

import Answer from "@/database/answer.model";
import { connectToDatabase } from "../mongoose";
import { CreateAnswerParams } from "./shared.types";
import Question from "@/database/question.model";
import { revalidatePath } from "next/cache";

export async function createAnswer(params:CreateAnswerParams) {
    try {
        connectToDatabase();
        const {content,question,author,path}=params;
        const newAnswer= new Answer({content,author,question});

        // Add the answr to the question's answers array
        await Question.findByIdAndUpdate(question,{
            $push: {answers:newAnswer._id}
        });
        revalidatePath(path);
    } catch (error) {
         console.log(error)
         throw error;
    }
}