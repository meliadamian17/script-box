import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";

const CreatePost = () => {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [template, setTemplate] = useState("");
  const [selectedTemplates, setSelectedTemplates] = useState<any[]>([]);
  const [templateSuggestions, setTemplateSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/posts/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          content,
          tags,
          rating: 0,
          templates: selectedTemplates.map((t) => t.id),
        }),
      });

      if (response.ok) {
        const newPost = await response.json();
        router.push(`/blogs/${newPost.id}`);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "An unexpected error occurred.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTemplates = async (query: string) => {
    try {
      const res = await fetch(`/api/templates?title=${query}`);
      const data = await res.json();
      setTemplateSuggestions(data.templates || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const handleAddTemplate = (template) => {
    if (!selectedTemplates.some((t) => t.id === template.id)) {
      setSelectedTemplates([...selectedTemplates, template]);
    }
    setTemplate("");
    setTemplateSuggestions([]);
  };

  const handleRemoveTemplate = (templateId) => {
    setSelectedTemplates(selectedTemplates.filter((t) => t.id !== templateId));
  };

  useEffect(() => {
    const templates = router.query.templates ? JSON.parse(router.query.templates as string) : [];
    const fetchLinkedTemplates = async () => {
      try {
        const res = await fetch(`/api/templates?ids=${templates.join(",")}`);
        const data = await res.json();
        setSelectedTemplates(data.templates || []);
      } catch (error) {
        console.error("Error fetching linked templates:", error);
      }
    };

    if (templates.length > 0) {
      fetchLinkedTemplates();
    }
  }, [router.query.templates]);

  useEffect(() => {
    if (template) {
      fetchTemplates(template);
    } else {
      setTemplateSuggestions([]);
    }
  }, [template]);

  return (
    <div className="max-w-xl mx-auto p-6 bg-base-100 shadow-lg rounded-lg mt-6">
      <h1 className="text-2xl font-bold text-center mb-6">Create New Blog Post</h1>

      {error && <p className="text-error text-center mb-4">{error}</p>}
      {success && (
        <p className="text-success text-center mb-4">
          Post created successfully!
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Title</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Description */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Description</span>
          </label>
          <textarea
            className="textarea textarea-bordered w-full"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
        </div>

        {/* Content */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Content</span>
          </label>
          <textarea
            className="textarea textarea-bordered w-full"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          ></textarea>
        </div>

        {/* Tags */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Tags</span>
          </label>
          <input
            type="text"
            placeholder="Press Enter to add tags"
            className="input input-bordered w-full"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const value = e.currentTarget.value.trim();
                if (value && !tags.includes(value)) {
                  setTags([...tags, value]);
                }
                e.currentTarget.value = "";
              }
            }}
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="badge badge-primary badge-outline cursor-pointer"
                onClick={() => setTags(tags.filter((t) => t !== tag))}
              >
                {tag} <span className="ml-2 text-sm">x</span>
              </span>
            ))}
          </div>
        </div>

        {/* Templates */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Add Templates</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full"
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
          />
          {templateSuggestions.length > 0 && (
            <ul className="bg-white border mt-1 shadow-md rounded max-h-40 overflow-y-auto">
              {templateSuggestions.map((template) => (
                <li
                  key={template.id}
                  className="p-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleAddTemplate(template)}
                >
                  <span className="font-bold">{template.title}</span> -{" "}
                  <span className="italic">{template.language}</span> by{" "}
                  <span>{template.user.firstName} {template.user.lastName}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedTemplates.map((template) => (
              <span
                key={template.id}
                className="badge badge-secondary badge-outline cursor-pointer"
                onClick={() => handleRemoveTemplate(template.id)}
              >
                {template.title} <span className="ml-2 text-sm">x</span>
              </span>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={`btn btn-primary w-full ${isLoading ? "loading" : ""}`}
        >
          {isLoading ? "Submitting..." : "Create Post"}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;

