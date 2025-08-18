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
  const BACKEND_URL =
    import.meta.env?.VITE_BACKEND_URL || "http://localhost:5001";
  const [menuBudget, setMenuBudget] = useState("");
  const [menuNote, setMenuNote] = useState("");
  const [menuSelectedFile, setMenuSelectedFile] = useState(null);
  const [menuResult, setMenuResult] = useState(null);
  const [menuLoading, setMenuLoading] = useState(false);
  const [rebudgetLoading, setRebudgetLoading] = useState(false);
  const [lastLoading, setLastLoading] = useState(false);
  const [showExtractedMenu, setShowExtractedMenu] = useState(false);
  // Transactions state
  const [txUserId, setTxUserId] = useState("1");
  const [receiptFile, setReceiptFile] = useState(null);
  const [bulkFiles, setBulkFiles] = useState([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [vouchers, setVouchers] = useState([]);
  const [vouchersLoading, setVouchersLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [voucherEditId, setVoucherEditId] = useState(null);
  const [voucherEditForm, setVoucherEditForm] = useState({
    merchant: "",
    date: "",
    total_amount: "",
    category: "",
    notes: "",
  });
  const [confirmingVoucherId, setConfirmingVoucherId] = useState(null);
  const [deletingVoucherId, setDeletingVoucherId] = useState(null);

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

  useEffect(() => {
    if (activeTab === "transactions") {
      refreshVouchersAndTransactions();
    }
  }, [activeTab, txUserId]);

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
    setError(null);
  };

  const handleMenuFileChange = (e) => {
    const file = e.target.files[0] || null;
    setMenuSelectedFile(file);
    setError(null);
  };

  const handleMenuRecommendSubmit = async (e) => {
    e.preventDefault();

    if (!menuSelectedFile) {
      setError("Please select a menu image file");
      return;
    }
    const budgetNumber = Number(menuBudget);
    if (!Number.isFinite(budgetNumber) || budgetNumber <= 0) {
      setError("Please enter a valid budget (> 0)");
      return;
    }

    setMenuLoading(true);
    setError(null);
    setMenuResult(null);

    try {
      const formData = new FormData();
      formData.append("image", menuSelectedFile);
      formData.append("budget", String(budgetNumber));
      if (menuNote) formData.append("note", menuNote);

      const response = await fetch(`${BACKEND_URL}/recommendations/recommend`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setMenuResult(data);
      setShowExtractedMenu(false);
    } catch (err) {
      setError(`Failed to recommend: ${err.message}`);
    } finally {
      setMenuLoading(false);
    }
  };

  const handleRebudget = async () => {
    const budgetNumber = Number(menuBudget);
    if (!Number.isFinite(budgetNumber) || budgetNumber <= 0) {
      setError("Please enter a valid budget (> 0)");
      return;
    }

    setRebudgetLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/recommendations/rebudget`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budget: budgetNumber, note: menuNote || "" }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setMenuResult(data);
    } catch (err) {
      setError(`Failed to re-budget: ${err.message}`);
    } finally {
      setRebudgetLoading(false);
    }
  };

  const handleFetchLast = async () => {
    setLastLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/recommendations/last`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      const data = await response.json();
      setMenuResult(data);
      if (data?.budget) setMenuBudget(String(data.budget));
    } catch (err) {
      setError(`Failed to fetch last recommendation: ${err.message}`);
    } finally {
      setLastLoading(false);
    }
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
    setError(null);
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

  const getCurrencySymbol = (currency) => {
    if (!currency) return "";
    const c = String(currency).trim();
    if (c === "$" || c.toUpperCase() === "USD") return "$";
    if (c.toUpperCase() === "EUR" || c === "€") return "€";
    if (c.toUpperCase() === "GBP" || c === "£") return "£";
    return c.length <= 3 ? c : "";
  };

  const formatMoney = (amount, currency) => {
    const symbol = getCurrencySymbol(currency);
    const value = Number(amount);
    if (!Number.isFinite(value)) return "—";
    return `${symbol}${value.toFixed(2)}`;
  };

  const renderMenuRecommendation = () => {
    if (!menuResult) return null;
    const mi = menuResult.menuInfo || null;
    const rec = menuResult.recommendation || null;

    if (!rec) {
      return (
        <div className="restaurant-card" style={{ marginTop: 16 }}>
          <div className="restaurant-name">Menu Recommendation</div>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {JSON.stringify(menuResult, null, 2)}
          </pre>
        </div>
      );
    }

    const currency = rec.currency || mi?.currency || "$";

    return (
      <div className="results" style={{ marginTop: 16 }}>
        <div className="restaurant-card">
          <div className="menu-summary">
            <div className="menu-summary__title">Menu Recommendation</div>
            <div className="menu-summary__chips">
              <span
                className={`chip ${
                  rec.withinBudget ? "chip--ok" : "chip--over"
                }`}
              >
                {rec.withinBudget ? "Within budget" : "Over budget"}
              </span>
              {typeof rec.budget === "number" && (
                <span className="chip">
                  Budget: {formatMoney(rec.budget, currency)}
                </span>
              )}
              <span className="chip">
                Total: {formatMoney(rec.total, currency)}
              </span>
              {menuResult.cached && (
                <span className="chip chip--info">Cached</span>
              )}
            </div>
          </div>

          {rec.rationale && (
            <div className="restaurant-reason" style={{ marginTop: 10 }}>
              {rec.rationale}
            </div>
          )}

          <div className="table-wrapper" style={{ marginTop: 12 }}>
            <table className="results-table menu-items-table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>Qty</th>
                  <th>Item</th>
                  <th style={{ width: 140 }}>Unit</th>
                  <th style={{ width: 160 }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {(rec.items || []).map((it, idx) => (
                  <tr key={idx}>
                    <td>{Number(it.qty) || 1}</td>
                    <td>{it.name}</td>
                    <td>{formatMoney(it.unit_price, currency)}</td>
                    <td>{formatMoney(it.subtotal, currency)}</td>
                  </tr>
                ))}
                <tr>
                  <td
                    colSpan={3}
                    style={{ textAlign: "right", fontWeight: 700 }}
                  >
                    Total
                  </td>
                  <td style={{ fontWeight: 700 }}>
                    {formatMoney(rec.total, currency)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {mi?.items?.length ? (
            <div style={{ marginTop: 16 }}>
              <button
                className="search-button refresh-button"
                onClick={() => setShowExtractedMenu((v) => !v)}
              >
                {showExtractedMenu
                  ? "Hide Extracted Menu"
                  : `Show Extracted Menu (${mi.items.length})`}
              </button>

              {showExtractedMenu && (
                <div className="table-wrapper" style={{ marginTop: 12 }}>
                  <table className="results-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th style={{ width: 160 }}>Price</th>
                        <th style={{ width: 140 }}>Category</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mi.items.map((m, i) => (
                        <tr key={i}>
                          <td>{m.name}</td>
                          <td className="description-cell">
                            {m.description || "—"}
                          </td>
                          <td>{formatMoney(m.price, mi.currency)}</td>
                          <td>{m.category || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  // Transactions: API helpers
  const fetchVouchers = async () => {
    try {
      setVouchersLoading(true);
      const res = await fetch(
        `${BACKEND_URL}/transactions/vouchers?user_id=${encodeURIComponent(
          txUserId || "1"
        )}`
      );
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setVouchers(Array.isArray(data.vouchers) ? data.vouchers : []);
    } catch (e) {
      setError(`Failed to fetch vouchers: ${e.message}`);
    } finally {
      setVouchersLoading(false);
    }
  };

  const fetchUserTransactions = async () => {
    try {
      setTransactionsLoading(true);
      const res = await fetch(
        `${BACKEND_URL}/transactions/transactions?user_id=${encodeURIComponent(
          txUserId || "1"
        )}`
      );
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setTransactions(
        Array.isArray(data.transactions) ? data.transactions : []
      );
    } catch (e) {
      setError(`Failed to fetch transactions: ${e.message}`);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const refreshVouchersAndTransactions = async () => {
    await Promise.all([fetchVouchers(), fetchUserTransactions()]);
  };

  const onReceiptFileChange = (e) => {
    setReceiptFile(e.target.files?.[0] || null);
    setError(null);
  };

  const onBulkFilesChange = (e) => {
    setBulkFiles(Array.from(e.target.files || []));
    setError(null);
  };

  const handleReceiptUpload = async (e) => {
    e.preventDefault();
    if (!receiptFile) {
      setError("Please select a receipt image file");
      return;
    }
    try {
      setUploadLoading(true);
      setError(null);
      const form = new FormData();
      form.append("receipt", receiptFile);
      form.append("user_id", String(parseInt(txUserId) || 1));
      const res = await fetch(`${BACKEND_URL}/transactions/upload`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      await refreshVouchersAndTransactions();
      setReceiptFile(null);
    } catch (e) {
      setError(`Upload failed: ${e.message}`);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!bulkFiles.length) {
      setError("Please select one or more receipt files");
      return;
    }
    try {
      setBulkLoading(true);
      setError(null);
      const form = new FormData();
      for (const f of bulkFiles) form.append("receipts", f);
      form.append("user_id", String(parseInt(txUserId) || 1));
      const res = await fetch(
        `${BACKEND_URL}/transactions/voucher/bulk-upload`,
        {
          method: "POST",
          body: form,
        }
      );
      if (!res.ok && res.status !== 207) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      await refreshVouchersAndTransactions();
      setBulkFiles([]);
    } catch (e) {
      setError(`Bulk upload failed: ${e.message}`);
    } finally {
      setBulkLoading(false);
    }
  };

  const startVoucherEdit = (v) => {
    setVoucherEditId(v.id);
    const p = v.parsed_data || {};
    setVoucherEditForm({
      merchant: p.merchant || "",
      date: p.date || "",
      total_amount: p.total_amount ?? "",
      category: p.category || p.transaction_category || "",
      notes: p.notes || "",
    });
  };

  const cancelVoucherEdit = () => {
    setVoucherEditId(null);
  };

  const saveVoucherEdit = async (id) => {
    try {
      const payload = {};
      for (const k of Object.keys(voucherEditForm)) {
        if (voucherEditForm[k] !== "" && voucherEditForm[k] !== null) {
          payload[k] = voucherEditForm[k];
        }
      }
      const res = await fetch(`${BACKEND_URL}/transactions/voucher/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      await fetchVouchers();
      setVoucherEditId(null);
    } catch (e) {
      setError(`Failed to save voucher: ${e.message}`);
    }
  };

  const confirmVoucher = async (id) => {
    try {
      setConfirmingVoucherId(id);
      const res = await fetch(
        `${BACKEND_URL}/transactions/voucher/${id}/confirm`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      await refreshVouchersAndTransactions();
    } catch (e) {
      setError(`Failed to confirm voucher: ${e.message}`);
    } finally {
      setConfirmingVoucherId(null);
    }
  };

  const deleteVoucher = async (id) => {
    try {
      setDeletingVoucherId(id);
      const res = await fetch(`${BACKEND_URL}/transactions/voucher/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      await fetchVouchers();
    } catch (e) {
      setError(`Failed to delete voucher: ${e.message}`);
    } finally {
      setDeletingVoucherId(null);
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
        <button
          className={`tab-button ${activeTab === "menu" ? "active" : ""}`}
          onClick={() => setActiveTab("menu")}
        >
          📜 Menu Budget
        </button>
        <button
          className={`tab-button ${
            activeTab === "transactions" ? "active" : ""
          }`}
          onClick={() => setActiveTab("transactions")}
        >
          💳 Transactions
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

      {/* Menu Budget Tab */}
      {activeTab === "menu" && (
        <>
          <form className="search-form" onSubmit={handleMenuRecommendSubmit}>
            <div className="form-group">
              <label htmlFor="menu-image">Upload Menu Image:</label>
              <input
                type="file"
                id="menu-image"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleMenuFileChange}
                disabled={menuLoading}
                className="file-input"
              />
              <p className="file-help">Supported: JPG, PNG, WEBP. Max 6MB.</p>
            </div>

            <div className="form-group">
              <label htmlFor="menu-budget">Budget:</label>
              <input
                type="number"
                id="menu-budget"
                placeholder="Enter your budget"
                value={menuBudget}
                onChange={(e) => setMenuBudget(e.target.value)}
                min="1"
                step="1"
                disabled={menuLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="menu-note">Note (optional):</label>
              <input
                type="text"
                id="menu-note"
                placeholder="Any preferences or notes"
                value={menuNote}
                onChange={(e) => setMenuNote(e.target.value)}
                disabled={menuLoading}
              />
            </div>

            <button
              type="submit"
              className="search-button"
              disabled={menuLoading || !menuSelectedFile}
            >
              {menuLoading ? "Recommending..." : "Recommend within Budget"}
            </button>
          </form>

          <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
            <button
              className="search-button"
              onClick={handleRebudget}
              disabled={rebudgetLoading}
              title="Recalculate using cached menu"
            >
              {rebudgetLoading
                ? "Recalculating..."
                : "♻️ Recalculate Budget Only"}
            </button>
            <button
              className="search-button refresh-button"
              onClick={handleFetchLast}
              disabled={lastLoading}
            >
              {lastLoading ? "Loading..." : "📦 Load Last Result"}
            </button>
          </div>

          {renderMenuRecommendation()}
        </>
      )}

      {/* Transactions Tab */}
      {activeTab === "transactions" && (
        <>
          <form className="search-form" onSubmit={handleReceiptUpload}>
            <div className="form-group">
              <label htmlFor="tx-user">User ID:</label>
              <input
                type="number"
                id="tx-user"
                value={txUserId}
                onChange={(e) => setTxUserId(e.target.value)}
                min="1"
              />
            </div>
            <div className="form-group">
              <label htmlFor="receipt-file">Upload receipt:</label>
              <input
                type="file"
                id="receipt-file"
                accept="image/*"
                onChange={onReceiptFileChange}
                disabled={uploadLoading}
                className="file-input"
              />
              <p className="file-help">
                Supported: JPG, PNG, WEBP, HEIC/HEIF, GIF, BMP, TIFF. Max 10MB.
              </p>
            </div>
            <button
              type="submit"
              className="search-button"
              disabled={uploadLoading || !receiptFile}
            >
              {uploadLoading ? "Uploading..." : "Upload & Parse"}
            </button>
          </form>

          <form
            className="search-form"
            onSubmit={handleBulkUpload}
            style={{ marginTop: 12 }}
          >
            <div className="form-group">
              <label htmlFor="bulk-files">Bulk upload (up to 10):</label>
              <input
                type="file"
                id="bulk-files"
                multiple
                accept="image/*"
                onChange={onBulkFilesChange}
                disabled={bulkLoading}
                className="file-input"
              />
            </div>
            <button
              type="submit"
              className="search-button"
              disabled={bulkLoading || bulkFiles.length === 0}
            >
              {bulkLoading
                ? "Uploading..."
                : `Upload ${bulkFiles.length || 0} files`}
            </button>
            <button
              type="button"
              className="search-button refresh-button"
              onClick={refreshVouchersAndTransactions}
              disabled={vouchersLoading || transactionsLoading}
              style={{ marginLeft: 8 }}
            >
              {vouchersLoading || transactionsLoading
                ? "Refreshing..."
                : "🔄 Refresh"}
            </button>
          </form>

          <div className="results" style={{ marginTop: 16 }}>
            <div className="restaurant-card">
              <div className="menu-summary__title">Vouchers</div>
              <div className="table-wrapper" style={{ marginTop: 12 }}>
                <table className="results-table">
                  <thead>
                    <tr>
                      <th style={{ width: 70 }}>ID</th>
                      <th>Merchant</th>
                      <th style={{ width: 140 }}>Total</th>
                      <th style={{ width: 130 }}>Date</th>
                      <th>Status</th>
                      <th style={{ width: 280 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vouchersLoading ? (
                      <tr>
                        <td colSpan={6}>Loading…</td>
                      </tr>
                    ) : vouchers.length === 0 ? (
                      <tr>
                        <td colSpan={6}>No vouchers found.</td>
                      </tr>
                    ) : (
                      vouchers.map((v) => {
                        const p = v.parsed_data || {};
                        const isEditing = voucherEditId === v.id;
                        const status =
                          p && Object.keys(p).length ? "processed" : "pending";
                        return (
                          <tr key={v.id}>
                            <td>{v.id}</td>
                            <td>
                              {isEditing ? (
                                <input
                                  value={voucherEditForm.merchant}
                                  onChange={(e) =>
                                    setVoucherEditForm({
                                      ...voucherEditForm,
                                      merchant: e.target.value,
                                    })
                                  }
                                  className="edit-input"
                                  placeholder="Merchant"
                                />
                              ) : (
                                p.merchant || "—"
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={voucherEditForm.total_amount}
                                  onChange={(e) =>
                                    setVoucherEditForm({
                                      ...voucherEditForm,
                                      total_amount: e.target.value,
                                    })
                                  }
                                  className="edit-input"
                                  placeholder="Total"
                                />
                              ) : p.total_amount != null ? (
                                `$${Number(p.total_amount).toFixed(2)}`
                              ) : (
                                "—"
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <input
                                  value={voucherEditForm.date}
                                  onChange={(e) =>
                                    setVoucherEditForm({
                                      ...voucherEditForm,
                                      date: e.target.value,
                                    })
                                  }
                                  className="edit-input"
                                  placeholder="YYYY-MM-DD"
                                />
                              ) : (
                                p.date || "—"
                              )}
                            </td>
                            <td>
                              <span
                                className={`chip ${
                                  status === "processed"
                                    ? "chip--ok"
                                    : "chip--muted"
                                }`}
                              >
                                {status}
                              </span>
                            </td>
                            <td>
                              {isEditing ? (
                                <>
                                  <button
                                    className="search-button"
                                    onClick={() => saveVoucherEdit(v.id)}
                                  >
                                    Save
                                  </button>
                                  <button
                                    className="search-button cancel-button"
                                    onClick={cancelVoucherEdit}
                                    style={{ marginLeft: 6 }}
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    className="search-button edit-button"
                                    onClick={() => startVoucherEdit(v)}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    className="search-button"
                                    onClick={() => confirmVoucher(v.id)}
                                    disabled={confirmingVoucherId === v.id}
                                    style={{ marginLeft: 6 }}
                                  >
                                    {confirmingVoucherId === v.id
                                      ? "Confirming..."
                                      : "Confirm"}
                                  </button>
                                  <button
                                    className="search-button delete-button"
                                    onClick={() => deleteVoucher(v.id)}
                                    disabled={deletingVoucherId === v.id}
                                    style={{ marginLeft: 6 }}
                                  >
                                    {deletingVoucherId === v.id
                                      ? "Deleting..."
                                      : "Delete"}
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="restaurant-card" style={{ marginTop: 16 }}>
              <div className="menu-summary__title">Transactions</div>
              <div className="table-wrapper" style={{ marginTop: 12 }}>
                <table className="results-table">
                  <thead>
                    <tr>
                      <th style={{ width: 70 }}>ID</th>
                      <th>Date</th>
                      <th>Merchant</th>
                      <th style={{ width: 140 }}>Amount</th>
                      <th>Category</th>
                      <th>Merchant Category</th>
                      <th>Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactionsLoading ? (
                      <tr>
                        <td colSpan={7}>Loading…</td>
                      </tr>
                    ) : transactions.length === 0 ? (
                      <tr>
                        <td colSpan={7}>No transactions found.</td>
                      </tr>
                    ) : (
                      transactions.map((t) => (
                        <tr key={t.id}>
                          <td>{t.id}</td>
                          <td>{new Date(t.date).toISOString().slice(0, 10)}</td>
                          <td>{t.merchant || "—"}</td>
                          <td>${Number(t.amount).toFixed(2)}</td>
                          <td>{t.category || "—"}</td>
                          <td>{t.merchant_category || "—"}</td>
                          <td>{t.source || "—"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
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
