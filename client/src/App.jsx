import React, { useState } from "react";

function App() {
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState(null);

  const handleSubmit = async (e) => {
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

  const parseRecommendations = (recommendationsString) => {
    try {
      // Extract JSON from the markdown code block
      const jsonMatch = recommendationsString.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      // If no markdown, try parsing directly
      return JSON.parse(recommendationsString);
    } catch (err) {
      console.error("Failed to parse recommendations:", err);
      return [];
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>🍽️ Restaurant Recommendations</h1>
        <p>Get personalized restaurant suggestions based on your location</p>
      </div>

      <form className="search-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="location">Location:</label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter a location (e.g., Los Angeles, CA or 90025)"
            disabled={loading}
          />
        </div>
        <button type="submit" className="search-button" disabled={loading}>
          {loading ? "Searching..." : "Get Recommendations"}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      {loading && (
        <div className="loading">
          <p>🔍 Searching for restaurants in {location}...</p>
          <p>
            This may take a few moments as we analyze the best options for you.
          </p>
        </div>
      )}

      {recommendations && (
        <div className="results">
          <div style={{ padding: "20px", borderBottom: "1px solid #e1e1e1" }}>
            <h2>📍 Recommendations for {recommendations.location}</h2>
            <p style={{ color: "#666", marginTop: "5px" }}>
              Found{" "}
              {parseRecommendations(recommendations.recommendations).length}{" "}
              restaurants
            </p>
          </div>

          {parseRecommendations(recommendations.recommendations).map(
            (restaurant, index) => (
              <div key={index} className="restaurant-card">
                <div className="restaurant-name">{restaurant.name}</div>

                <div className="restaurant-info">📍 {restaurant.address}</div>

                {restaurant.phone && (
                  <div className="restaurant-info">
                    📞{" "}
                    <a href={`tel:${restaurant.phone}`}>{restaurant.phone}</a>
                  </div>
                )}

                {restaurant.website && (
                  <div className="restaurant-info">
                    🌐{" "}
                    <a
                      href={restaurant.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit Website
                    </a>
                  </div>
                )}

                {restaurant.googleMapsLink && (
                  <div className="restaurant-info">
                    🗺️{" "}
                    <a
                      href={restaurant.googleMapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View on Google Maps
                    </a>
                  </div>
                )}

                {restaurant.reason && (
                  <div className="restaurant-reason">
                    💡 {restaurant.reason}
                  </div>
                )}

                {restaurant.recommendation && (
                  <div className="restaurant-recommendation">
                    ⭐ {restaurant.recommendation}
                  </div>
                )}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default App;
