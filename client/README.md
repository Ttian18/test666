# Restaurant Recommendations Frontend

A simple React frontend to test the restaurant recommendation API endpoint.

## Features

- 🍽️ Search for restaurant recommendations by location
- 📍 Display restaurant details including address, phone, and website
- 🗺️ Direct links to Google Maps
- 💡 AI-powered personalized recommendations
- 📱 Responsive design

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

## How to Test

1. Open http://localhost:3000 in your browser
2. Enter a location (e.g., "Los Angeles, CA", "90025", "Downtown LA")
3. Click "Get Recommendations"
4. View the personalized restaurant suggestions

## API Integration

The frontend communicates with the backend API at:

- Endpoint: `/api/recommendations`
- Method: GET
- Query Parameter: `location`

The Vite configuration includes a proxy that forwards `/api` requests to `http://localhost:5001`.

## Project Structure

```
client/
├── src/
│   ├── App.jsx          # Main React component
│   ├── main.jsx         # React entry point
│   └── index.css        # Styles
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
└── package.json         # Dependencies
```

## Technologies Used

- React 18
- Vite (for fast development)
- Modern CSS with responsive design
- Fetch API for HTTP requests
