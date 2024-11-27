import React, { useEffect } from "react";
import { useRouter } from "next/router";

const PostDetails = ({ post, userId, onVote }) => {
  const router = useRouter()
  const handleVote = async (vote) => {
    try {
      const response = await fetch(`/api/posts/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postID: post.id, vote }),
      });
      if (response.ok) {
        onVote();
      }
    } catch (error) {
      console.error("Error voting post", error);
    }
  };

  const handleTemplateClick = (templateId: number) => {
    router.push(`/templates/view/${templateId}`);
  };

  useEffect(() => {
    console.log(post.templates)
  }, [])

  const userPostRating = post.ratings.find((rating) => rating.userId === userId)?.value;

  return (
    <div className="bg-base-200 shadow-md rounded-lg p-8 mb-8">
      <div className="flex items-start">
        <div className="flex flex-col items-center mr-6">
          <button
            className={`${userPostRating === 1 ? "text-green-500" : "text-gray-500"} hover:text-green-500`}
            onClick={() => handleVote(1)}
          >
            ▲
          </button>
          <p className="text-xl font-bold">{post.rating}</p>
          <button
            className={`${userPostRating === -1 ? "text-red-500" : "text-gray-500"} hover:text-red-500`}
            onClick={() => handleVote(-1)}
          >
            ▼
          </button>
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-base-primary">{post.title}</h1>
          <p className="text-base-secondary mb-4">{post.description}</p>
          <p className="text-sm text-gray-400 mb-6">
            By {post.author.firstName} {post.author.lastName} | Published:{" "}
            {new Date(post.createdAt).toLocaleDateString()}
          </p>
          <div className="text-base-content leading-relaxed">{post.content}</div>
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.split(",").map((tag, index) => (
              <span key={index} className="px-3 py-1 bg-base-100 text-base-content rounded-full text-sm">
                #{tag.trim()}
              </span>
            ))}
          </div>

          {/* Templates Section */}
          {post.templates?.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold text-base-primary mb-2">Associated Templates</h2>
              <ul className="list-disc ml-6">
                {post.templates.map((template) => (

                  <li
                    key={template.id}
                    className="text-secondary hover:underline cursor-pointer"
                    onClick={() => handleTemplateClick(template.id)}
                  >
                    {template.title} (Language: {template.language})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetails;

