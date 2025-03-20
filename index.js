import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import axios from 'axios';

const app = express();
const PORT = 3000;
const API_URL = "https://api.coingecko.com/api/v3";

app.set('view engine', 'ejs');
app.use(express.static('public'));

// Home page
app.get('/', (req, res) => {
  res.render('index');
});

// Search page
app.get('/search', (req, res) => {
  res.render('search');
});

// Utility function to delay execution
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Endpoint for searching a coin and displaying results on cards.ejs
app.get('/searchCoin', async (req, res) => {
  // Add a small delay before making the request
  await delay(500);
  
  const coinName = req.query.coinName.toLowerCase(); // Get coin name from query parameter

  // Set up API request
  const options = {
      method: 'GET',
      url: `${API_URL}/simple/price?ids=${coinName}&vs_currencies=usd&include_market_cap=true&include_24hr_change=true&include_last_updated_at=true`,
      headers: {
          accept: 'application/json',
          'x-cg-demo-api-key': 'CG-RBC6FQqZojvJsUpYRR3ZzteZ'
      },
      // Add a timeout to prevent overwhelming the API
      timeout: 5000
  };

  try {
      const response = await axios.request(options);

      // Check if data exists for the given coin
      if (response.data[coinName]) {
          const coinData = response.data[coinName];
          
          // Pass data to cards.ejs for rendering
          res.render('cards', {
              coinName: coinName.charAt(0).toUpperCase() + coinName.slice(1), // Capitalize coin name
              coinPrice: coinData.usd,
              marketCap: coinData.usd_market_cap,
              priceChange: coinData.usd_24h_change.toFixed(2),
              lastUpdated: new Date(coinData.last_updated_at * 1000).toLocaleString() // Convert to readable date
          });
      } else {
        res.render('search', { errorMessage: "Coin not found. Please try again." });
      }
  } catch (error) {
      console.error(error);
      
      // Check if it's a 403 error (rate limiting/forbidden)
      if (error.response && error.response.status === 403) {
          res.render('search', { errorMessage: "API rate limit reached. Please try again later." });
      } else {
          res.render('search', { errorMessage: "Error fetching data. Please try again later." });
      }
  }
});

// Redirect /home to /
app.get('/home', (req, res) => {
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
