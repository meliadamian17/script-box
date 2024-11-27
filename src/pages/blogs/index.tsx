import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ReportModal from "@/components/Blogs/ReportModal"
import SearchAndSort from "@/components/Blogs/SearchAndSort";

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

const sortOptions = {
  "Rating: High to Low": "desc",
  "Rating: Low to High": "asc",
  "Most Reported": "reports",
};

export default function Posts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [userRatings, setUserRatings] = useState<Record<number, number>>({});
  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  const [reportingPostId, setReportingPostId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>("desc"); // Default sort by "Top Rated"

  const router = useRouter();

  const fetchPosts = async (searchTerm = "", sort = sortBy) => {
    const response = await fetch(`/api/posts/posts?title=${searchTerm}&sortBy=${sort}`);
    const data = await response.json();
    setPosts(data.posts);
    setUserId(data.userId);

    const ratings: Record<number, number> = {};
    data.posts.forEach((post: BlogPost) => {
      const userRating = post.ratings.find((rating) => rating.userId === data.userId);
      if (userRating) {
        ratings[post.id] = userRating.value;
      }
    });
    setUserRatings(ratings);
  };

  useEffect(() => {
    fetchPosts("", sortBy);
  }, [sortBy]);

  const handleSearch = (searchTerm: string) => {
    fetchPosts(searchTerm, sortBy);
  };

  const handleSort = (newSort: string) => {
    setSortBy(newSort)
  };

  const handleEdit = (postId: number) => {
    router.push(`blogs/edit/${postId}`);
  };

  const handlePostUpvote = async (postId: number) => {
    try {
      await fetch("/api/posts/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postID: postId, vote: 1 }),
      });
      fetchPosts();
    } catch (error) {
      console.error("Error upvoting post", error);
    }
  };

  const handlePostDownvote = async (postId: number) => {
    try {
      await fetch("/api/posts/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postID: postId, vote: -1 }),
      });
      fetchPosts();
    } catch (error) {
      console.error("Error downvoting post", error);
    }
  };

  const deletePost = async (id: number) => {
    await fetch(`../api/posts/${id}`, { method: "DELETE" });
    fetchPosts();
  };

  const handleReport = async (reason: string) => {
    if (!reportingPostId) return;
    try {
      await fetch("../api/posts/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blogPostId: reportingPostId,
          reason,
          itemType: "POST",
        }),
      });
      setReportingPostId(null);
      alert("Post reported successfully.");
    } catch (error) {
      console.error("Error reporting post:", error);
    }
  };

  return (
    <div id="blogs_page" className="p-8 bg-base-100 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1
          className="text-3xl font-bold"
        >Blog Posts</h1>
        <button onClick={() => router.push(`/blogs/create`)}
          className="btn btn-primary">New Post</button>
      </div>

      <SearchAndSort
        onSearch={handleSearch}
        onSort={handleSort}
        sortOptions={sortOptions}
        defaultSort="Rating: High to Low"
      />

      <div className="space-y-6">
        {posts.map((post) => (
          <div
            key={post.id}
            className="relative flex p-6 bg-base-200 rounded-lg shadow-md hover:shadow-xl transition"
          >
            <div className="absolute top-4 right-4">
              <button
                className="btn btn-circle btn-sm"
                onClick={() => setMenuOpen((prev) => (prev === post.id ? null : post.id))}
              >
                ⋮
              </button>
              {menuOpen === post.id && (
                <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-10">
                  {post.authorId === userId && (
                    <>
                      <button
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        onClick={() => handleEdit(post.id)}
                      >
                        Edit
                      </button>
                      <button
                        className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
                        onClick={() =>
                          confirm("Are you sure you want to delete this post?") &&
                          deletePost(post.id)
                        }
                      >
                        Delete
                      </button>
                    </>
                  )}
                  <button
                    className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
                    onClick={() => setReportingPostId(post.id)}
                  >
                    Report
                  </button>
                </div>
              )}
            </div>

            <div className="flex-shrink-0">
              <div className="flex flex-col items-center space-y-2">
                <button
                  className={`btn btn-sm ${userRatings[post.id] === 1 ? "btn-success" : "btn-outline btn-success"
                    }`}
                  onClick={() => handlePostUpvote(post.id)}
                >
                  ▲
                </button>
                <p className="font-semibold text-xl">{post.rating}</p>
                <button
                  className={`btn btn-sm ${userRatings[post.id] === -1 ? "btn-error" : "btn-outline btn-error"
                    }`}
                  onClick={() => handlePostDownvote(post.id)}
                >
                  ▼
                </button>
              </div>
            </div>

            <div className="flex-grow pl-6">
              <div className="flex items-center mb-4">
                {post.author.profileImage && (
                  <img
                    src={post.author.profileImage}
                    alt={`${post.author.firstName} ${post.author.lastName}`}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                )}
                <div>
                  <h2 className="text-2xl font-semibold cursor-pointer hover:underline"
                    onClick={() => router.push(`blogs/${post.id}`)}
                  >
                    <p>{post.title}</p>
                  </h2>
                  <p className="text-gray-600">{post.description}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">

                {post.tags.length > 0 &&
                  post.tags.split(",").map((tag, index) => (
                    <span
                      key={index}
                      className="badge badge-primary badge-outline text-sm"
                    >
                      {tag.trim()}
                    </span>
                  ))}

              </div>

              <p className="text-sm text-gray-500">
                By: {post.author.firstName} {post.author.lastName}
              </p>
              <p className="text-sm text-gray-400">
                Published: {new Date(post.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      <ReportModal
        isOpen={!!reportingPostId}
        onClose={() => setReportingPostId(null)}
        onSubmit={handleReport}
      />
    </div>
  );
}

