// Use relative URLs to go through Vite proxy
const API_BASE = "/api";

class TransactionService {
  // GET /api/transactions/vouchers - Get all vouchers for a user
  static async getVouchers(userId = 1) {
    const response = await fetch(
      `${API_BASE}/transactions/vouchers?user_id=${encodeURIComponent(userId)}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data.vouchers) ? data.vouchers : [];
  }

  // GET /api/transactions - Get all transactions for a user
  static async getTransactions(userId = 1) {
    const response = await fetch(
      `${API_BASE}/transactions?user_id=${encodeURIComponent(userId)}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data.transactions) ? data.transactions : [];
  }

  // POST /transactions/vouchers/upload - Upload and parse single receipt
  static async uploadReceipt(file, userId = 1) {
    const formData = new FormData();
    formData.append("receipt", file);
    formData.append("user_id", String(userId));

    const response = await fetch(`${API_BASE}/transactions/vouchers/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return await response.json();
  }

  // POST /transactions/vouchers/bulk-upload - Upload multiple receipts
  static async bulkUploadReceipts(files, userId = 1) {
    const formData = new FormData();
    for (const file of files) {
      formData.append("receipts", file);
    }
    formData.append("user_id", String(userId));

    const response = await fetch(
      `${API_BASE}/transactions/vouchers/bulk-upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    // Handle 207 Multi-Status for partial success
    if (!response.ok && response.status !== 207) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return await response.json();
  }

  // GET /transactions/vouchers/:id - Get specific voucher details
  static async getVoucher(id, userId = 1) {
    const response = await fetch(
      `${API_BASE}/transactions/vouchers/${id}?user_id=${encodeURIComponent(
        userId
      )}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return await response.json();
  }

  // PUT /transactions/vouchers/:id - Update voucher data
  static async updateVoucher(id, updateData, userId = 1) {
    const payload = {
      user_id: userId,
      parsed_data: updateData,
    };

    const response = await fetch(`${API_BASE}/transactions/vouchers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return await response.json();
  }

  // POST /transactions/vouchers/:id/confirm - Confirm voucher and create transaction
  static async confirmVoucher(id, confirmData = {}, userId = 1) {
    const payload = {
      user_id: userId,
      ...confirmData,
    };

    const response = await fetch(
      `${API_BASE}/transactions/vouchers/${id}/confirm`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return await response.json();
  }

  // DELETE /transactions/vouchers/:id - Delete voucher
  static async deleteVoucher(id, userId = 1) {
    const response = await fetch(
      `${API_BASE}/transactions/vouchers/${id}?user_id=${encodeURIComponent(
        userId
      )}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return await response.json();
  }

  // GET /api/transactions/categories - Get all available categories
  static async getCategories() {
    const response = await fetch(`${API_BASE}/transactions/categories`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return await response.json();
  }
}

export default TransactionService;
