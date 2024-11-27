import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";
import PreferencesSection from "@/components/UserPreferences";
import placeholder from "../../public/images/profile/default.jpg"

interface Template {
  id: number;
  title: string;
  description: string;
  language: string;
  code: string;
  tags: string;
}

interface UserDetails {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  profileImage?: string;
  createdAt?: string;
  updatedAt?: string;
}

const ProfilePage = () => {
  const { user } = useAuth();
  const router = useRouter();

  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const fetchUserDetails = async () => {
    try {
      const res = await fetch("/api/user/profile", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        setUserDetails(data.user);
      } else {
        console.error("Failed to fetch user details");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/templates?page=1&limit=10&ownedByUser=true");
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates);
      } else {
        console.error("Failed to fetch templates");
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserDetails((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setProfileImage(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const formData = new FormData();
    if (userDetails?.firstName) formData.append("firstName", userDetails.firstName);
    if (userDetails?.lastName) formData.append("lastName", userDetails.lastName);
    if (userDetails?.phoneNumber) formData.append("phoneNumber", userDetails.phoneNumber);
    if (profileImage) formData.append("profileImage", profileImage);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setUserDetails(data.user);
        setEditing(false);
      } else {
        console.error("Failed to save profile updates");
      }
    } catch (error) {
      console.error("Error saving profile updates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError("");
    setPasswordSuccess("");
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwords),
      });
      if (res.ok) {
        setPasswordSuccess("Password updated successfully");
        setPasswords({ currentPassword: "", newPassword: "" });
        setShowPasswordModal(false);
      } else {
        const error = await res.json();
        setPasswordError(error.error || "Failed to update password");
      }
    } catch (error) {
      setPasswordError("Error updating password");
    }
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    fetchUserDetails();
    fetchTemplates();
  }, []);

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      {userDetails && (
        <div className="card shadow-lg bg-base-200 p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="avatar">
                <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img src={userDetails.profileImage || placeholder.src} alt="Profile" />
                </div>
              </div>
              <div className="ml-6">
                <h2 className="text-2xl font-bold">{`${userDetails.firstName} ${userDetails.lastName}`}</h2>
                <p>{userDetails.email}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                className="btn btn-outline btn-secondary btn-sm"
                onClick={() => setEditing(true)}
              >
                Edit Profile
              </button>
              <button
                className="btn btn-outline btn-secondary btn-sm"
                onClick={() => setShowPasswordModal(true)}
              >
                Change Password
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="label">
                <span className="label-text">First Name</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={userDetails.firstName}
                onChange={handleInputChange}
                className="input input-bordered w-full"
                disabled={!editing}
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text">Last Name</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={userDetails.lastName}
                onChange={handleInputChange}
                className="input input-bordered w-full"
                disabled={!editing}
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text">Phone Number</span>
              </label>
              <input
                type="text"
                name="phoneNumber"
                value={userDetails.phoneNumber || ""}
                onChange={handleInputChange}
                className="input input-bordered w-full"
                disabled={!editing}
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text">Profile Image</span>
              </label>
              <input
                type="file"
                className="file-input w-full"
                onChange={handleProfileImageChange}
                disabled={!editing}
              />
            </div>
          </div>

          <div className="mt-4">
            {editing && (
              <button className="btn btn-outline btn-primary" onClick={handleSave} disabled={loading}>
                Save
              </button>
            )}
          </div>
        </div>
      )}

      <PreferencesSection />

      <h2 className="mt-20 text-2xl font-bold mb-4">My Templates</h2>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Title</th>
              <th>Language</th>
              <th>Code Preview</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {templates.length > 0 ? (
              templates.map((template) => (
                <tr key={template.id}>
                  <td>{template.title}</td>
                  <td>{template.language}</td>
                  <td>
                    <pre className="truncate max-w-xs">{template.code}</pre>
                  </td>
                  <td>
                    <button
                      className="btn btn-outline btn-info btn-sm"
                      onClick={() => router.push(`/templates/${template.id}`)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center">
                  No templates found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <button
              className="btn btn-outline btn-sm btn-circle absolute right-2 top-2"
              onClick={() => setShowPasswordModal(false)}
            >
              ✕
            </button>
            <h3 className="font-bold text-lg">Change Password</h3>
            <div className="py-4 space-y-4">
              <div>
                <label className="label">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwords.currentPassword}
                  onChange={handlePasswordInputChange}
                  className="input input-bordered w-full"
                />
              </div>
              <div>
                <label className="label">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwords.newPassword}
                  onChange={handlePasswordInputChange}
                  className="input input-bordered w-full"
                />
              </div>
            </div>
            {passwordError && (
              <p className="text-red-500 text-sm">{passwordError}</p>
            )}
            {passwordSuccess && (
              <p className="text-green-500 text-sm">{passwordSuccess}</p>
            )}
            <div className="modal-action">
              <button
                className="btn btn-outline btn-primary"
                onClick={handlePasswordChange}
                disabled={loading}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;

