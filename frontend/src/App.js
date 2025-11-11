import React, { useState, useEffect } from 'react';

function App() {
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [moods, setMoods] = useState([]);
  const [selectedMood, setSelectedMood] = useState('');
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    fetch('/api/mood')
      .then(res => res.json())
      .then(data => setMoods(data))
      .catch(console.error);
  }, []);

  const login = async () => {
    const res = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.token) {
      setToken(data.token);
    } else {
      alert('Login failed');
    }
  };

  const submitMood = async () => {
    if (!selectedMood) return alert('Please select a mood');
    await fetch('/api/mood', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ moodId: selectedMood })
    });
    const res = await fetch(`/api/recipes?mood=${selectedMood}`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const recipeData = await res.json();
    setRecipes(recipeData);
  };

  if (!token) {
    return (
      <div>
        <h2>Login</h2>
        <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button onClick={login}>Login</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Enter Your Mood</h2>
      <select value={selectedMood} onChange={e => setSelectedMood(e.target.value)}>
        <option value="">Select mood</option>
        {moods.map(mood => (
          <option key={mood._id} value={mood._id}>{mood.name}</option>
        ))}
      </select>
      <button onClick={submitMood}>Find Recipes</button>

      <h2>Recipes</h2>
      <ul>
        {recipes.map(recipe => (
          <li key={recipe._id}>
            <h3>{recipe.title}</h3>
            <p>{recipe.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
