import React, { useState, useEffect } from "react";
import CommentItem from "@/components/Blogs/CommentItem";

const CommentsSection = ({ postId, userId }) => {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    const response = await fetch(`/api/comments/comments?postID=${postId}`);
    if (response.ok) {
      const data = await response.json();
      setComments(data.comments);
    } else {
      console.error("Failed to fetch comments");
    }
  };

  const handleSubmitComment = async () => {
    const response = await fetch(`/api/comments/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: commentText, blogPostId: postId }),
    });
    if (response.ok) {
      setCommentText("");
      fetchComments();
    }
  };

  return (
    <div className="bg-base-200 shadow-md rounded-lg p-8">
      <h2 className="text-2xl font-bold mb-6">Comments</h2>
      <div className="flex items-start space-x-4 mb-6">
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 border border-gray-300 bg-base-200 rounded-lg p-4 focus:ring focus:ring-blue-200"
          rows={3}
        />
        <button className="btn btn-primary" onClick={handleSubmitComment}>
          Submit
        </button>
      </div>
      {comments.length > 0 ? (
        comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            userId={userId}
            onVote={fetchComments}
            onDelete={fetchComments}
          />
        ))
      ) : (
        <p className="text-gray-500">No comments yet. Be the first to comment!</p>
      )}
    </div>
  );
};

export default CommentsSection;

