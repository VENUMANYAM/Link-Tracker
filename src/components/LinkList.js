import React, { useEffect, useState } from 'react';
import axios from 'axios';

const LinkList = () => {
  const [links, setLinks] = useState([]);

  const fetchLinks = async () => {
    try {
      const response = await axios.get('http://192.168.31.30:5000/tracking');
      setLinks(response.data);
    } catch (error) {
      console.error('Error fetching tracking data:', error);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  return (
    <div>
      <h2>Visitor Tracking Details</h2>
      <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>Short URL</th>
            <th>IP Address</th>
            <th>City</th>
            <th>Region</th>
            <th>Country</th>
            <th>Latitude</th>
            <th>Longitude</th>
            <th>Browser</th>
            <th>OS</th>
            <th>Device</th>
            <th>Visited At</th>
            <th>Referrer</th>
          </tr>
        </thead>
        <tbody>
          {links.map(link => (
            <tr key={link.id}>
              <td>{link.short_code}</td>
              <td>{link.ip_address}</td>
              <td>{link.city}</td>
              <td>{link.region}</td>
              <td>{link.country}</td>
              <td>{link.latitude}</td>
              <td>{link.longitude}</td>
              <td>{link.browser}</td>
              <td>{link.os}</td>
              <td>{link.device}</td>
              <td>{new Date(link.timestamp).toLocaleString()}</td>
              <td>{link.referrer || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LinkList;
