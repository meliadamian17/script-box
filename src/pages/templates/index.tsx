import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/router";

interface Template {
  id: number;
  title: string;
  description: string;
  language: string;
  code: string;
  tags: string;
  user?: {
    profileImage?: string;
    firstName?: string;
    lastName?: string;
  };
}

interface Pagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

const TemplatesPage = () => {
  const { user } = useAuth();
  const router = useRouter();

  const [templates, setTemplates] = useState<Template[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"owned" | "public">("owned");
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ title: "", tags: "", content: "" });

  const fetchTemplates = async (page: number, owned: boolean) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(owned ? { ownedByUser: "true" } : { publicOnly: "true" }),
        ...(filters.title ? { title: filters.title } : {}),
        ...(filters.tags ? { tags: filters.tags } : {}),
        ...(filters.content ? { content: filters.content } : {}),
      });

      const res = await fetch(`/api/templates?${query.toString()}`);
      const data = await res.json();
      setTemplates(data.templates);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Failed to fetch templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      const res = await fetch(`/api/templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Untitled Template",
          description: "New template",
          code: "",
          language: "plaintext",
          tags: "",
        }),
      });
      if (res.ok) {
        const newTemplate = await res.json();
        router.push(`/templates/${newTemplate.id}`);
      }
    } catch (error) {
      console.error("Failed to create template:", error);
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    try {
      const res = await fetch(`/api/templates/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTemplates((prev) => prev.filter((template) => template.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete template:", error);
    }
  };

  const handleForkTemplate = async (template: Template) => {
    try {
      const res = await fetch(`/api/templates/fork`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: template.id,
          title: `${template.title} (Forked)`,
          description: template.description,
          tags: template.tags,
          code: template.code,
        }),
      });

      if (res.ok) {
        const forkedTemplate = await res.json();
        router.push(`/templates/${forkedTemplate.id}`);
      } else {
        console.error("Failed to fork template");
      }
    } catch (error) {
      console.error("Error forking template:", error);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  useEffect(() => {
    if (user) {
      fetchTemplates(currentPage, activeTab === "owned");
    }

  }, [currentPage, activeTab, filters]);

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Templates</h1>

      {/* Tabs Section */}
      <div className="tabs tabs-bordered tabs-lg" role="tablist">
        <a
          className={`tab ${activeTab === "owned" ? "tab-active" : ""}`}
          role="tab"
          onClick={() => {
            setActiveTab("owned");
            setCurrentPage(1);
          }}
        >
          My Templates
        </a>
        <a
          className={`tab  ${activeTab === "public" ? "tab-active" : ""}`}
          role="tab"
          onClick={() => {
            setActiveTab("public");
            setCurrentPage(1);
          }}
        >
          Public Templates
        </a>
      </div>

      {/* Filters Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <input
          type="text"
          placeholder="Filter by title"
          name="title"
          value={filters.title}
          onChange={handleFilterChange}
          className="input input-bordered"
        />
        <input
          type="text"
          placeholder="Filter by tags"
          name="tags"
          value={filters.tags}
          onChange={handleFilterChange}
          className="input input-bordered"
        />
        <input
          type="text"
          placeholder="Filter by content"
          name="content"
          value={filters.content}
          onChange={handleFilterChange}
          className="input input-bordered"
        />
      </div>

      {/* Create Template Button */}
      <div className="my-4">
        {activeTab === "owned" && (
          <button className="btn btn-outline btn-primary" onClick={handleCreateTemplate}>
            Create New Template
          </button>
        )}
      </div>

      {/* Templates Table */}
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              {activeTab === "public" && <th>Owner</th>}
              <th>Title</th>
              <th>Language</th>
              <th>Code Preview</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center">
                  <div className="flex justify-center items-center">
                    <div className="loading loading-ring loading-lg"></div>
                  </div>
                </td>
              </tr>
            ) : (
              templates.map((template) => (
                <tr key={template.id}>
                  {activeTab === "public" && (
                    <td>
                      <div className="flex items-center space-x-3">
                        <div className="avatar">
                          <div className="w-12 h-12 rounded-full">
                            <img src={template.user?.profileImage} alt="Owner" />
                          </div>
                        </div>
                        <div>
                          <div className="font-bold">{`${template.user?.firstName} ${template.user?.lastName}`}</div>
                        </div>
                      </div>
                    </td>
                  )}
                  <td>{template.title}</td>
                  <td>{template.language}</td>
                  <td>
                    <pre className="truncate max-w-xs">{template.code}</pre>
                  </td>
                  <td>
                    {activeTab === "owned" && (
                      <>
                        <button
                          className="btn btn-outline btn-info btn-sm"
                          onClick={() => router.push(`/templates/${template.id}`)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-outline btn-error btn-sm ml-2"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                    <button
                      className="btn btn-outline btn-secondary btn-sm ml-2"
                      onClick={() => handleForkTemplate(template)}
                    >
                      Fork
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="mt-6 flex justify-center">
          <div className="btn-group">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`btn ${currentPage === page ? "btn-active" : ""}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplatesPage;

