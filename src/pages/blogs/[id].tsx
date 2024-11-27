import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";

interface BlogPost {
  id: number;
  title: string;
  description: string;
  content: string;
  tags: string;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
  hidden: boolean;
  reported: boolean;
  canEdit: boolean;

  author: User;
  authorId: number;
  comments: Comment[];
  reports: Report[];
  templates: Template[];
  ratings: BlogPostRating[];
}
interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  profileImage?: string;
  phoneNumber?: string;
  role: string;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;

  templates: Template[];
  blogPosts: BlogPost[];
  comments: Comment[];
  reports: Report[];
  ratings: CommentRating[];
  postRatings: BlogPostRating[];
}
interface Template {
  id: number;
  title: string;
  description?: string;
  code: string;
  language: string;
  tags: string;
  createdAt: Date;
  updatedAt: Date;

  user: User;
  userId: number;

  forkedFrom?: Template;
  forkedFromId?: number;
  forks: Template[];

  blogPosts: BlogPost[];
  comments: Comment[];
}
interface CommentRating {
  id: number;
  value: number;
  createdAt: Date;

  user: User;
  userId: number;

  comment: Comment;
  commentId: number;
}
interface BlogPostRating {
  id: number;
  value: number;
  createdAt: Date;
  updatedAt: Date;

  user: User;
  userId: number;

  post: BlogPost;
  postId: number;
}
interface Comment {
  id: number;
  content: string;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
  hidden: boolean;
  reported: boolean;
  canEdit: boolean;
  user: User;
  userId: number;
  blogPost?: BlogPost | null;
  blogPostId?: number | null;
  template?: Template | null;
  templateId?: number | null;
  report?: Report | null;
  ratings: CommentRating[];
}

export default function Post() {
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [userPostRating, setUserPostRating] = useState<number | null>(null);
  const [userCommentRatings, setUserCommentRatings] = useState<
    Record<number, number>
  >({});

  const postId = Number(router.query.id);

  useEffect(() => {
    if (postId) {
      fetchPost();
      fetchComments();
    }
  }, [postId]);

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId, userId]);

  const fetchPost = async () => {
    const response = await fetch(`/api/posts/${postId}`);
    const data = await response.json();
    if (response.ok) {
      setPost(data.post);
      setUserId(data.userId);

      // Extract the user's rating for the post
      const userRating = data.post.ratings.find(
        (rating) => rating.userId === data.userId
      );
      setUserPostRating(userRating ? userRating.value : null);
    } else {
      console.error("Failed to fetch post");
    }
  };

  const fetchComments = async () => {
    const response = await fetch(`/api/comments/comments?postID=${postId}`);
    if (response.ok) {
      const data = await response.json();
      setComments(data.comments);

      // Extract user ratings for comments
      const ratings: Record<number, number> = {};
      data.comments.forEach((comment: Comment) => {
        const userRating = comment.ratings.find(
          (rating) => rating.userId === userId
        );
        if (userRating) {
          ratings[comment.id] = userRating.value;
        }
      });
      setUserCommentRatings(ratings);
    } else {
      console.error("Failed to fetch comments");
    }
  };

  const handlePostVote = async (vote: number) => {
    try {
      const response = await fetch(`/api/posts/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postID: postId, vote }),
      });
      if (response.ok) {
        fetchPost();
      }
    } catch (error) {
      console.error("Error voting post", error);
    }
  };

  const handleCommentVote = async (commentId: number, vote: number) => {
    try {
      const response = await fetch(`/api/comments/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentID: commentId, vote }),
      });
      if (response.ok) {
        fetchComments();
      }
    } catch (error) {
      console.error("Error voting comment", error);
    }
  };

  const handleSubmitComment = async () => {
    const response = await fetch(`/api/comments/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: comment, blogPostId: postId }),
    });
    if (response.ok) {
      setComment("");
      fetchComments();
    }
  };

  if (!post) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-base-200">
        <h1 className="text-xl font-semibold text-gray-400">
          Loading blog post...
        </h1>
      </div>
    );
  }

  return (
    <div className="bg-base-100 py-8 px-4">
      {/* Post Section */}
      <div className="bg-base-200 shadow-md rounded-lg p-8 mb-8">
        <div className="flex items-start">
          {/* Vote Section */}
          <div className="flex flex-col items-center mr-6">
            <button
              className={`${userPostRating === 1 ? "text-green-500" : "text-gray-500"
                } hover:text-green-500`}
              onClick={() => handlePostVote(1)}
            >
              ▲
            </button>
            <p className="text-xl font-bold">{post.rating}</p>
            <button
              className={`${userPostRating === -1 ? "text-red-500" : "text-gray-500"
                } hover:text-red-500`}
              onClick={() => handlePostVote(-1)}
            >
              ▼
            </button>
          </div>

          {/* Content Section */}
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
                <span
                  key={index}
                  className="px-3 py-1 bg-base-100 text-base-content rounded-full text-sm"
                >
                  #{tag.trim()}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-base-200 shadow-md rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-6">Comments</h2>
        {/* Comment Input */}
        <div className="flex items-start space-x-4 mb-6">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 border border-gray-300 bg-base-200 rounded-lg p-4 focus:ring focus:ring-blue-200"
            rows={3}
          />
          <button
            className="btn btn-primary"
            onClick={handleSubmitComment}
          >
            Submit
          </button>
        </div>

        {/* Comment List */}
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="p-4 rounded-lg mb-4 relative bg-base-100"
            >
              <p className="text-base-content mb-2">{comment.content}</p>
              <p className="text-sm text-base-primary mb-4">
                By {comment.user.firstName} {comment.user.lastName} |{" "}
                {new Date(comment.createdAt).toLocaleDateString()}
              </p>
              <div className="flex items-center space-x-2">
                <button
                  className={`${userCommentRatings[comment.id] === 1
                    ? "text-green-500"
                    : "text-gray-500"
                    } hover:text-green-500`}
                  onClick={() => handleCommentVote(comment.id, 1)}
                >
                  ▲
                </button>
                <span>{comment.rating}</span>
                <button
                  className={`${userCommentRatings[comment.id] === -1
                    ? "text-red-500"
                    : "text-gray-500"
                    } hover:text-red-500`}
                  onClick={() => handleCommentVote(comment.id, -1)}
                >
                  ▼
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  );
}
