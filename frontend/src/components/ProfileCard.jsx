import { useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { IconCamera, IconPencil } from "./Icons";

// Downscales the picked image client-side so the avatar (stored as a data
// URL in MongoDB — no external file storage for a hackathon-scale app)
// stays small regardless of the original photo's size.
const resizeImage = (file, maxSize = 200) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not read the image"));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

// A profile card with inline editing for photo and name — used on both the
// customer and worker dashboards so everyone can personalize their account.
export default function ProfileCard({ extraMeta }) {
  const { user, updateProfile } = useAuth();
  const fileInputRef = useRef(null);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setSaving(true);
    try {
      const dataUrl = await resizeImage(file);
      await updateProfile({ avatar: dataUrl });
    } catch (err) {
      setError(err.response?.data?.message || "Could not update your photo.");
    } finally {
      setSaving(false);
      e.target.value = "";
    }
  };

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    setSaving(true);
    setError("");
    try {
      await updateProfile({ name: nameInput.trim() });
      setEditingName(false);
    } catch (err) {
      setError(err.response?.data?.message || "Could not update your name.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="sidebar-card profile-card">
      <div className="profile-cover" />

      <div className="profile-avatar-wrap">
        <div
          className="profile-avatar"
          style={user?.avatar ? { backgroundImage: `url(${user.avatar})` } : undefined}
        >
          {!user?.avatar && user?.name?.charAt(0).toUpperCase()}
        </div>
        <button
          type="button"
          className="avatar-edit-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={saving}
          aria-label="Change photo"
        >
          <IconCamera />
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
      </div>

      <div className="profile-body">
        {editingName ? (
          <div className="profile-name-edit">
            <input
              className="field-input"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              maxLength={60}
              autoFocus
            />
            <div className="cta-group profile-name-edit-actions">
              <button type="button" className="btn-primary" onClick={handleSaveName} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setEditingName(false);
                  setNameInput(user?.name || "");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="profile-name-row">
            <span className="profile-name">{user?.name}</span>
            <button type="button" className="profile-edit-btn" onClick={() => setEditingName(true)} aria-label="Edit name">
              <IconPencil />
            </button>
          </div>
        )}

        <div className="profile-email">{user?.email}</div>
        <span className={`profile-role-badge role-${user?.role}`}>{user?.role}</span>
        {extraMeta}
        {error && <p className="error-text profile-error">{error}</p>}
        <div className="profile-meta">
          Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
        </div>
      </div>
    </div>
  );
}
