import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import "tailwindcss/tailwind.css";
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
  const [content, setContent] = useState("");
  const [userId, setUserId] = useState();
  const [isVisible, setIsVisible] = useState(false);

  const id = Number(router.query.id);

  const deleteComment = async (id: number) => {
    const response = await fetch(`../api/comments/${id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      await fetchComments();
    }
  };
  const handleCommentUpvote = async (commentId: number) => {
    try {
      const response = await fetch(`../api/comments/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commentID: commentId,
          vote: 1,
        }),
      });

      if (response.ok) {
        await fetchComments();
      } else {
        console.error("Failed to upvote");
      }
    } catch (error) {
      console.error("Error upvoting comment:", error);
    }
  };

  const handleCommentDownvote = async (commentId: number) => {
    try {
      const response = await fetch(`../api/comments/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commentID: commentId,
          vote: -1,
        }),
      });

      if (response.ok) {
        await fetchComments();
      } else {
        console.error("Failed to downvote");
      }
    } catch (error) {
      console.error("Error downvoting comment:", error);
    }
  };

  const handlePostUpvote = async (postId: number) => {
    try {
      const response = await fetch(`../api/posts/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postID: postId,
          vote: 1,
        }),
      });

      if (response.ok) {
        await fetchPost();
      } else {
        console.error("Failed to upvote");
      }
    } catch (error) {
      console.error("Error upvoting post", error);
    }
  };

  const handlePostDownvote = async (postId: number) => {
    try {
      const response = await fetch(`../api/posts/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postID: postId,
          vote: -1,
        }),
      });

      if (response.ok) {
        await fetchPost();
      } else {
        console.error("Failed to upvote");
      }
    } catch (error) {
      console.error("Error upvoting post", error);
    }
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };
  const toggleMenu = (postId: number) => {
    setMenuOpen((prev) => (prev === postId ? null : postId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch("/api/comments/comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: comment,
        blogPostId: id,
      }),
    });
    console.log("it worked!");
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create the comment.");
    }
    await response.json();

    setContent("");
  };

  const fetchPost = async () => {
    const response = await fetch(`/api/posts/${id}`);
    const data = await response.json();
    if (response.ok) {
      console.log(data.post);
      console.log(data.userId);
      setPost(data.post);
      setUserId(data.userId);
    } else {
      console.error("Failed to fetch post");
    }
  };

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);

  const fetchComments = async () => {
    const response = await fetch(`/api/comments/comments?postID=${id}`);
    if (response.ok) {
      console.log("The post ID for this comment is: ", id);
      const data = await response.json();
      console.log(data.comments);
      setComments(data.comments);
    } else {
      console.error("Failed to fetch comments");
    }
  };
  useEffect(() => {
    if (id) {
      fetchComments();
    }
  }, [id]);

  if (!post) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-dark-bg">
        <h1 className="text-xl font-semibold text-gray-400">
          Loading blog post...
        </h1>
      </div>
    );
  }

  const editCommentVisibility = () => {
    // edit comment
    setIsVisible(!isVisible);
  };

  return (
    <div className="bg-dark-bg flex flex-col justify-center items-center px-4 pt-0 pb-0 space-y-8">
      <div className="bg-dark-card w-11/12 p-8 rounded-lg shadow-lg flex relative">
        <div className="flex flex-col items-center space-y-2 mr-6">
          <button
            className="text-gray hover:text-green-500"
            onClick={() => handlePostUpvote(post.id)}
          >
            ▲
          </button>
          <p className="font-semibold text-xl">{post.rating}</p>
          <button
            className="text-gray hover:text-red-500"
            onClick={() => handlePostDownvote(post.id)}
          >
            ▼
          </button>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-5xl font-bold text-gray-200">{post.title}</h1>
          </div>

          <p className="text-lg text-gray-400 mb-4">{post.description}</p>

          <div className="flex justify-between items-center text-sm text-gray-500 mb-6">
            <p>
              By: {post.author.firstName} {post.author.lastName}
            </p>
          </div>

          <div className="text-lg text-gray-300 mb-8">
            <p>{post.content}</p>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.split(",").map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full"
              >
                {tag.trim()}
              </span>
            ))}
          </div>

          <div className="mt-8 flex items-center space-x-4">
            <textarea
              value={comment}
              onInput={handleCommentChange}
              placeholder="Add a comment..."
              className="w-3/4 px-4 py-2 text-gray-900 rounded-lg bg-gray-200 border border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden"
              style={{ minHeight: "40px", maxWidth: "100%" }}
            />
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              Comment
            </button>
          </div>
        </div>

        <p className="absolute bottom-4 right-4 text-sm text-gray-500">
          Published: {new Date(post.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="bg-dark-card w-11/12 p-8 rounded-lg shadow-lg flex flex-col space-y-4">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-gray-800 p-4 rounded-lg shadow-md text-gray-200 relative"
            >
              <div className="absolute top-4 right-4">
                <button
                  className="btn btn-circle btn-sm"
                  onClick={() => toggleMenu(comment.id)}
                >
                  ⋮
                </button>
                {menuOpen === comment.id && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-10">
                    {comment.userId === userId && (
                      <div className="owner-rights">
                        <button
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                          onClick={editCommentVisibility}
                        >
                          Edit
                        </button>

                        <button
                          className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
                          onClick={() =>
                            confirm(
                              "Are you sure you want to delete this comment?"
                            ) && deleteComment(comment.id)
                          }
                        >
                          Delete
                        </button>
                      </div>
                    )}

                    <button
                      className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
                      onClick={() => console.log("report")}
                    >
                      Report
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-8 flex items-center space-x-4">
                {isVisible && (
                  <textarea
                    value={comment.content}
                    onInput={handleCommentChange}
                    placeholder="Add a comment..."
                    className="w-3/4 px-4 py-2 text-gray-900 rounded-lg bg-gray-200 border border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden"
                    style={{ minHeight: "40px", maxWidth: "100%" }}
                  />
                )}

                {isVisible && (
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    Comment
                  </button>
                )}
              </div>
              {!isVisible && <p className="text-md mb-4">{comment.content}</p>}
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-400">
                  By: {comment.user.firstName} {comment.user.lastName}
                </p>
              </div>
              

              <div className="flex items-center space-x-4">
                <button
                  className="text-gray-500 hover:text-green-500"
                  onClick={() => handleCommentUpvote(comment.id)}
                >
                  ▲
                </button>
                <span className="text-gray-400">{comment.rating}</span>
                <button
                  className="text-gray-500 hover:text-red-500"
                  onClick={() => handleCommentDownvote(comment.id)}
                >
                  ▼
                </button>
              </div>

              <p className="absolute bottom-2 right-2 text-xs text-gray-500">
                Published: {new Date(comment.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>
    </div>
  );
}
