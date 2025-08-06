const express = require('express');
const mysql = require('mysql2');
const useragent = require('express-useragent');
const cors = require('cors');
const ipLib = require('ip');
const axios = require('axios');

const app = express();
const port = 5000;

app.use(cors({
  origin: 'http://localhost:3000', // your frontend origin
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());
app.use(useragent.express());

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'venu@99',
  database: 'link_tracker'
});

db.connect(err => {
  if (err) {
    console.error('❌ MySQL connection failed:', err);
    return;
  }
  console.log('✅ Connected to MySQL');
});

// Create short link endpoint
app.post('/create', (req, res) => {
  const { short_code, original_url, user_id } = req.body;
  const sql = `INSERT INTO links (short_code, original_url, user_id) VALUES (?, ?, ?)`;
  db.query(sql, [short_code, original_url, user_id], (err, result) => {
    if (err) {
      console.error('❌ Error inserting link:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.status(200).json({ message: '✅ Short link created successfully!' });
  });
});

// Get all tracking data
app.get('/tracking', (req, res) => {
  const sql = 'SELECT * FROM tracking ORDER BY timestamp DESC';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Error fetching tracking data:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(results);
  });
});

// Redirect + Track
app.get('/:code', async (req, res) => {
  const short_code = req.params.code;
  const userAgent = req.useragent;

  // Detect IP
  let ipRaw = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  ipRaw = ipRaw.split(',')[0].trim(); // if multiple IPs in x-forwarded-for

  console.log('Raw IP:', ipRaw);

  // Fallback IP for localhost/private IPs
  const fallbackIP = '8.8.8.8'; // You can change this or set null to skip geo

  // Check if IP is localhost/private, replace with fallback for testing
  let ipToUse = ipRaw;
  if (
    !ipRaw ||
    ipRaw === '::1' ||
    ipRaw === '127.0.0.1' ||
    ipRaw.startsWith('192.168.') ||
    ipRaw.startsWith('10.') ||
    ipRaw.startsWith('172.16.') || // common private range
    ipRaw === '::ffff:127.0.0.1'
  ) {
    ipToUse = fallbackIP;
  }

  console.log('Using IP for geo lookup:', ipToUse);

  const sql = `SELECT * FROM links WHERE short_code = ?`;
  db.query(sql, [short_code], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).send('❌ Link not found');
    }

    const original_url = results[0].original_url;

    // Default geo info
    let geo = {
      city: 'Unknown',
      region: 'Unknown',
      country: 'Unknown',
      latitude: null,
      longitude: null
    };

    try {
      const geoRes = await axios.get(`https://ipapi.co/${ipToUse}/json/`);
      const data = geoRes.data;

      geo = {
        city: data.city || 'Unknown',
        region: data.region || 'Unknown',
        country: data.country_name || 'Unknown',
        latitude: data.latitude || null,
        longitude: data.longitude || null
      };
    } catch (error) {
      console.warn('🌐 Geo lookup failed:', error.message);
    }

    const referrer = req.get('Referrer') || '';
    const browser = userAgent.browser || 'Unknown';
    const os = userAgent.os || 'Unknown';
    const device = userAgent.platform || 'Unknown';
    const timestamp = new Date();

    const insertSQL = `
      INSERT INTO tracking
      (short_code, ip_address, city, region, country, latitude, longitude, referrer, browser, os, device, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(
      insertSQL,
      [short_code, ipRaw, geo.city, geo.region, geo.country, geo.latitude, geo.longitude, referrer, browser, os, device, timestamp],
      (err, result) => {
        if (err) {
          console.error('❌ Insert tracking error:', err);
        } else {
          console.log('✅ Tracking data saved');
        }

        // Redirect user to original URL
        res.redirect(original_url);
      }
    );
  });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  const ip = ipLib.address();
  console.log(`🚀 Server running at http://${ip}:${port}`);
});
