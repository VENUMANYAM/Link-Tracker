import React from 'react';
import CreateLink from './components/CreateLink';
import LinkList from './components/LinkList';
import './style.css';

function App() {
  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1> Link Tracker</h1>
      <CreateLink />
      <hr />
      <LinkList />
    </div> 
  );
}

export default App;
