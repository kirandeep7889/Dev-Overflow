import QuestionCard from "@/components/cards/QuestionCard";
import Filter from "@/components/shared/Filter";
import HomeFilters from "@/components/shared/home/HomeFilters";
import NoResult from "@/components/shared/NoResult";
import LocalSearchbar from "@/components/shared/search/LocalSearchbar";
import { Button } from "@/components/ui/button";
import { HomePageFilters } from "@/constants/filters";
import { getQuestions } from "@/lib/actions/question.action";
import { Item } from "@radix-ui/react-menubar";
import Link from "next/link";
import React from "react";

const questions = [
  // {
  //   _id: "1",
  //   title:
  //     "How do ES6 module exports and imports work in JavaScript, and what are the key differences from CommonJS?",
  //   tags: [
  //     { _id: "1", name: "Javascript" },
  //     { _id: "2", name: "ES6" },
  //   ],
  //   author: {
  //     _id: "1",
  //     name: "kirandeep Singh",
  //     picture: "", // Assuming an empty string for the picture, as it's not provided in the original data
  //   },
  //   upvotes: 1500000, // Representing the upvotes as an array of strings
  //   answers: [{}, {}], // Assuming each answer is an empty object, as the detailed structure is not provided
  //   views: 50000,
  //   createdAt: new Date("2023-06-04"), // Converting the date string to a Date object
  // },
  // {
  //   _id: "2",
  //   title: "How to center a div ?",
  //   tags: [
  //     { _id: "3", name: "CSS" },
  //     { _id: "4", name: "Styling" },
  //   ],
  //   author: {
  //     _id: "1",
  //     name: "kirandeep Singh",
  //     picture: "", // Assuming an empty string for the picture, as it's not provided in the original data
  //   },
  //   upvotes: 10000000, // Representing the upvotes as an array of strings
  //   answers: [{}, {}], // Assuming each answer is an empty object, as the detailed structure is not provided
  //   views: 40000,
  //   createdAt: new Date("2024-06-04"), // Converting the date string to a Date object
  // },
];

const Home = async () => {
  const result = await getQuestions({});
  return (
    <>
      <div
        className="flex w-full flex-col-reverse
       gap-4 justify-between  sm:flex-row sm:items-center "
      >
        <h1 className="h1-bold text-dark100_light900">All Questions</h1>
        <Link className="flex justify-end max-sm:w-full" href="/ask-question">
          <Button className="primary-gradient min-h-[46px] px-4 py-3 !text-light-900">
            Ask a Question
          </Button>
        </Link>
      </div>
      <div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearchbar
          route="/"
          iconPosition="left"
          imgSrc="/assets/icons/search.svg"
          placeholder="Search for questions"
          otherClasses="flex-1"
        />
        <Filter
          filters={HomePageFilters}
          otherClasses="min-h-[56px] sm:min-w-[170px]"
          containerClasses="hidden max-md:flex"
        />
      </div>
      <HomeFilters />
      <div className="mt-10 flex w-full flex-col gap-6">
        {questions.length > 0 ? (
          result.questions.map((question) => (
            <QuestionCard
              key={question._id}
              _id={question._id}
              title={question.title}
              tags={question.tags}
              author={question.author}
              upvotes={question.upvotes}
              views={question.views}
              answers={question.answers}
              createdAt={question.createdAt}
            />
          ))
        ) : (
          <NoResult
            title="There's no questions to show"
            description="Be the first to break the silence!  🚀 Ask a Question and kickstart thediscussion . Our query could be the next big thing others learn from. Get involved!💡"
            link="/ask-question"
            linkTitle="Ask a Question"
          />
        )}
      </div>
    </>
  );
};

export default Home;
