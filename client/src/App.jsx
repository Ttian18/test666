import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/data");
      const result = await response.json();

      if (result.success) {
        setData(result);
      } else {
        setError(result.error || "Failed to fetch data");
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="App">
        <div className="loading">
          <h2>Loading sample data...</h2>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="App">
        <div className="error">
          <h2>Error: {error}</h2>
          <button onClick={fetchData}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>NextAI Finance App</h1>
        <p>Sample Data from Database</p>
      </header>

      <main className="App-main">
        {data && (
          <>
            {/* Summary Cards */}
            <div className="summary-cards">
              <div className="card">
                <h3>👥 Users</h3>
                <p className="number">{data.summary.totalUsers}</p>
              </div>
              <div className="card">
                <h3>🍽️ Restaurants</h3>
                <p className="number">{data.summary.totalRestaurants}</p>
              </div>
              <div className="card">
                <h3>💳 Transactions</h3>
                <p className="number">{data.summary.totalTransactions}</p>
              </div>
              <div className="card">
                <h3>📋 Menu Items</h3>
                <p className="number">{data.summary.totalMenuItems}</p>
              </div>
              <div className="card">
                <h3>⭐ Recommendations</h3>
                <p className="number">{data.summary.totalRecommendations}</p>
              </div>
            </div>

            {/* Users Section */}
            <section className="data-section">
              <h2>👥 Users</h2>
              <div className="data-grid">
                {data.data.users.map((user) => (
                  <div key={user.id} className="data-card">
                    <h3>{user.name || "Anonymous"}</h3>
                    <p>
                      <strong>Email:</strong> {user.email}
                    </p>
                    <p>
                      <strong>Created:</strong>{" "}
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                    {user.profile && (
                      <div className="profile-info">
                        <p>
                          <strong>Preferences:</strong>
                        </p>
                        <ul>
                          {user.profile.preferences?.cuisine?.map(
                            (cuisine, index) => (
                              <li key={index}>{cuisine}</li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Restaurants Section */}
            <section className="data-section">
              <h2>🍽️ Restaurants</h2>
              <div className="data-grid">
                {data.data.restaurants.map((restaurant) => (
                  <div key={restaurant.id} className="data-card">
                    <h3>{restaurant.name}</h3>
                    <p>
                      <strong>Cuisine:</strong> {restaurant.cuisine}
                    </p>
                    <p>
                      <strong>Address:</strong> {restaurant.address}
                    </p>
                    <p>
                      <strong>Rating:</strong> ⭐ {restaurant.rating}/5
                    </p>
                    <p>
                      <strong>Price Range:</strong> {restaurant.priceRange}
                    </p>
                    <p>
                      <strong>Menu Items:</strong> {restaurant.menuItems.length}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Transactions Section */}
            <section className="data-section">
              <h2>💳 Transactions</h2>
              <div className="data-grid">
                {data.data.transactions.map((transaction) => (
                  <div key={transaction.id} className="data-card">
                    <h3>${transaction.amount}</h3>
                    <p>
                      <strong>Description:</strong> {transaction.description}
                    </p>
                    <p>
                      <strong>Category:</strong> {transaction.category}
                    </p>
                    <p>
                      <strong>Restaurant:</strong> {transaction.restaurant}
                    </p>
                    <p>
                      <strong>Date:</strong>{" "}
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>User:</strong> {transaction.user.name}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Menu Items Section */}
            <section className="data-section">
              <h2>📋 Menu Items</h2>
              <div className="data-grid">
                {data.data.menuItems.map((item) => (
                  <div key={item.id} className="data-card">
                    <h3>{item.name}</h3>
                    <p>
                      <strong>Price:</strong> ${item.price}
                    </p>
                    <p>
                      <strong>Category:</strong> {item.category}
                    </p>
                    <p>
                      <strong>Description:</strong> {item.description}
                    </p>
                    <p>
                      <strong>Restaurant:</strong> {item.restaurant.name}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Recommendations Section */}
            <section className="data-section">
              <h2>⭐ Recommendations</h2>
              <div className="data-grid">
                {data.data.recommendations.map((rec) => (
                  <div key={rec.id} className="data-card">
                    <h3>Score: {Math.round(rec.score * 100)}%</h3>
                    <p>
                      <strong>Restaurant:</strong> {rec.restaurant.name}
                    </p>
                    <p>
                      <strong>Reason:</strong> {rec.reason}
                    </p>
                    <p>
                      <strong>User:</strong> {rec.user.name}
                    </p>
                    <p>
                      <strong>Created:</strong>{" "}
                      {new Date(rec.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
