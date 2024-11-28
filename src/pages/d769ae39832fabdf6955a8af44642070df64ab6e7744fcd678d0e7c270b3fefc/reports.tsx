import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      // Redirect to login if not authenticated
      router.push("/login");
      return;
    }

    if (user.role !== "ADMIN") {
      // Redirect if not admin
      alert("You are not authorized to view this page.");
      router.push("/");
      return;
    }

    fetchReports();
  }, [user]);

  const fetchReports = async () => {
    try {
      const response = await fetch("/api/reports");
      if (response.ok) {
        const data = await response.json();
        setReports(data.reports);
      } else {
        console.error("Failed to fetch reports");
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  const handleViewPost = (postId) => {
    router.push(`/blogs/${postId}`);
  };

  const handleViewComment = (postId, commentId) => {
    // Navigate to the blog post and scroll to the comment
    router.push(`/blogs/${postId}#comment-${commentId}`);
  };

  const toggleHideComment = async (commentId: number, hide: boolean) => {
    try {
      const response = await fetch(`/api/comments/${commentId}/hide`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hidden: hide }),
      });
      if (response.ok) {
        fetchReports();
      } else {
        console.error("Error hiding/unhiding comment");
      }
    } catch (error) {
      console.error("Error hiding/unhiding comment:", error);
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
        fetchReports();
      } else {
        console.error("Error hiding/unhiding post");
      }
    } catch (error) {
      console.error("Error hiding/unhiding post:", error);
    }
  };

  const handleAction = async (targetId: number, itemType: string, isHidden: boolean) => {
    if (itemType === "POST") {
      await toggleHidePost(targetId, !isHidden);
    } else if (itemType === "COMMENT") {
      await toggleHideComment(targetId, !isHidden);
    }
  };

  return (
    <div className="p-8 bg-base-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Reported Items</h1>
      {reports.length === 0 ? (
        <p>No reports found.</p>
      ) : (
        <table className="table-auto w-full bg-base-200 rounded-lg shadow-md">
          <thead>
            <tr className="bg-base-300">
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Content</th>
              <th className="px-4 py-2">Reason</th>
              <th className="px-4 py-2">Reported By</th>
              <th className="px-2 py-2">Date</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => {
              const isHidden = report.comment
                ? report.comment.hidden
                : report.postContent.hidden;

              const itemType = report.comment ? "COMMENT" : "POST";
              const targetId = report.comment
                ? report.comment.id
                : report.blogPost.id;

              return (
                <tr key={report.id} className="hover:bg-base-300">
                  <td className="border px-4 py-2">{report.id}</td>
                  <td className="border px-4 py-2">{itemType}</td>
                  <td className="border px-4 py-2 max-w-xs">
                    <div className="overflow-auto max-h-32">
                      {report.comment
                        ? report.comment.content
                        : report.postContent.content}
                    </div>
                  </td>
                  <td className="border px-4 py-2">{report.reason}</td>
                  <td className="border px-4 py-2">
                    {report.user.firstName} {report.user.lastName}
                  </td>
                  <td className="border px-2 py-2">
                    {new Date(report.createdAt).toLocaleString()}
                  </td>
                  <td className="border px-4 py-2">
                    {report.blogPost && (
                      <button
                        className="btn btn-primary btn-sm mr-2 mb-2"
                        onClick={() => handleViewPost(report.blogPost.id)}
                      >
                        View Post
                      </button>
                    )}
                    {report.comment && report.blogPost && (
                      <button
                        className="btn btn-secondary btn-sm mr-2 mb-2"
                        onClick={() =>
                          handleViewComment(
                            report.blogPost.id,
                            report.comment.id
                          )
                        }
                      >
                        View Comment
                      </button>
                    )}
                    <button
                      className={`btn btn-sm ${isHidden ? "btn-success" : "btn-error"
                        }`}
                      onClick={() =>
                        handleAction(targetId, itemType, isHidden)
                      }
                    >
                      {isHidden ? "Unhide" : "Hide"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ReportsPage;

