import React, { useState, useEffect } from "react";
import CommentItem from "@/components/Blogs/CommentItem";
import SearchAndSort from "./SearchAndSort";
import { useAuth } from "@/context/AuthContext";

const sortOptions: Record<string, string> = {
  "Rating: High to Low": "desc",
  "Rating: Low to High": "asc",
  Recent: "",
  "Most Reported": "reports",
};

const CommentsSection = ({ postId, userId }) => {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [sortBy, setSortBy] = useState(sortOptions["Recent"]);
  const { user } = useAuth();

  useEffect(() => {
    fetchComments(sortBy);
  }, [postId, sortBy]);

  const fetchComments = async (sortBy = "") => {
    const response = await fetch(
      `/api/comments/comments?postID=${postId}&sortBy=${sortBy}`
    );
    if (response.ok) {
      const data = await response.json();
      setComments(data.formattedComments || []);
    } else {
      console.error("Failed to fetch comments");
    }
  };

  const handleSubmitComment = async () => {
    if (!user) {
      alert("You must be signed in to submit a comment.");
      return;
    }

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

  const updateReplyCount = (commentId, increment) => {
    const updateNestedReplies = (commentsList) =>
      commentsList.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replyCount: (comment.replyCount || 0) + increment,
          };
        }
        if (comment.replies) {
          return {
            ...comment,
            replies: updateNestedReplies(comment.replies),
          };
        }
        return comment;
      });

    setComments((prevComments) => updateNestedReplies(prevComments));
  };

  const handleSort = (newSort: string) => {
    setSortBy(newSort);
  };

  return (
    <div className="bg-base-200 shadow-md rounded-lg p-8">
      <h2 className="text-2xl font-bold mb-6">Comments</h2>
      <div className="flex items-start space-x-4 mb-6">
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder={
            user ? "Write a comment..." : "You must be signed in to comment."
          }
          className="flex-1 border border-gray-300 bg-base-200 rounded-lg p-4 focus:ring focus:ring-blue-200"
          rows={3}
          disabled={!user}
        />
        <button
          className="btn btn-primary"
          onClick={handleSubmitComment}
          disabled={!user || commentText.trim() === ""}
        >
          Submit
        </button>
      </div>
      <SearchAndSort
        onSort={handleSort}
        sortOptions={sortOptions}
        defaultSort={"Recent"}
      />
      {comments.length > 0 ? (
        comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            userId={userId}
            onVote={fetchComments}
            onDelete={fetchComments}
            onUpdateReplyCount={updateReplyCount}
          />
        ))
      ) : (
        <p className="text-gray-500">
          No comments yet. Be the first to comment!
        </p>
      )}
    </div>
  );
};

export default CommentsSection;

