'use client';
import React from "react";
import { useRouter } from "next/router";
import { Card, CardFooter, Image } from "@nextui-org/react";
import { Divider } from "@nextui-org/divider";
import { CodeBracketIcon } from "@heroicons/react/24/outline";
import blog from "../../public/images/home/blog.png";
import code from "../../public/images/home/code.png";
import { Typewriter } from "nextjs-simple-typewriter";

const HomePage = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="hero bg-base-300 py-20">
        <div className="hero-content flex flex-col items-center text-center">
          <CodeBracketIcon className="w-36 h-36 text-primary mb-6" />
          <h1 className="text-6xl font-extrabold mb-6">
            <Typewriter
              words={["Welcome to Scriptbox!"]}
              cursor
              cursorStyle="|"
              cursorBlinking
              typeSpeed={70}
              deleteSpeed={50}
              loop={0}
            />
          </h1>
          <p className="text-2xl py-4">
            Your one-stop platform for creating, sharing, and exploring code
            templates and blogs.
          </p>
          <button
            className="btn btn-primary mt-6 hover:scale-105"
            onClick={() => router.push("/code")}
          >
            Start Coding Now
          </button>
        </div>
      </div>

      <Divider className="mb-12" />
      {/* Benefits Section */}
      <div className="bg-base-200 py-16">
        <div className="container mx-auto px-6 lg:px-20">
          <h2 className="text-4xl font-bold text-center mb-12">
            <Typewriter
              words={["Sign Up For These Awesome Benefits!"]}
              typeSpeed={70}
              loop={1}
            />
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card bg-base-100 shadow-lg p-6 text-center">
              <h3 className="text-2xl font-semibold mb-4">Save Templates</h3>
              <p>
                Save your favorite code templates and access them anytime,
                anywhere.
              </p>
            </div>
            <div className="card bg-base-100 shadow-lg p-6 text-center">
              <h3 className="text-2xl font-semibold mb-4">Create New Templates</h3>
              <p>
                Build and share your own templates to collaborate with the
                developer community.
              </p>
            </div>
            <div className="card bg-base-100 shadow-lg p-6 text-center">
              <h3 className="text-2xl font-semibold mb-4">Comment on Blogs</h3>
              <p>
                Engage with insightful posts by commenting and sharing your
                thoughts.
              </p>
            </div>
            <div className="card bg-base-100 shadow-lg p-6 text-center">
              <h3 className="text-2xl font-semibold mb-4">AI-Powered Coding</h3>
              <p>
                Use AI-powered suggestions to write and improve your code
                faster.
              </p>
            </div>
            <div className="card bg-base-100 shadow-lg p-6 text-center">
              <h3 className="text-2xl font-semibold mb-4">Stay Organized</h3>
              <p>
                Keep track of your templates, projects, and contributions all in
                one place.
              </p>
            </div>
            <div className="card bg-base-100 shadow-lg p-6 text-center">
              <h3 className="text-2xl font-semibold mb-4">Collaborate</h3>
              <p>
                Join a community of developers and work together on exciting
                projects.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Divider className="my-12" />

      {/* Explore Section */}
      <div className="bg-base-200 py-10 min-h-[75vh]">
        <h2 className="text-4xl font-bold text-center mb-8">
          <Typewriter
            words={["Explore Our Platform!"]}
            typeSpeed={70}
            loop={1}
          />
        </h2>

        <div className="flex-grow flex justify-center items-center py-10 ">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-24 px-4">
            {/* Blog Card */}
            <Card
              isFooterBlurred
              radius="lg"
              className="hover:border rounded-lg shadow-md items-center hover:shadow-xl transform transition-transform hover:scale-105 h-[30rem] w-[30rem]"
            >
              <Image
                alt="Blogs"
                src={blog.src}
                height={300}
                width={300}
                className="object-cover rounded-t-lg h-2/3"
              />
              <CardFooter className="flex flex-col items-start justify-between bg-base-200 before:bg-white/10 border-t border-gray-200 p-4 rounded-b-lg">
                <div className="mb-2">
                  <h2 className="text-2xl font-semibold">Blogs</h2>
                  <p className="text-base text-gray-500">
                    Explore insightful posts and tutorials written by developers worldwide.
                  </p>
                </div>
                <button
                  className="btn btn-primary btn-md mt-2 w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push("/blogs");
                  }}
                >
                  Discover Blogs
                </button>
              </CardFooter>
            </Card>

            {/* Code Card */}
            <Card
              isFooterBlurred
              radius="lg"
              className="hover:border rounded-lg items-center shadow-md hover:shadow-xl transform transition-transform hover:scale-105 h-[30rem] w-[30rem]"
            >
              <Image
                alt="Code"
                src={code.src}
                height={300}
                width={300}
                className="object-cover rounded-t-lg h-2/3"
              />
              <CardFooter className="flex flex-col items-start justify-between bg-base-200 before:bg-white/10 border-t border-gray-200 p-4 rounded-b-lg">
                <div className="mb-2">
                  <h2 className="text-2xl font-semibold">Code</h2>
                  <p className="text-base text-gray-500">
                    Discover and share reusable code templates across multiple programming languages.
                  </p>
                </div>
                <button
                  className="btn btn-secondary btn-md mt-2 w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push("/templates");
                  }}
                >
                  Explore Templates
                </button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

