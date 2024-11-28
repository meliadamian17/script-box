import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { EyeSlashIcon, EllipsisVerticalIcon } from "@heroicons/react/24/outline";

const PostDetails = ({ post, userId, onVote }) => {
  const router = useRouter();
  const { user } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

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

  const handleTemplateClick = async (template) => {
    if (user) {
      if (user.id === template.userId) {
        // User is the owner
        router.push(`/templates/${template.id}`);
      } else {
        // User is not the owner
        router.push(`/templates/view/${template.id}`);
      }
    } else {
      // User is not logged in
      router.push({
        pathname: `/code`,
        query: {
          id: template.id,
          title: template.title,
          description: template.description,
          language: template.language,
          code: template.code,
          tags: template.tags,
        },
      });
    }
  };

  const userPostRating = post.ratings.find(
    (rating) => rating.userId === userId
  )?.value;

  // Function to handle edit button click
  const handleEdit = () => {
    router.push(`/blogs/edit/${post.id}`);
  };

  // Function to handle delete
  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this post?")) {
      try {
        const response = await fetch(`/api/posts/${post.id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          router.push("/blogs");
        } else {
          console.error("Failed to delete post");
        }
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <div className="bg-base-200 shadow-md rounded-lg p-8 mb-8 relative">
      {/* Dropdown Menu */}
      {(user?.id === post.authorId || user?.role === "ADMIN") && (
        <div className="absolute top-4 right-4" ref={dropdownRef}>
          <button
            className="btn btn-ghost btn-circle"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
          >
            <EllipsisVerticalIcon className="w-5 h-5" />
          </button>
          {menuOpen && (
            <ul
              className="absolute top-8 right-0 w-40 bg-base-200 rounded-xl shadow-lg z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <li>
                <button
                  className="w-full text-left px-4 py-2 btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit();
                    setMenuOpen(false);
                  }}
                >
                  Edit
                </button>
              </li>
              <li>
                <button
                  className="w-full text-left px-4 py-2 text-red-500 btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                    setMenuOpen(false);
                  }}
                >
                  Delete
                </button>
              </li>
            </ul>
          )}
        </div>
      )}

      <div className="flex items-start">
        <div className="flex flex-col items-center mr-6">
          <button
            className={`${userPostRating === 1 ? "text-green-500" : "text-gray-500"
              } hover:text-green-500`}
            onClick={() => handleVote(1)}
          >
            ▲
          </button>
          <p className="text-xl font-bold">{post.rating}</p>
          <button
            className={`${userPostRating === -1 ? "text-red-500" : "text-gray-500"
              } hover:text-red-500`}
            onClick={() => handleVote(-1)}
          >
            ▼
          </button>
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-base-primary flex items-center">
            {post.title}
            {post.hidden && (
              <EyeSlashIcon className="w-6 h-6 ml-2 text-gray-500" />
            )}
          </h1>
          <p className="text-base-secondary mb-4">{post.description}</p>
          <p className="text-sm text-gray-400 mb-6">
            By {post.author.firstName} {post.author.lastName} | Published:{" "}
            {new Date(post.createdAt).toLocaleDateString()}
          </p>
          <div className="text-base-content leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>
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

          {/* Templates Section */}
          {post.templates?.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold text-base-primary mb-2">
                Associated Templates
              </h2>
              <ul className="list-disc ml-6">
                {post.templates.map((template) => (
                  <li
                    key={template.id}
                    className="text-secondary hover:underline cursor-pointer"
                    onClick={() => handleTemplateClick(template)}
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

