import React, { useState, useEffect, useRef } from "react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";

const CommentItem = ({ comment, userId, onVote, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleVote = async (vote) => {
    try {
      const response = await fetch(`/api/comments/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentID: comment.id, vote }),
      });
      if (response.ok) onVote();
    } catch (error) {
      console.error("Error voting comment", error);
    }
  };

  const handleEdit = async () => {
    const response = await fetch(`/api/comments/${comment.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        commentID: comment.id,
        content: editedContent
      }),
    });
    if (response.ok) {
      setIsEditing(false);
      onVote();
    }
  };

  const handleDelete = async () => {
    const response = await fetch(`/api/comments/${comment.id}`, {
      method: "DELETE",
    });
    if (response.ok) onDelete();
  };

  const userRating = comment.ratings.find((rating) => rating.userId === userId)?.value;

  return (
    <div className="p-4 rounded-lg mb-4 relative bg-base-100">
      {isEditing ? (
        <div className="mb-4">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full border border-gray-300 bg-base-200 rounded-lg p-2 mb-2"
          />
          <button className="btn btn-primary btn-sm mr-2" onClick={handleEdit}>
            Save
          </button>
          <button
            className="btn btn-error btn-sm"
            onClick={() => setIsEditing(false)}
          >
            Cancel
          </button>
        </div>
      ) : (
        <>
          <p className="text-base-content mb-2">{comment.content}</p>
          <p className="text-sm text-base-primary mb-4">
            By {comment.user.firstName} {comment.user.lastName} |{" "}
            {new Date(comment.createdAt).toLocaleDateString()}
          </p>
        </>
      )}

      {/* Dropdown Menu */}
      <div className="absolute top-4 right-4" ref={dropdownRef}>
        {comment.userId === userId && (
          <div className="relative">
            <button
              className="btn btn-ghost btn-circle"
              onClick={(e) => {
                e.stopPropagation();
                setDropdownOpen(!dropdownOpen);
              }}
            >
              <EllipsisVerticalIcon className="w-5 h-5" />
            </button>
            {dropdownOpen && (
              <ul
                className="absolute top-8 right-0 w-40 bg-base-200 border-xl rounded-xl shadow-lg z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <li>
                  <button
                    className="w-full text-left px-4 py-2 btn "
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(true);
                      setDropdownOpen(false);
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
                      setDropdownOpen(false);
                    }}
                  >
                    Delete
                  </button>
                </li>
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <button
          className={`${userRating === 1 ? "text-green-500" : "text-gray-500"
            } hover:text-green-500`}
          onClick={() => handleVote(1)}
        >
          ▲
        </button>
        <span>{comment.rating}</span>
        <button
          className={`${userRating === -1 ? "text-red-500" : "text-gray-500"
            } hover:text-red-500`}
          onClick={() => handleVote(-1)}
        >
          ▼
        </button>
      </div>
    </div>
  );
};

export default CommentItem;

