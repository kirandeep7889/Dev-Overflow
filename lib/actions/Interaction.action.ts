"use server";

import Question from "@/database/question.model";
import { connectToDatabase } from "../mongoose";
import { ViewQuestionParams } from "./shared.types";
import Interaction from "@/database/interaction.model";

export default async  function ViewQuestion(params:ViewQuestionParams) {
    try {
        await connectToDatabase();

        const {questionId,userId}=params;

        //update view count of the question
        await Question.findByIdAndUpdate(questionId,{
        $inc: {views:1}
        });
         if(userId) {
            const existingInteraction=await Interaction.findOne({
                user:userId,
                action:"view",
                question:questionId
            })
            if(existingInteraction) return console.log("user has already viewed this question")
                //create interaction
            await Interaction.create({
                user:userId,
                action:"view",
                question:questionId
            })
         }


    } catch (error) {
         console.log(error);
        //   throw New Error(error)
    }
}