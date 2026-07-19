const express = require('express');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
const cors = require('cors');

const PORT = 8080;
const APP_ID = '96d125a41a114b25b36c3633238553fc';
const APP_CERTIFICATE = '26bded53534a46e1b877d4e0edd5bee2';

const app = express();
app.use(cors());

const nocache = (req, res, next) => {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
};

const generateAccessToken = (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  const channelName = req.params.channelName;
  if (!channelName) {
    return res.status(500).json({ 'error': 'channel is required' });
  }

  let uid = req.params.uid;
  if (!uid || uid === '') {
    uid = 0;
  }
  let role = RtcRole.SUBSCRIBER;
  if (req.params.role === 'publisher') {
    role = RtcRole.PUBLISHER;
  }
  let expireTime = req.query.expiry;
  if (!expireTime || expireTime === '') {
    expireTime = 3600;
  } else {
    expireTime = parseInt(expireTime, 10);
  }
  
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;

  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID, 
    APP_CERTIFICATE, 
    channelName, 
    uid, 
    role, 
    privilegeExpireTime
  );
  
  return res.json({ 'token': token });
};

app.get('/rtc/:channelName/:role/:tokentype/:uid', nocache, generateAccessToken);

app.listen(PORT, () => {
  console.log(`Agora Token Server listening at http://localhost:${PORT}`);
});
