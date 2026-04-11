// src/App.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Auth from './Auth';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [activeTab, setActiveTab] = useState('Home');
  const [recipes, setRecipes] = useState([]);
  
  // 1. ADD THIS: State to keep track of what you type
  const [searchTerm, setSearchTerm] = useState(''); 

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  // Logic to fetch based on search
useEffect(() => {
  if (token && activeTab === 'Home') {
    const fetchRecipes = async () => {
      try {
        // Updated to include /api prefix to match server.js routing
        const url = searchTerm 
          ? `http://localhost:5000/api/search?query=${searchTerm}`
          : 'http://localhost:5000/api/recipes';
          
        const response = await axios.get(url);
        setRecipes(response.data);
      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
    };
    fetchRecipes();
  }
}, [token, activeTab, searchTerm]);

  if (!token) {
    return <Auth setToken={setToken} />;
  }

  return (
    <div className="app-container">
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

      <main className="main-content">
        <div className="header-bar">
          <h2>{activeTab} Dashboard</h2>
          {/* 4. UPDATE THIS: Bind the input to your searchTerm state */}
          <input 
            type="text" 
            className="search-bar" 
            placeholder="Search recipes..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {activeTab === 'Home' && (
          <div>
            <p>Welcome back! Here is your recipe feed.</p>
            <div className="recipe-grid">
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
                <p>{searchTerm ? `No recipes found for "${searchTerm}"` : "Loading recipes..."}</p>
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