import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  PlusIcon,
  EllipsisVerticalIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";


interface Template {
  id: number;
  title: string;
}

interface TemplateSidebarProps {
  onCreate: () => void;
  onRename: (id: number, newName: string) => void;
  onDelete: (id: number) => void;
}

const TemplateSidebar: React.FC<TemplateSidebarProps> = ({ onCreate, onRename, onDelete }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [search, setSearch] = useState("");
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [collapsed, setCollapsed] = useState(true);
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [newName, setNewName] = useState("");
  const [dropdownId, setDropdownId] = useState<number | null>(null);
  const router = useRouter();

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`/api/templates?ownedByUser=true`);
      const data = await res.json();
      setTemplates(data.templates || []);
      setFilteredTemplates(data.templates || []);
    } catch (err) {
      console.error("Failed to fetch templates:", err);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    setFilteredTemplates(
      templates.filter((template) =>
        template.title.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, templates]);

  const handleRename = async () => {

    console.log(renamingId, newName.trim(), templates.find((t) => t.id == renamingId)?.title)
    if (renamingId && newName.trim() && newName.trim() !== templates.find((t) => t.id == renamingId)?.title) {
      await onRename(renamingId, newName);
      fetchTemplates();
    }
    setRenamingId(null);
    setNewName("");

  };

  const handleDelete = async (id: number) => {
    const currentTemplateId = parseInt(router.query.id as string, 10);


    if (currentTemplateId === id) {
      const remainingTemplates = templates.filter((template) => template.id !== id);
      const nextTemplate = remainingTemplates[0];

      if (nextTemplate) {
        router.push(`/templates/${nextTemplate.id}`);
      } else {
        router.push(`/templates`);
      }
    }


    await onDelete(id);
    setDropdownId(null);
    fetchTemplates();
  };

  const handleCreate = async () => {
    await onCreate();
    fetchTemplates();
  };

  return (
    <div
      className={`relative flex flex-col bg-base-200 h-screen border-r shadow-lg transition-all duration-500 ease-in-out ${collapsed ? "w-20" : "w-64"
        }`}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b bg-base-300">
        {!collapsed && <h2 className="text-lg font-semibold">Templates</h2>}
        <button
          className="btn btn-ghost btn-circle"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronDoubleRightIcon className="w-5 h-5" />
          ) : (
            <ChevronDoubleLeftIcon className="w-5 h-5" />
          )}
        </button>
      </div>

      {!collapsed && (
        <>
          <div className="px-4 py-2">
            <input
              type="text"
              placeholder="Search templates"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>

          <div className="px-4 py-2">
            <button
              className="btn btn-primary w-full flex items-center justify-center"
              onClick={handleCreate}
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Create New
            </button>
          </div>

          <ul className="flex-grow overflow-y-auto px-4 py-2 space-y-2">
            {filteredTemplates.map((template) => (
              <li
                key={template.id}
                className={`relative p-2 rounded-md transition-colors duration-300 cursor-pointer ${router.query.id === String(template.id)
                  ? "bg-primary text-primary-content"
                  : "hover:bg-base-300"
                  }`}
                onClick={() => {
                  if (renamingId !== template.id && dropdownId !== template.id) {
                    router.push(`/templates/${template.id}`);
                  }
                }}
              >
                <div className="flex justify-between items-center">
                  {renamingId === template.id ? (
                    <div className="flex items-center space-x-2 w-full">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="input input-sm input-bordered text-primary flex-grow max-w-32"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button
                        className="btn btn-sm btn-circle btn-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRename();
                        }}
                      >
                        <CheckIcon className="w-5 h-5" />
                      </button>
                      <button
                        className="btn btn-sm btn-circle btn-ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRenamingId(null);
                        }}
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <span className="truncate px-2">{template.title}</span>
                  )}
                  {renamingId !== template.id && (
                    <div className="dropdown dropdown-left relative">
                      <label
                        tabIndex={0}
                        className={`btn btn-ghost btn-circle btn-sm ${router.query.id === String(template.id)
                          ? "hover:bg-primary-dark"
                          : ""
                          }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDropdownId(dropdownId === template.id ? null : template.id);
                        }}
                      >
                        <EllipsisVerticalIcon className="w-5 h-5" />
                      </label>
                      {dropdownId === template.id && (
                        <ul
                          tabIndex={0}
                          className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-40 absolute z-10"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <li>
                            <button
                              className="text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                setRenamingId(template.id);
                                setNewName(template.title);
                                setDropdownId(null);
                              }}
                            >
                              Rename
                            </button>
                          </li>
                          <li>
                            <button
                              className="text-red-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(template.id);
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
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default TemplateSidebar;

