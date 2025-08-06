import React, { useState } from 'react';
import axios from 'axios';

const CreateLink = () => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [message, setMessage] = useState('');

  const handleCreate = async () => {
    try {
      const short_code = shortCode || Math.random().toString(36).substring(2, 8); // random if empty
       await axios.post('http://192.168.31.30:5000/create', {
        short_code,
        original_url: originalUrl,
        user_id: 1 // static user_id for now
      });

      setMessage(`✅ Short link created: http://192.168.31.30:5000/${short_code}`);
    } catch (error) {
      console.error(error);
      setMessage('❌ Failed to create short link');
    }
  };

  return (
    <div>
      <h2>Create Short Link</h2>
      <input
        type="text"
        placeholder="Enter original URL"
        value={originalUrl}
        onChange={(e) => setOriginalUrl(e.target.value)}
        style={{ width: "300px", marginRight: "10px" }}
      />
      <input
        type="text"
        placeholder="Custom short code (optional)"
        value={shortCode}
        onChange={(e) => setShortCode(e.target.value)}
        style={{ width: "200px", marginRight: "10px" }}
      />
      <button onClick={handleCreate}>Create</button>
      <p>{message}</p>
    </div>
  );
};

export default CreateLink;
