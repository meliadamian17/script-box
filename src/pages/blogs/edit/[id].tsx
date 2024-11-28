import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";

const EditPost = () => {
  const router = useRouter();
  const { user } = useAuth(); // Get the current user

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [post, setPost] = useState<BlogPost | null>(null);
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [template, setTemplate] = useState("");
  const [selectedTemplates, setSelectedTemplates] = useState<any[]>([]);
  const [templateSuggestions, setTemplateSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicateError, setDuplicateError] = useState(false);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLUListElement>(null);

  const id = Number(router.query.id);

  const fetchPost = async () => {
    const response = await fetch(`/api/posts/${id}`);
    const data = await response.json();
    if (response.ok) {
      setPost(data.post);
      // Check if the user is authorized to edit the post
      if (user?.id !== data.post.authorId && user?.role !== "ADMIN") {
        alert("You are not authorized to edit this post.");
        router.push("/blogs");
        return;
      }
      setTitle(data.post.title);
      setDescription(data.post.description);
      setContent(data.post.content);
      const tagsArray = data.post.tags.split(",").map((tag) => tag.trim());
      setTags(tagsArray);

      // Set selected templates
      setSelectedTemplates(data.post.templates || []);
    } else {
      console.error("Failed to fetch post");
    }
  };

  useEffect(() => {
    if (id && user) {
      fetchPost();
    }
  }, [id, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          content,
          tags: tags.join(","),
          templates: selectedTemplates.map((t) => t.id),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update the post.");
      }

      await response.json();

      // Redirect back to the posts page after successful update
      router.push("/blogs");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const input = e.currentTarget.value.trim();
      if (input && !tags.includes(input)) {
        setTags([...tags, input]);
        setDuplicateError(false);
      } else {
        setDuplicateError(true);
      }
      e.currentTarget.value = "";
      e.preventDefault();
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const fetchTemplates = async (query: string) => {
    setLoadingSuggestions(true);
    try {
      const res = await fetch(`/api/templates?title=${query}`);
      const data = await res.json();
      setTemplateSuggestions(data.templates || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error fetching template suggestions:", error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleAddTemplate = (template) => {
    if (!selectedTemplates.some((t) => t.id === template.id)) {
      setSelectedTemplates([...selectedTemplates, template]);
    }
    setTemplate("");
    setTemplateSuggestions([]);
    setShowSuggestions(false);
  };

  const handleRemoveTemplate = (templateId) => {
    setSelectedTemplates(selectedTemplates.filter((t) => t.id !== templateId));
  };

  useEffect(() => {
    if (template) {
      fetchTemplates(template);
    } else {
      setTemplateSuggestions([]);
      setShowSuggestions(false);
    }
  }, [template]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="max-w-xl mx-auto p-6 bg-base-100 shadow-lg rounded-lg mt-6">
      <h1 className="text-2xl font-bold text-center mb-6">Edit Blog Post</h1>

      {error && <p className="text-error text-center mb-4">{error}</p>}
      {duplicateError && (
        <p className="text-error text-center mb-4">
          Duplicate tags are not allowed!
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
            onKeyDown={handleTagInput}
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="badge badge-primary badge-outline cursor-pointer"
                onClick={() => removeTag(tag)}
              >
                {tag} <span className="ml-2 text-sm">x</span>
              </span>
            ))}
          </div>
        </div>

        {/* Templates */}
        <div className="form-control relative">
          <label className="label">
            <span className="label-text">Add Templates</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full"
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
          />
          {showSuggestions && templateSuggestions.length > 0 && (
            <ul
              ref={suggestionsRef}
              className="absolute bg-base-100 border mt-1 max-h-40 overflow-y-auto w-full z-10 shadow-md rounded"
            >
              {templateSuggestions.map((template) => (
                <li
                  key={template.id}
                  className="p-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleAddTemplate(template)}
                >
                  <span className="font-bold">{template.title}</span> -{" "}
                  <span className="italic">{template.language}</span> by{" "}
                  <span>
                    {template.user.firstName} {template.user.lastName}
                  </span>
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
          {isLoading ? "Updating..." : "Update Post"}
        </button>
      </form>
    </div>
  );
};

export default EditPost;

