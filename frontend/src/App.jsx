// src/App.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Auth from './Auth';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [activeTab, setActiveTab] = useState('Home');
  const [recipes, setRecipes] = useState([]); // State to hold our database recipes

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  // Fetch recipes from the backend when the Home tab loads
  useEffect(() => {
    if (token && activeTab === 'Home') {
      const fetchRecipes = async () => {
        try {
          const response = await axios.get('http://localhost:5000/api/recipes');
          setRecipes(response.data); // Save the database data to state
        } catch (error) {
          console.error("Error fetching recipes:", error);
        }
      };
      fetchRecipes();
    }
  }, [token, activeTab]);

  // If we don't have a token, show the Login/Signup screen
  if (!token) {
    return <Auth setToken={setToken} />;
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <nav className="sidebar">
        <h1>Byte Your Fork</h1>
        <button className="nav-button" onClick={() => setActiveTab('Home')}>Home</button>
        <button className="nav-button" onClick={() => setActiveTab('Explore')}>Explore</button>
        <button className="nav-button" onClick={() => setActiveTab('Timer')}>Timer</button>
        <button className="nav-button" onClick={() => setActiveTab('Settings')}>Settings</button>
        <div style={{ marginTop: 'auto' }}>
          <button className="nav-button logout-button" onClick={handleLogout}>Log Out</button>
        </div>
      </nav>

      {/* Main Dashboard Module */}
      <main className="main-content">
        <div className="header-bar">
          <h2>{activeTab} Dashboard</h2>
          <input type="text" className="search-bar" placeholder="Search recipes, tags, ingredients..." />
        </div>

        {/* Dynamic Content Area */}
        {activeTab === 'Home' && (
          <div>
            <p>Welcome back! Here is your recipe feed.</p>
            <div className="recipe-grid">
              {/* Loop through our database recipes and generate a card for each one */}
              {recipes.length > 0 ? (
                recipes.map((recipe) => (
                  <div className="recipe-card" key={recipe.id}>
                    <h3>{recipe.title}</h3>
                    <p>Time to Cook: {recipe.ttc} mins</p>
                    <p>★ {recipe.stars}</p>
                    <p style={{ fontSize: '0.8rem', color: '#666' }}>Views: {recipe.views}</p>
                  </div>
                ))
              ) : (
                <p>Loading recipes...</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'Explore' && <p>Discover new culinary trends and top tags here.</p>}
        {activeTab === 'Timer' && <p>Cook Mode Timers synchronized with Gemini Live will appear here.</p>}
        {activeTab === 'Settings' && <p>Manage your account credentials and dietary preferences here.</p>}
      </main>
    </div>
  );
}

export default App;
