const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

const appId = 'wxa3cb633605ee7826';
const appSecret = 'f63d8607fc61c49ba26a6c98cfb1b452';

app.use(bodyParser.json());
app.post('/api/getOpenId', (req, res) => {
  const code = req.body.code;

  if (!code) {
    return res.status(400).json({ error: 'Code is required' });
  }

  const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`;

  request(url, (error, response, body) => {
    if (error) {
      return res.status(500).json({ error: 'Request failed', details: error });
    }

    const data = JSON.parse(body);

    if (data.errcode) {
      return res.status(400).json({ error: 'Error from WeChat API', details: data });
    }

    res.json({
      openid: data.openid
    });
  });
});

app.listen(PORT,  () => {
  console.log(`Server running on port ${PORT}`);
});

