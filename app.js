const express = require('express');
const AWS = require('aws-sdk');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config();

const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());

const ec2 = new AWS.EC2({ region: 'us-east-1' });
const s3 = new AWS.S3();

// === 1. EC2 INSTANCE LISTING ===
app.get('/ec2/instances', async (req, res) => {
  try {
    const data = await ec2.describeInstances().promise();
    const instances = data.Reservations.map(r => r.Instances).flat();
    res.json(instances);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === 2. S3 FILE UPLOAD ===
const upload = multer({ dest: 'uploads/' });

app.post('/s3/upload', upload.single('file'), (req, res) => {
  const fileContent = fs.readFileSync(req.file.path);
  const params = {
    Bucket: process.env.S3_BUCKET, // from .env
    Key: req.file.originalname,
    Body: fileContent
  };

  s3.upload(params, (err, data) => {
    fs.unlinkSync(req.file.path); // delete local file
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'File uploaded successfully', data });
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

