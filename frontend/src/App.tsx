import React, { useState } from 'react';
import Dashboard from './Dashboard';
import Items from './Items';
import './App.css'; // если нужны стили

function App() {
  const [currentPage, setCurrentPage] = useState<'items' | 'dashboard'>('items');

  return (
    <div className="App">
      <nav style={{ marginBottom: '20px', padding: '10px', borderBottom: '1px solid #ccc' }}>
        <button
          onClick={() => setCurrentPage('items')}
          style={{
            marginRight: '10px',
            padding: '8px 16px',
            background: currentPage === 'items' ? '#007bff' : '#f0f0f0',
            color: currentPage === 'items' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Items
        </button>
        <button
          onClick={() => setCurrentPage('dashboard')}
          style={{
            padding: '8px 16px',
            background: currentPage === 'dashboard' ? '#007bff' : '#f0f0f0',
            color: currentPage === 'dashboard' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Dashboard
        </button>
      </nav>

      <main>
        {currentPage === 'items' ? <Items /> : <Dashboard />}
      </main>
    </div>
  );
}

export default App;
