"use server";

import Question from "@/database/question.model";
import { connectToDatabase } from "../mongoose";
import Tag from "@/database/tag.model";
import {  CreateQuestionParams, DeleteAnswerParams, DeleteQuestionParams, EditQuestionParams, GetQuestionByIdParams, GetQuestionsParams, QuestionVoteParams } from "./shared.types";
import User from "@/database/user.model";
import { revalidatePath } from "next/cache";
import Answer from "@/database/answer.model";
import Interaction from "@/database/interaction.model";


export async  function getQuestions(params:GetQuestionsParams) {
       try {
        connectToDatabase()
           const questions= await Question.find({})
           .populate({path:'tags',model:Tag})
           .populate({path:'author',model:User})
           .sort({createdAt: -1});

           return { questions}
       } catch (error) {
          console.log(error);
          throw error;
       }
}

export async  function getQuestionById(params:GetQuestionByIdParams) {
    try {
     connectToDatabase();
     const {questionId}=params;
        const question= await Question.findById(questionId)
        .populate({path:'tags',model:Tag, select: '_id name'})
        .populate({path:'author',model:User, select : '_id clerkId name picture'})

        return { question }
    } catch (error) {
       console.log(error);
       throw error;
    }
}

export async function CreateQuestion(params:CreateQuestionParams) {
    try {
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
                  $setOnInsert : {name:tag}, $push: {questions:question._id}
                },
                {upsert:true,new:true}
                )
                tagDocuments.push(existingTag._id)
        }
       await Question.findByIdAndUpdate(question._id,{
        $push: {tags: {$each:tagDocuments}}
       });

       revalidatePath(path);
    } catch (error) {
        
    }
}

export async function upvoteQuestion(params: QuestionVoteParams) {
    try {
      connectToDatabase();
  
      const { questionId, userId, hasupVoted, hasdownVoted, path } = params;
  
      let updateQuery = {};
  
      if(hasupVoted) {
        updateQuery = { $pull: { upvotes: userId }}
      } else if (hasdownVoted) {
        updateQuery = { 
          $pull: { downvotes: userId },
          $push: { upvotes: userId }
        }
      } else {
        updateQuery = { $addToSet: { upvotes: userId }}
      }
  
      const question = await Question.findByIdAndUpdate(questionId, updateQuery, { new: true });
  
      if(!question) {
        throw new Error("Question not found");
      }
  
      // Increment author's reputation by +1/-1 for upvoting/revoking an upvote to the question
    //   await User.findByIdAndUpdate(userId, {
    //     $inc: { reputation: hasupVoted ? -1 : 1}
    //   })
  
      // Increment author's reputation by +10/-10 for recieving an upvote/downvote to the question
    //   await User.findByIdAndUpdate(question.author, {
    //     $inc: { reputation: hasupVoted ? -10 : 10}
    //   })
  
      revalidatePath(path);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  
  export async function downvoteQuestion(params: QuestionVoteParams) {
    try {
      connectToDatabase();
  
      const { questionId, userId, hasupVoted, hasdownVoted, path } = params;
  
      let updateQuery = {};
  
      if(hasdownVoted) {
        updateQuery = { $pull: { downvotes: userId }}
      } else if (hasupVoted) {
        updateQuery = { 
          $pull: { upvotes: userId },
          $push: { downvotes: userId }
        }
      } else {
        updateQuery = { $addToSet: { downvotes: userId }}
      }
  
      const question = await Question.findByIdAndUpdate(questionId, updateQuery, { new: true });
  
      if(!question) {
        throw new Error("Question not found");
      }
  
    //   // Increment author's reputation
    //   await User.findByIdAndUpdate(userId, { 
    //     $inc: { reputation: hasdownVoted ? -2 : 2 }
    //   })
  
    //   await User.findByIdAndUpdate(question.author, { 
    //     $inc: { reputation: hasdownVoted ? -10 : 10 }
    //   })
  
      revalidatePath(path);
    } catch (error) {
      console.log(error);
      throw error;
    }
}

export async function EditQuestion(params:EditQuestionParams) {
  try {
    await connectToDatabase();
    const {questionId,content,title,path}=params;

    const question=await Question.findById(questionId).populate('tags');
     if(!question) {
       throw new Error('Question not found');
    }
     
     question.content=content;
     question.title=title;

     await question.save();

     revalidatePath(path);

  } catch (error) {
      console.log(error)
  }
}

export async function deleteQuestions(params:DeleteQuestionParams) {
   try {
     await connectToDatabase();
     const {questionId,path}=params;
      await Question.deleteOne({_id:questionId});
      await Interaction.deleteMany({question:questionId})
      await Tag.updateMany({questions:questionId} ,{ $pull:{questions:questionId }})
      await Answer.deleteMany({question:questionId});

      revalidatePath(path);
   } catch (error) {
       console.log(error)
   }
}

export async function deleteAnswer(params:DeleteAnswerParams) {
  try {
    await connectToDatabase();
    const {answerId,path}=params;
    const answer=await Answer.findById(answerId);

    if(!answer) {
      throw new Error('Answer not found');
    }

     await answer.deleteOne({_id: answerId});
     await Question.updateMany({_id:answer.question},{$pull:{answers:answerId}})
      await Interaction.deleteMany({answer:answerId})


     revalidatePath(path);
  } catch (error) {
      console.log(error)
  }
}