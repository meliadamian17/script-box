import { useState, useEffect } from "react";
import { useRouter } from "next/router";


const CreatePost = () => {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [template, setTemplate] = useState("");
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [templateSuggestions, setTemplateSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [duplicateError, setDuplicateError] = useState(false);

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
          template,
          rating: 0,
        }),
      });

      if (response.ok) {
        const newPost = await response.json()
        router.push(`/blogs/${newPost.id}`)
        setSuccess(true);

        setTitle("");
        setDescription("");
        setContent("");
        setTags([]);
        setTemplate("");

      }

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

  useEffect(() => {
    if (template) {
      fetchTemplates(template);
    } else {
      setTemplateSuggestions([]);
      setShowSuggestions(false);
    }
  }, [template]);

  return (
    <div className="max-w-xl mx-auto p-6 bg-base-100 shadow-lg rounded-lg mt-6 relative">
      <h1 className="text-2xl font-bold text-center mb-6 ml-[-5]">
        Create New Blog Post
      </h1>

      {error && <p className="text-error text-center mb-4">{error}</p>}
      {success && (
        <p className="text-success text-center mb-4">
          Post created successfully!
        </p>
      )}
      {duplicateError && (
        <p className="text-error text-center mb-4">
          Duplicate tags are not allowed!
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 relative">
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

        <div className="form-control">
          <label className="label">
            <span className="label-text">Tags</span>
          </label>
          <div className="flex flex-wrap gap-2 mb-4">
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
          <input
            type="text"
            placeholder="Press Enter to add tags"
            className="input input-bordered w-full focus:outline-none"
            onKeyDown={handleTagInput}
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Template</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full"
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          {showSuggestions && templateSuggestions.length > 0 && (
            <ul
              className="absolute bg-base-100 border border-gray-300 mt-1 max-h-40 overflow-y-auto w-full z-10"
              style={{ top: "100%", left: 0 }}
            >
              {templateSuggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="p-2 hover:bg-gray-200 cursor-pointer"
                  onClick={() => {
                    setTemplate(suggestion.title);
                    setShowSuggestions(false);
                  }}
                >
                  {suggestion.title}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="submit"
          className={`btn btn-primary absolute top-[-4rem] right-0 ${isLoading ? "loading" : ""
            }`}
        >
          {isLoading ? "Submitting..." : "Create Post"}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
