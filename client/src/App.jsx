import React, { useState } from "react";

function App() {
  const [activeTab, setActiveTab] = useState("location"); // "location" or "social"
  const [location, setLocation] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [socialAnalysis, setSocialAnalysis] = useState(null);

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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSocialAnalysis(data);
    } catch (err) {
      setError(`Failed to analyze image: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError("Please select a valid image file");
        setSelectedFile(null);
      }
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

          {loading && (
            <div className="loading">
              <p>🔍 Searching for restaurants in {location}...</p>
              <p>
                This may take a few moments as we analyze the best options for
                you.
              </p>
            </div>
          )}

          {recommendations && (
            <div className="results">
              <div
                style={{ padding: "20px", borderBottom: "1px solid #e1e1e1" }}
              >
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

                    <div className="restaurant-info">
                      📍 {restaurant.address}
                    </div>

                    {restaurant.phone && (
                      <div className="restaurant-info">
                        📞{" "}
                        <a href={`tel:${restaurant.phone}`}>
                          {restaurant.phone}
                        </a>
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
            <div className="results">
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
                  {socialAnalysis.extractedInfo.restaurant_name}
                </div>

                {socialAnalysis.extractedInfo.address && (
                  <div className="restaurant-info">
                    📍 Address: {socialAnalysis.extractedInfo.address}
                  </div>
                )}

                {socialAnalysis.extractedInfo.dish_name && (
                  <div className="restaurant-info">
                    🍽️ Dish: {socialAnalysis.extractedInfo.dish_name}
                  </div>
                )}

                <div className="restaurant-reason">
                  📝 {socialAnalysis.extractedInfo.description}
                </div>

                {socialAnalysis.extractedInfo.social_media_handle && (
                  <div className="restaurant-info">
                    📱 Social:{" "}
                    {socialAnalysis.extractedInfo.social_media_handle}
                  </div>
                )}

                <div className="analysis-meta">
                  <small>
                    Processed at:{" "}
                    {new Date(socialAnalysis.processedAt).toLocaleString()}
                  </small>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {error && <div className="error">{error}</div>}
    </div>
  );
}

export default App;
