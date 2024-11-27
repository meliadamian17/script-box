import React, { useState, useEffect, useRef } from "react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";

type Vote = -1 | 1;

const CommentItem = ({ comment, userId, onVote, onDelete, onUpdateReplyCount }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState(comment.replies || []);
  const [replyText, setReplyText] = useState("");
  const [showReplyBox, setShowReplyBox] = useState(false);

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

  const fetchReplies = async () => {
    try {
      const response = await fetch(`/api/comments/replies?commentID=${comment.id}`);
      if (response.ok) {
        const data = await response.json();
        setReplies(data.replies);
      } else {
        console.error("Failed to fetch replies");
      }
    } catch (error) {
      console.error("Error fetching replies:", error);
    }
  };

  const handleReplySubmit = async () => {
    try {
      const response = await fetch(`/api/comments/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: replyText,
          parentId: comment.id,
        }),
      });
      if (response.ok) {
        const newReply = await response.json();
        setReplies((prevReplies) => [...prevReplies, newReply]); // Add new reply to the state
        setReplyText("");
        setShowReplyBox(false);
        if (onUpdateReplyCount) {
          onUpdateReplyCount(comment.id, 1); // Increment reply count for the parent
        }
        await fetchReplies()

      }
    } catch (error) {
      console.error("Error submitting reply:", error);
    }
  };

  const handleEdit = async () => {
    try {
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editedContent }),
      });
      if (response.ok) {
        setIsEditing(false);
        onVote();
      }
    } catch (error) {
      console.error("Error editing comment:", error);
    }
  };

  const handleVote = async (vote: Vote) => {
    try {
      const response = await fetch(`/api/comments/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentID: comment.id, vote }),
      });
      if (response.ok) onVote();
    } catch (error) {
      console.error("Error voting comment:", error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        onDelete();
        if (onUpdateReplyCount) {
          onUpdateReplyCount(comment.id, -1); // Decrement reply count
        }
        await fetchReplies()
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const toggleReplies = () => {
    if (!showReplies) {
      fetchReplies();
    }
    setShowReplies(!showReplies);
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
            {new Date(comment.createdAt).toLocaleString(undefined, { timeZone: "EST" })}
          </p>
        </>
      )}

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
        {comment.replyCount > 0 && (
          <button
            className="text-secondary hover:underline ml-2"
            onClick={toggleReplies}
          >
            {showReplies ? "Hide Replies" : `View Replies (${comment.replyCount})`}
          </button>
        )}
        <button
          className="text-secondary hover:underline ml-2"
          onClick={() => setShowReplyBox(!showReplyBox)}
        >
          Reply
        </button>
      </div>

      {showReplyBox && (
        <div className="flex items-start space-x-4 mt-4">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            className="flex-1 border border-gray-300 bg-base-200 rounded-lg p-4 focus:ring focus:ring-blue-200"
            rows={2}
          />
          <button
            className="btn btn-secondary"
            onClick={handleReplySubmit}
          >
            Reply
          </button>
        </div>
      )}

      {showReplies && (
        <div className="ml-6 mt-4">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              userId={userId}
              onVote={fetchReplies}
              onDelete={fetchReplies}
              onUpdateReplyCount={onUpdateReplyCount} // Pass fetchReplies recursively
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
