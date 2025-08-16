import React, { useState, useEffect } from "react";

function App() {
  const [activeTab, setActiveTab] = useState("location"); // "location" or "social"
  const [location, setLocation] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [socialAnalysis, setSocialAnalysis] = useState(null);
  const [zhongcaoResults, setZhongcaoResults] = useState([]);
  const [isFetchingResults, setIsFetchingResults] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    restaurantName: "",
    dishName: "",
    address: "",
    description: "",
    socialMediaHandle: "",
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);

  const fetchZhongcaoResults = async () => {
    try {
      setIsFetchingResults(true);
      setError(null);
      const res = await fetch("/api/recommendations/zhongcao");
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setZhongcaoResults(data);
    } catch (e) {
      setError(`Failed to fetch saved results: ${e.message}`);
    } finally {
      setIsFetchingResults(false);
    }
  };

  useEffect(() => {
    if (activeTab === "social") {
      fetchZhongcaoResults();
    }
  }, [activeTab]);

  const handleLocationSubmit = async (e) => {
    e.preventDefault();

    if (!location.trim()) {
      setError("Please enter a location");
      return;
    }

    setLoading(true);
    setError(null);
    setRecommendations(null);

    try {
      const response = await fetch(
        `/api/recommendations?location=${encodeURIComponent(location)}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setRecommendations(data);
    } catch (err) {
      setError(`Failed to fetch recommendations: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setError("Please select an image file");
      return;
    }

    setLoading(true);
    setError(null);
    setSocialAnalysis(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await fetch("/api/recommendations/social-upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      setSocialAnalysis(data.result);
      await fetchZhongcaoResults();
    } catch (err) {
      setError(`Failed to analyze image: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setError(null); // Clear any previous errors when new file is selected
  };

  const startEdit = (row) => {
    setEditingId(row.id);
    setEditForm({
      restaurantName: row.restaurantName || "",
      dishName: row.dishName || "",
      address: row.address || "",
      description: row.description || "",
      socialMediaHandle: row.socialMediaHandle || "",
    });
    setError(null); // Clear any previous errors
  };

  const cancelEdit = () => {
    setEditingId(null);
    setError(null);
  };

  const validateEditForm = () => {
    if (!editForm.restaurantName.trim()) {
      setError("Restaurant name is required");
      return false;
    }
    if (!editForm.description.trim()) {
      setError("Description is required");
      return false;
    }
    return true;
  };

  const handleUpdate = async (id) => {
    if (!validateEditForm()) return;

    try {
      setUpdateLoading(true);
      setError(null);

      const res = await fetch(`/api/recommendations/zhongcao/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      const saved = await res.json();
      setZhongcaoResults((prev) => prev.map((r) => (r.id === id ? saved : r)));
      setEditingId(null);
    } catch (e) {
      setError(`Failed to update: ${e.message}`);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDelete = async (id) => {
    // if (!window.confirm("Are you sure you want to delete this record?")) {
    //   return;
    // }

    try {
      setDeleteLoading(id);
      setError(null);

      const res = await fetch(`/api/recommendations/zhongcao/${id}`, {
        method: "DELETE",
      });

      if (!res.ok && res.status !== 204) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      setZhongcaoResults((prev) => prev.filter((r) => r.id !== id));
      if (editingId === id) setEditingId(null);
    } catch (e) {
      setError(`Failed to delete: ${e.message}`);
    } finally {
      setDeleteLoading(null);
    }
  };

  const renderRows = () => {
    return zhongcaoResults.map((r) => {
      const isEditing = editingId === r.id;
      const isDeleting = deleteLoading === r.id;

      return (
        <tr key={r.id}>
          <td>{r.id}</td>
          <td>
            {isEditing ? (
              <input
                value={editForm.restaurantName}
                onChange={(e) =>
                  setEditForm({ ...editForm, restaurantName: e.target.value })
                }
                placeholder="Restaurant name (required)"
                className="edit-input"
              />
            ) : (
              r.restaurantName
            )}
          </td>
          <td>
            {isEditing ? (
              <input
                value={editForm.dishName}
                onChange={(e) =>
                  setEditForm({ ...editForm, dishName: e.target.value })
                }
                placeholder="Dish name (optional)"
                className="edit-input"
              />
            ) : r.dishName ? (
              <span className="pill pill--info">{r.dishName}</span>
            ) : (
              <span className="pill pill--muted">—</span>
            )}
          </td>
          <td>
            {isEditing ? (
              <input
                value={editForm.address}
                onChange={(e) =>
                  setEditForm({ ...editForm, address: e.target.value })
                }
                placeholder="Address (optional)"
                className="edit-input"
              />
            ) : r.address ? (
              <span className="pill">{r.address}</span>
            ) : (
              <span className="pill pill--muted">—</span>
            )}
          </td>
          <td>
            {isEditing ? (
              <textarea
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                placeholder="Description (required)"
                className="edit-textarea"
                rows="3"
              />
            ) : (
              <div className="description-cell">{r.description}</div>
            )}
          </td>
          <td>
            {isEditing ? (
              <input
                value={editForm.socialMediaHandle}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    socialMediaHandle: e.target.value,
                  })
                }
                placeholder="Social media handle (optional)"
                className="edit-input"
              />
            ) : r.socialMediaHandle ? (
              <span className="pill pill--social">{r.socialMediaHandle}</span>
            ) : (
              <span className="pill pill--muted">—</span>
            )}
          </td>
          <td>{new Date(r.processedAt).toLocaleString()}</td>
          <td>
            {isEditing ? (
              <>
                <button
                  className="search-button"
                  onClick={() => handleUpdate(r.id)}
                  disabled={updateLoading}
                  title="Save changes"
                >
                  {updateLoading ? "Saving..." : "Save"}
                </button>
                <button
                  className="search-button cancel-button"
                  onClick={cancelEdit}
                  disabled={updateLoading}
                  title="Cancel editing"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  className="search-button edit-button"
                  onClick={() => startEdit(r)}
                  disabled={isDeleting}
                  title="Edit row"
                >
                  Edit
                </button>
                <button
                  className="search-button delete-button"
                  onClick={() => handleDelete(r.id)}
                  disabled={isDeleting}
                  title="Delete row"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </>
            )}
          </td>
        </tr>
      );
    });
  };

  const renderTable = () => (
    <div style={{ marginTop: "24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <h3>Saved Zhongcao Results ({zhongcaoResults.length})</h3>
        <button
          className="search-button refresh-button"
          onClick={fetchZhongcaoResults}
          disabled={isFetchingResults}
        >
          {isFetchingResults ? "Refreshing..." : "🔄 Refresh"}
        </button>
      </div>
      {isFetchingResults ? (
        <div className="loading">
          <p>Loading saved results…</p>
        </div>
      ) : zhongcaoResults.length === 0 ? (
        <div className="empty-state">
          <p>No saved results found. Upload an image to get started!</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="results-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Restaurant</th>
                <th>Dish</th>
                <th>Address</th>
                <th>Description</th>
                <th>Social</th>
                <th>Processed At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>{renderRows()}</tbody>
          </table>
        </div>
      )}
    </div>
  );

  const getImagePreview = () => {
    if (!selectedFile) return [];
    const imageUrl = URL.createObjectURL(selectedFile);
    return (
      <div style={{ marginBottom: "12px" }}>
        <img src={imageUrl} alt="preview" style={{ maxWidth: "200px" }} />
      </div>
    );
  };

  const parseRecommendations = (text) => {
    try {
      const fenced = text.match(/```(?:json)?\n([\s\S]*?)\n```/);
      if (fenced && fenced[1]) {
        const parsed = JSON.parse(fenced[1]);
        return Array.isArray(parsed) ? parsed : [];
      }
      const firstBracket = text.indexOf("[");
      const lastBracket = text.lastIndexOf("]");
      if (
        firstBracket !== -1 &&
        lastBracket !== -1 &&
        lastBracket > firstBracket
      ) {
        const maybeJson = text.slice(firstBracket, lastBracket + 1);
        const parsed = JSON.parse(maybeJson);
        return Array.isArray(parsed) ? parsed : [];
      }
      const parsed = JSON.parse(text);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>🍽️ Restaurant Recommendations</h1>
        <p>
          Get personalized restaurant suggestions or analyze social media images
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === "location" ? "active" : ""}`}
          onClick={() => setActiveTab("location")}
        >
          📍 Location Search
        </button>
        <button
          className={`tab-button ${activeTab === "social" ? "active" : ""}`}
          onClick={() => setActiveTab("social")}
        >
          📸 Social Media Analysis
        </button>
      </div>

      {/* Location-based Recommendations Tab */}
      {activeTab === "location" && (
        <>
          <form className="search-form" onSubmit={handleLocationSubmit}>
            <div className="form-group">
              <label htmlFor="location">Enter a location:</label>
              <input
                type="text"
                id="location"
                placeholder="e.g., Los Angeles, CA or 90025"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={loading}
              />
            </div>
            <button type="submit" className="search-button" disabled={loading}>
              {loading ? "Searching..." : "Get Recommendations"}
            </button>
          </form>

          {loading && (
            <div className="loading">
              <p>🔎 Fetching recommendations...</p>
            </div>
          )}

          {recommendations && (
            <div className="recommendations">
              <h2>Recommended Restaurants</h2>
              {parseRecommendations(recommendations.recommendations).map(
                (r, idx) => (
                  <div key={idx} className="restaurant-card">
                    <div className="restaurant-name">{r.name}</div>
                    {r.address && (
                      <div className="restaurant-info">
                        📍 Address: {r.address}
                      </div>
                    )}
                    {r.phone && (
                      <div className="restaurant-info">📞 Phone: {r.phone}</div>
                    )}
                    {r.website && (
                      <div className="restaurant-info">
                        🔗 Website:{" "}
                        <a href={r.website} target="_blank" rel="noreferrer">
                          {r.website}
                        </a>
                      </div>
                    )}
                    {r.reason && (
                      <div className="restaurant-reason">📝 {r.reason}</div>
                    )}
                  </div>
                )
              )}
            </div>
          )}
        </>
      )}

      {/* Social Media Analysis Tab */}
      {activeTab === "social" && (
        <>
          <form className="search-form" onSubmit={handleSocialSubmit}>
            <div className="form-group">
              <label htmlFor="image">Upload Restaurant Image:</label>
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleFileChange}
                disabled={loading}
                className="file-input"
              />
              <p className="file-help">
                Upload a screenshot or photo of a restaurant from social media
              </p>
              {getImagePreview()}
            </div>
            <button
              type="submit"
              className="search-button"
              disabled={loading || !selectedFile}
            >
              {loading ? "Analyzing..." : "Analyze Image"}
            </button>
          </form>

          {loading && (
            <div className="loading">
              <p>🤖 Analyzing restaurant image...</p>
              <p>
                This may take a few moments as we extract information from the
                image.
              </p>
            </div>
          )}

          {socialAnalysis && (
            <>
              <div
                style={{ padding: "20px", borderBottom: "1px solid #e1e1e1" }}
              >
                <h2>📸 Image Analysis Results</h2>
                <p style={{ color: "#666", marginTop: "5px" }}>
                  Analyzed: {socialAnalysis.originalFilename}
                </p>
              </div>

              <div className="restaurant-card">
                <div className="restaurant-name">
                  {socialAnalysis.restaurantName}
                </div>

                {socialAnalysis.address && (
                  <div className="restaurant-info">
                    📍 Address: {socialAnalysis.address}
                  </div>
                )}

                {socialAnalysis.dishName && (
                  <div className="restaurant-info">
                    🍽️ Dish: {socialAnalysis.dishName}
                  </div>
                )}

                <div className="restaurant-reason">
                  📝 {socialAnalysis.description}
                </div>

                {socialAnalysis.socialMediaHandle && (
                  <div className="restaurant-info">
                    📱 Social: {socialAnalysis.socialMediaHandle}
                  </div>
                )}

                <div className="analysis-meta">
                  <small>
                    Processed at:{" "}
                    {new Date(socialAnalysis.processedAt).toLocaleString()}
                  </small>
                </div>
              </div>
            </>
          )}

          {renderTable()}
        </>
      )}

      {error && (
        <div className="error">
          <strong>Error:</strong> {error}
          <button
            onClick={() => setError(null)}
            className="error-close"
            style={{
              marginLeft: "10px",
              background: "none",
              border: "none",
              color: "inherit",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
