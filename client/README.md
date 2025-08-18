# Restaurant Recommendations Frontend

A modern React frontend for restaurant recommendations with AI-powered image analysis capabilities.

## Features

- 🍽️ **Location-based Recommendations**: Search for restaurant recommendations by location
- 📸 **Social Media Analysis**: Upload and analyze restaurant images from social media
- 📍 **Restaurant Details**: Display restaurant information including address, phone, and website
- 🗺️ **Direct Links**: Links to Google Maps and restaurant websites
- 💡 **AI-Powered Insights**: Personalized recommendations and image analysis
- 📱 **Responsive Design**: Works on all devices with beautiful gradient background
- 🎨 **Modern UI**: Glass morphism design with animated gradient background

## Prerequisites

Make sure the backend server is running on port 5001:

```bash
# In the server directory
npm run dev --workspace=server
```

## Installation

```bash
cd client
npm install
```

## Running the Frontend

```bash
npm run dev
```

The frontend will be available at: http://localhost:3000

## How to Use

### Location-based Recommendations

1. Click on the "📍 Location Search" tab
2. Enter a location (e.g., "Los Angeles, CA", "90025", "Downtown LA")
3. Click "Get Recommendations"
4. View personalized restaurant suggestions

### Social Media Image Analysis

1. Click on the "📸 Social Media Analysis" tab
2. Upload an image file (PNG, JPG, etc.)
3. Click "Analyze Image"
4. View extracted restaurant information including:
   - Restaurant name
   - Address (if visible in the image)
   - Dish information (if available)
   - Description of the image content
   - Social media handle (if visible)

## API Integration

The frontend communicates with the backend API at:

### Location Recommendations

- **Endpoint**: `/api/recommendations`
- **Method**: GET
- **Query Parameter**: `location`

### Social Media Analysis

- **Endpoint**: `/api/recommendations/social-upload`
- **Method**: POST
- **Body**: FormData with image file

The Vite configuration includes a proxy that forwards `/api` requests to `http://localhost:5001`.

## Project Structure

```
client/
├── src/
│   ├── App.jsx          # Main React component with tabbed interface
│   ├── main.jsx         # React entry point
│   └── index.css        # Styles with gradient background and glass morphism
├── index.html           # HTML template
├── vite.config.js       # Vite configuration with API proxy
└── package.json         # Dependencies
```

## Technologies Used

- **React 18** - Modern React with hooks
- **Vite** - Fast development and build tool
- **Modern CSS** - Gradient backgrounds, glass morphism, animations
- **Fetch API** - HTTP requests for API communication
- **FormData** - File upload handling

## UI Features

- **Animated Gradient Background**: Smooth color transitions
- **Glass Morphism**: Transparent cards with backdrop blur
- **Tabbed Interface**: Easy switching between features
- **File Upload**: Drag-and-drop style file input
- **Responsive Design**: Works on desktop and mobile
- **Loading States**: Visual feedback during API calls
- **Error Handling**: User-friendly error messages
