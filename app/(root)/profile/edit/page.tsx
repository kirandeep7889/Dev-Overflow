import Profile from "@/components/forms/Profile";
import Question from "@/components/forms/Question";
import { getQuestionById } from "@/lib/actions/question.action";
import { getUserId } from "@/lib/actions/user.action";
import { ParamsProps } from "@/types";
import { auth } from "@clerk/nextjs/server";
import React from "react";

const page = async ({ params }: ParamsProps) => {
  const { userId } = auth();

  if (!userId) return null;

  const mongoUser = await getUserId({ userId });

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Edit Profile</h1>
      <div className="mt-9">
        <Profile clerkId={userId} user={JSON.stringify(mongoUser)} />
      </div>
    </>
  );
};

export default page;
