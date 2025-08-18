# Transaction Feature Frontend Overview

## 🎯 Feature Summary

The frontend includes a comprehensive transaction management system with AI-powered receipt parsing, allowing users to upload receipt images and automatically extract transaction data.

## 🏗️ Architecture

### **Technology Stack**

- **Framework**: React 18+ with Vite
- **Styling**: CSS with modern glassmorphism design
- **State Management**: React hooks (useState, useEffect)
- **API Communication**: Fetch API
- **File Handling**: HTML5 File API with drag-and-drop support

### **Key Components**

- **Main App Component**: Single-page application with tab navigation
- **Transaction Tab**: Dedicated interface for receipt management
- **Voucher Management**: Edit, confirm, and delete uploaded receipts
- **Transaction Display**: View processed transactions

## 📱 User Interface

### **Tab Navigation**

```jsx
<button
  className={`tab-button ${activeTab === "transactions" ? "active" : ""}`}
>
  💳 Transactions
</button>
```

### **Main Features**

#### 1. **Receipt Upload Form**

- **Single File Upload**: Drag-and-drop or file picker
- **Bulk Upload**: Multiple files (up to 10) simultaneously
- **File Validation**: Image formats (JPG, PNG, WEBP, HEIC/HEIF, GIF, BMP, TIFF)
- **Size Limit**: 10MB per file
- **User ID Input**: Numeric input for user identification

#### 2. **Voucher Management Table**

- **Columns**: ID, Merchant, Total, Date, Status, Actions
- **Status Indicators**: "processed" (green) vs "pending" (gray)
- **Inline Editing**: Click "Edit" to modify voucher data
- **Actions**: Edit, Confirm, Delete buttons per row

#### 3. **Transaction Display Table**

- **Columns**: ID, Date, Merchant, Amount, Category, Merchant Category, Source
- **Data Formatting**: Currency formatting, date formatting
- **Read-only**: Display only, no editing capabilities

## 🔧 API Integration

### **Backend Endpoints Used**

```javascript
const BACKEND_URL = "http://localhost:5001";

// Core endpoints
GET    /transactions/vouchers?user_id={id}
GET    /transactions/transactions?user_id={id}
POST   /transactions/upload
POST   /transactions/voucher/bulk-upload
GET    /transactions/voucher/{id}
PUT    /transactions/voucher/{id}
POST   /transactions/voucher/{id}/confirm
DELETE /transactions/voucher/{id}
```

### **Key Functions**

#### **Data Fetching**

```javascript
const fetchVouchers = async () => {
  const res = await fetch(
    `${BACKEND_URL}/transactions/vouchers?user_id=${txUserId}`
  );
  const data = await res.json();
  setVouchers(Array.isArray(data.vouchers) ? data.vouchers : []);
};

const fetchUserTransactions = async () => {
  const res = await fetch(
    `${BACKEND_URL}/transactions/transactions?user_id=${txUserId}`
  );
  const data = await res.json();
  setTransactions(Array.isArray(data.transactions) ? data.transactions : []);
};
```

#### **File Upload**

```javascript
const handleReceiptUpload = async (e) => {
  const form = new FormData();
  form.append("receipt", receiptFile);
  form.append("user_id", String(parseInt(txUserId) || 1));

  const res = await fetch(`${BACKEND_URL}/transactions/upload`, {
    method: "POST",
    body: form,
  });
};
```

#### **Voucher Management**

```javascript
// Edit voucher
const saveVoucherEdit = async (id) => {
  const res = await fetch(`${BACKEND_URL}/transactions/voucher/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
};

// Confirm voucher to transaction
const confirmVoucher = async (id) => {
  const res = await fetch(`${BACKEND_URL}/transactions/voucher/${id}/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
};
```

## 🎨 UI/UX Features

### **Modern Design Elements**

- **Glassmorphism**: Translucent backgrounds with blur effects
- **Gradient Backgrounds**: Animated gradient backgrounds
- **Smooth Animations**: Hover effects and transitions
- **Responsive Tables**: Scrollable tables with sticky headers
- **Status Indicators**: Color-coded chips for different states

### **User Experience**

- **Loading States**: Spinner indicators during API calls
- **Error Handling**: Inline error messages with dismiss functionality
- **Form Validation**: Client-side validation for file types and sizes
- **Auto-refresh**: Automatic data refresh after operations
- **Inline Editing**: Seamless editing experience without page reloads

### **Visual Hierarchy**

- **Tab Navigation**: Clear separation of features
- **Card Layout**: Information organized in cards
- **Table Design**: Clean, readable data presentation
- **Button States**: Visual feedback for different button states

## 📊 Data Flow

### **Upload Process**

1. User selects receipt image(s)
2. Frontend validates file type and size
3. FormData created with file and user_id
4. POST request sent to `/transactions/upload`
5. Backend processes with OpenAI Vision API
6. Response includes parsed data and voucher/transaction IDs
7. Frontend refreshes voucher and transaction lists

### **Voucher Lifecycle**

1. **Upload** → Receipt image uploaded and parsed
2. **Edit** → User can modify parsed data inline
3. **Confirm** → Voucher converted to transaction
4. **Delete** → Voucher removed from system

## 🔒 Security & Validation

### **Client-side Validation**

- File type checking (image/\*)
- File size limits (10MB)
- User ID validation (positive integers)
- Required field validation

### **Error Handling**

- Network error handling
- API error response parsing
- User-friendly error messages
- Graceful degradation

## 🚀 Performance Features

### **Optimizations**

- **Lazy Loading**: Data loaded only when tab is active
- **Debounced Refresh**: Prevents excessive API calls
- **Efficient State Management**: Minimal re-renders
- **Optimistic Updates**: UI updates before API confirmation

### **User Feedback**

- **Loading Indicators**: Visual feedback during operations
- **Success Messages**: Confirmation of successful operations
- **Progress Tracking**: Upload progress for bulk operations

## 📱 Responsive Design

### **Mobile Considerations**

- **Touch-friendly**: Large touch targets for mobile
- **Scrollable Tables**: Horizontal scrolling for small screens
- **Flexible Layout**: Adapts to different screen sizes
- **Readable Text**: Appropriate font sizes for mobile

## 🎯 Key Features Summary

✅ **AI-Powered Receipt Parsing**: Automatic data extraction from images  
✅ **Bulk Upload Support**: Multiple files processed simultaneously  
✅ **Inline Editing**: Edit voucher data without page reload  
✅ **Real-time Updates**: Automatic refresh after operations  
✅ **Modern UI**: Glassmorphism design with smooth animations  
✅ **Error Handling**: Comprehensive error management  
✅ **Responsive Design**: Works on desktop and mobile  
✅ **User-friendly**: Intuitive interface with clear actions

## 🔗 Integration Points

- **Backend API**: Full integration with transaction routes
- **File System**: Local file handling and upload
- **Database**: Real-time data synchronization
- **AI Services**: OpenAI Vision API integration via backend

The frontend provides a complete, user-friendly interface for managing receipts and transactions with modern design principles and robust functionality.
