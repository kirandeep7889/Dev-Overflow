"use server";

import Question from "@/database/question.model";
import { connectToDatabase } from "../mongoose";
import Tag from "@/database/tag.model";

export async function CreateQuestion(params:any) {
    try {
        console.log(params)
        await connectToDatabase();
        const {title,content,tags,author,path}=params;

        //create the question
        const question=await Question.create(
            {
                title,
                content,
                author
            }
        );

        const tagDocuments=[];

        //create tags or get them if they already exists
        for (const tag of tags) {
            const existingTag=await Tag.findOneAndUpdate(
                {
                name: { $regex: new RegExp(`^${tag}$`,"i")},
                },
                {
                  $setOnInsert : {name:tag}, $push: {question:question._id}
                },
                {upsert:true,new:true}
                )
                tagDocuments.push(existingTag._id)
        }
       await Question.findByIdAndUpdate(question._id,{
        $push: {tags: {$each:tagDocuments}}
       })
    } catch (error) {
        
    }
}