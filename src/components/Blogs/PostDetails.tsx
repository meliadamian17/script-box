import React from "react";

const PostDetails = ({ post, userId, onVote }) => {
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
        </div>
      </div>
    </div>
  );
};

export default PostDetails;

