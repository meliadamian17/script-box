import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/router";
import ReportModal from "@/components/Blogs/ReportModal";
import SearchAndSort from "@/components/Blogs/SearchAndSort";
import { useAuth } from "@/context/AuthContext";
import { EyeSlashIcon, EllipsisVerticalIcon } from "@heroicons/react/24/outline";

export default function Posts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [userRatings, setUserRatings] = useState<Record<number, number>>({});
  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  const [reportingPostId, setReportingPostId] = useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);

  const router = useRouter();
  const { user } = useAuth();

  // Memoize sortOptions
  const sortOptions = useMemo(() => {
    const options = {
      "Rating: High to Low": "desc",
      "Rating: Low to High": "asc",
    };

    if (user?.role === "ADMIN") {
      options["Most Reported"] = "reports";
    }
    return options;
  }, [user?.role]);

  const defaultSortKey = "Rating: High to Low";
  const defaultSortValue = sortOptions[defaultSortKey];
  const [sortBy, setSortBy] = useState<string>(defaultSortValue);

  const fetchPosts = async (
    searchTerm = "",
    sort = sortBy,
    page = currentPage,
    limit = pageSize
  ) => {
    const response = await fetch(
      `/api/posts/posts?title=${encodeURIComponent(
        searchTerm
      )}&sortBy=${sort}&page=${page}&limit=${limit}`
    );
    const data = await response.json();
    setPosts(data.posts);
    setUserId(data.userId);

    const ratings: Record<number, number> = {};
    data.posts.forEach((post: BlogPost) => {
      const userRating = post.ratings.find(
        (rating) => rating.userId === data.userId
      );
      if (userRating) {
        ratings[post.id] = userRating.value;
      }
    });
    setUserRatings(ratings);

    if (data.pagination) {
      setTotalPages(data.pagination.totalPages);
    }
  };

  useEffect(() => {
    fetchPosts("", sortBy, currentPage, pageSize);
  }, [sortBy, currentPage]);

  const handleSearch = (searchTerm: string) => {
    setCurrentPage(1);
    fetchPosts(searchTerm, sortBy, 1, pageSize);
  };

  const handleSort = (newSort: string) => {
    if (newSort) {
      setSortBy(newSort);
      setCurrentPage(1);
    } else {
      console.warn("Invalid sort value received:", newSort);
    }
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

  // Function to hide/unhide posts (Admin functionality)
  const toggleHidePost = async (postId: number, hide: boolean) => {
    try {
      const response = await fetch(`/api/posts/${postId}/hide`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hidden: hide }),
      });
      if (response.ok) {
        fetchPosts();
      } else {
        console.error("Error hiding/unhiding post");
      }
    } catch (error) {
      console.error("Error hiding/unhiding post:", error);
    }
  };

  // Dropdown reference and click outside handler
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setMenuOpen(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <div id="blogs_page" className="p-8 bg-base-100 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Blog Posts</h1>
        <button
          onClick={() => router.push(`/blogs/create`)}
          className="btn btn-primary"
        >
          New Post
        </button>
      </div>

      <SearchAndSort
        onSearch={handleSearch}
        onSort={handleSort}
        sortOptions={sortOptions}
        defaultSort={defaultSortKey}
      />

      <div className="space-y-6">
        {posts.map((post) => (
          <div
            key={post.id}
            className="relative flex p-6 bg-base-200 rounded-lg shadow-md hover:shadow-xl transition"
          >
            <div className="absolute top-4 right-4">
              <div className="relative">
                <button
                  className="btn btn-ghost btn-circle"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen((prev) => (prev === post.id ? null : post.id));
                  }}
                >
                  <EllipsisVerticalIcon className="w-5 h-5" />
                </button>
                {menuOpen === post.id && (
                  <ul
                    ref={dropdownRef}
                    className="absolute top-8 right-0 w-40 bg-base-200 border-xl rounded-xl shadow-lg z-10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Options for the post author */}
                    {post.authorId === userId && (
                      <>
                        {post.canEdit && (
                          <li>
                            <button
                              className="w-full text-left px-4 py-2 btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(post.id);
                                setMenuOpen(null);
                              }}
                            >
                              Edit
                            </button>
                          </li>
                        )}
                        <li>
                          <button
                            className="w-full text-left px-4 py-2 text-red-500 btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (
                                confirm(
                                  "Are you sure you want to delete this post?"
                                )
                              ) {
                                deletePost(post.id);
                              }
                              setMenuOpen(null);
                            }}
                          >
                            Delete
                          </button>
                        </li>
                      </>
                    )}
                    {/* Admin can hide/unhide posts */}
                    {user?.role === "ADMIN" && (
                      <li>
                        <button
                          className="w-full text-left px-4 py-2 btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleHidePost(post.id, !post.hidden);
                            setMenuOpen(null);
                          }}
                        >
                          {post.hidden ? "Unhide" : "Hide"}
                        </button>
                      </li>
                    )}
                    {/* Report option available to all users */}
                    <li>
                      <button
                        className="w-full text-left px-4 py-2 text-red-500 btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setReportingPostId(post.id);
                          setMenuOpen(null);
                        }}
                      >
                        Report
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            </div>

            <div className="flex-shrink-0">
              <div className="flex flex-col items-center space-y-2">
                <button
                  className={`btn btn-sm ${userRatings[post.id] === 1
                      ? "btn-success"
                      : "btn-outline btn-success"
                    }`}
                  onClick={() => handlePostUpvote(post.id)}
                >
                  ▲
                </button>
                <p className="font-semibold text-xl">{post.rating}</p>
                <button
                  className={`btn btn-sm ${userRatings[post.id] === -1
                      ? "btn-error"
                      : "btn-outline btn-error"
                    }`}
                  onClick={() => handlePostDownvote(post.id)}
                >
                  ▼
                </button>
              </div>
            </div>

            <div className="flex-grow pl-6">
              {/* Indicate if the post is hidden and cannot be edited */}
              {post.hidden && post.authorId === userId && (
                <div className="text-red-500 font-bold mb-2">
                  This post has been hidden due to reports and cannot be edited.
                </div>
              )}
              <div className="flex items-center mb-4">
                {post.author.profileImage && (
                  <img
                    src={post.author.profileImage}
                    alt={`${post.author.firstName} ${post.author.lastName}`}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                )}
                <div>
                  <h2
                    className="text-2xl font-semibold cursor-pointer hover:underline"
                    onClick={() => router.push(`blogs/${post.id}`)}
                  >
                    {post.title}
                    {post.hidden && (
                      <EyeSlashIcon className="w-5 h-5 ml-2 text-gray-500" />
                    )}
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

      {/* Pagination Controls */}
      <div className="flex justify-center items-center mt-8">
        <button
          className="btn btn-secondary mr-4"
          onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="btn btn-secondary ml-4"
          onClick={() =>
            currentPage < totalPages && setCurrentPage(currentPage + 1)
          }
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>

      <ReportModal
        isOpen={!!reportingPostId}
        onClose={() => setReportingPostId(null)}
        onSubmit={handleReport}
      />
    </div>
  );
}

