const express = require('express');
const AWS = require('aws-sdk');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = 3000;

// AWS SDK config
AWS.config.update({ region: 'us-east-1' });
const s3 = new AWS.S3();

app.get('/', (req, res) => {
  res.send('Hello from Node.js on EC2!');
});

app.get('/list-files', async (req, res) => {
  try {
    const result = await s3.listObjectsV2({
      Bucket: process.env.S3_BUCKET,
    }).promise();

    res.json(result.Contents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
