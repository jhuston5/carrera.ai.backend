const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.listen(process.env.PORT || 3000, () => {
  console.log('Server listening on port 3000');
});

// Step 1: Redirect user for authorization
app.get('/authorize', (req, res) => {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const redirectUri = process.env.STRAVA_REDIRECT_URI;
  const responseType = 'code';
  const approvalPrompt = 'auto';
  const scope = 'activity:read';

  const authorizationUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&approval_prompt=${approvalPrompt}&scope=${scope}`;

  res.redirect(authorizationUrl);
});

// Step 2: Exchange authorization code for tokens
app.get('/callback', async (req, res) => {
  const { code } = req.query;
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  const redirectUri = process.env.STRAVA_REDIRECT_URI;
  const grantType = 'authorization_code';

  try {
    const tokenResponse = await axios.post('https://www.strava.com/oauth/token', {
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: grantType,
    });

    const { access_token, refresh_token, expires_at } = tokenResponse.data;
    // Store the access_token, refresh_token, and expires_at securely

    // Redirect the user to a page indicating successful authentication
    res.redirect('/authenticated');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve tokens' });
  }
});

// Step 3: Access protected resources using the access token
app.get('/activities/:id', async (req, res) => {
  const athleteId = req.params.id;
  const accessToken = process.env.STRAVA_ACCESS;
  console.log(accessToken);
  try {
    const response = await axios.get(`https://www.strava.com/api/v3/athletes/${athleteId}/activities`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not retrieve activities' });
  }
});
