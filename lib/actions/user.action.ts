"use server";

import User from "@/database/user.model";
import { connectToDatabase } from "../mongoose";
import { CreateUserParams, DeleteUserParams, GetAllUsersParams, GetSavedQuestionsParams, GetUserStatsParams, ToggleSaveQuestionParams, UpdateUserParams } from "./shared.types";
import { revalidatePath } from "next/cache";
import Question from "@/database/question.model";
import { FilterQuery } from "mongoose";
import Tag from "@/database/tag.model";
import Answer from "@/database/answer.model";


export async function getAllUsers(params:GetAllUsersParams) {
    try {
        await connectToDatabase();
        const {}=params;
         const users=await User.find({})
           .sort({createdAt: -1})

           return { users};

    } catch (error) {
       console.log(error);
    }
} 


 export async function getUserId(params:any) {
     try {
         await connectToDatabase();

         const {userId}=params;

         const user=await User.findOne({clerkId:userId});

         console.log(user)

         return user;

     } catch (error) {
        console.log(error);
     }
 } 

 export async function getUserInfo(params:any) {
   try {
     await connectToDatabase();
        const {userId}=params;
        const user=await User.findOne({userId}); 

        console.log(user)
        
        if(!user) {
          throw new Error('User not found');
        }
        const totalQuestions=await Question.countDocuments({author:user._id});
        const totalAnswers=await Answer.countDocuments({author:user._id});

        return {user,totalQuestions,totalAnswers};
   } catch (error) {
    
   } 
}

 export async function createUser(userData:CreateUserParams) {
    try {
        await connectToDatabase();

        console.log(userData);

        const newUser=await User.create(userData);
        console.log(newUser)

        return newUser;

    } catch (error) {
       console.log(error);
    }
} 

export async function updateUser(params:UpdateUserParams) {
    try {
        await connectToDatabase();

    const {clerkId,updateData,path}=params;
        await User.findOneAndUpdate({clerkId},updateData, {
            new:true
        });
    revalidatePath(path)
    } catch (error) {
       console.log(error);
    }
} 

export async function deleteUser(params:DeleteUserParams) {
    try {
        await connectToDatabase();
        const { clerkId}=params;
const user=await User.findOneAndDelete({clerkId});

  if(!user) {
    throw new Error('User not found');
  }

  // get user question Ids
//   const userQuestionIds=await Question.find({author:user._id}).distinct('_id');

  //delete user question ids
  await Question.deleteMany({author:user._id});

  const deletedUser=await User.findOneAndDelete({clerkId});

  return deletedUser;
    } catch (error) {
       console.log(error);
    }
} 


export async function toggleSaveQuestion(params:ToggleSaveQuestionParams) {
    try {
        await connectToDatabase();

        const {userId,questionId,path}=params;

        const user =await User.findById(userId);
        if(!user) {
            throw new Error('user not found');  
        }
        const isQuestionSaved=user.saved.includes(questionId);
         if(isQuestionSaved) {
            await User.findByIdAndUpdate(userId,
                {$pull: {saved:questionId}},
            {new:true})
         } else {
            await User.findByIdAndUpdate(userId,
                {$addToSet: {saved:questionId}},
            {new:true})
         }

         revalidatePath(path);
    } catch (error) {
       console.log(error);
    }
} 

export async function getSavedQuestions(params:GetSavedQuestionsParams) {
    try {
        await connectToDatabase();

        const {clerkId,page=1,pageSize=10,filter,searchQuery}=params;

        const query: FilterQuery<typeof Question> = searchQuery
      ? { title: { $regex: new RegExp(searchQuery, 'i') } }
      : { };

    const user = await User
    .findOne({ clerkId })
    .populate({
      path: 'saved',
      match: query,
      populate: [
        { path: 'tags', model: Tag, select: "_id name" },
        { path: 'author', model: User, select: '_id clerkId name picture'}
      ]
    })

    
    if(!user) {
      throw new Error('User not found');
    }

    const savedQuestions = user.saved;

     return{ questions : savedQuestions}


    } catch (error) {
       console.log(error);
    }
} 

// get user questions action

export async function getUserQuestions(params:GetUserStatsParams) {

   try {
     await connectToDatabase();
       const {userId,page=1,pageSize=10}=params;
       
       const totalQuestions=await Question.countDocuments({author:userId});
        const userQuestions=await Question.find({author:userId})
        .sort({views:-1,upvotes:-1})
        .populate('tags','_id name')
        .populate('author','_id clerkId name picture')

        return {totalQuestions,questions:userQuestions};

   } catch (error) {
    
   }
}

export async function getUserAnswers(params:GetUserStatsParams) {

  try {
    await connectToDatabase();
      const {userId,page=1,pageSize=10}=params;
      
      const totalAnswers=await Answer.countDocuments({author:userId});
       const userAnswers=await Answer.find({author:userId})
       .sort({upvotes:-1})
       .populate('question','_id title')
       .populate('author','_id clerkId name picture')

       return {totalAnswers,answers:userAnswers};

  } catch (error) {
   
  }
}