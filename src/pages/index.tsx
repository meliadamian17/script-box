import React from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { CodeBracketIcon } from "@heroicons/react/24/outline";
import blog from "../../public/images/home/blog.png";
import code from "../../public/images/home/code.jpg";

const HomePage = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen">
      <div className="hero bg-base-200 py-10">
        <div className="hero-content flex-col lg:flex-row">
          <CodeBracketIcon className="w-24 h-24 text-primary" />
          <div>
            <h1 className="text-5xl font-bold">Welcome to Scriptbox</h1>
            <p className="py-6">
              Your one-stop platform for creating, sharing, and exploring code
              templates and blogs.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => router.push("/code")}
            >
              Start Coding Now
            </button>
          </div>
        </div>
      </div>

      <div className="flex-grow flex justify-center items-center bg-base-100 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div
            className="card bg-base-100 shadow-lg cursor-pointer h-96 w-96 mx-auto transform transition-transform hover:scale-110"
            onClick={() => router.push("/blogs")}
          >
            <figure className="relative h-full">
              <Image
                src={blog.src}
                alt="Blogs"
                layout="fill"
                objectFit="cover"
                className="rounded-t-lg"
              />
            </figure>
            <div className="card-body">
              <h2 className="card-title text-3xl text-center">Blogs</h2>
              <p className="text-center">
                Explore insightful posts and tutorials written by developers
                worldwide.
              </p>
            </div>
          </div>

          <div
            className="card bg-base-100 shadow-lg cursor-pointer h-96 w-96 mx-auto transform transition-transform hover:scale-110"
            onClick={() => router.push("/templates")}
          >
            <figure className="relative h-full">
              <Image
                src={code.src}
                alt="Code"
                layout="fill"
                objectFit="cover"
                className="rounded-t-lg"
              />
            </figure>
            <div className="card-body">
              <h2 className="card-title text-3xl text-center">Code</h2>
              <p className="text-center">
                Discover and share reusable code templates across multiple
                programming languages.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

