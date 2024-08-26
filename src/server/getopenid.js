import express from 'express'
import axios from "axios";

const app = express();
app.use(express.json());

const appId = 'wxa3cb633605ee7826';
const appSecret = 'f63d8607fc61c49ba26a6c98cfb1b452';

app.post('/api/login', async (req, res) => {
  const { code } = req.body;

  try {
    const response = await axios.get(`https://api.weixin.qq.com/sns/jscode2session`, {
      params: {
        appid: appId,
        secret: appSecret,
        js_code: code,
        grant_type: 'authorization_code'
      }
    });

    const { openid } = response.data;

    if (openid) {
      res.send({ openid });
    } else {
      res.status(400).send({ error: 'Failed to get openid' });
    }
  } catch (error) {
    console.error('Error getting openid:', error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});

