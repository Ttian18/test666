import React from "react";
import "./App.css";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>NextAI Finance App</h1>
        <p>Welcome to your AI-powered financial management platform!</p>
        <div className="status">
          <p>🚀 Backend API: Running on port 5001</p>
          <p>⚛️ React Frontend: Running on port 3000</p>
          <p>🗄️ Database: Ready for Prisma integration</p>
        </div>
      </header>
    </div>
  );
}

export default App;
