// Load dependencies
const aws = require('aws-sdk');
const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3-transform');
const quotes = require('./services/quotes');
const cors = require('cors');
const sharp = require("sharp");
require('dotenv').config()

var app = express();
app.use(cors())

// Use our env vars for setting credentials. 
// Remove lines 11-14 if using ~/.aws/credentials file on a local server.
aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

// Set S3 endpoint to DigitalOcean Spaces
const spacesEndpoint = new aws.Endpoint(process.env.CLOUD_NAME);
const s3 = new aws.S3({
endpoint: spacesEndpoint
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.BUCKET_NAME,
    acl: 'public-read',
    shouldTransform: true,
    transforms: [
      {
        id: 'original',
        key: (request, file, cb) => cb(null, new Date().getTime() + '_img.jpg'),
        transform: (request, file, cb) => cb(null, sharp().jpeg({ quality: 50 }))
      }
    ]
  })
}).array('upload', 10);

// Views in public directory
app.use(express.static('public'));

// Main, error and success views
app.get('/', function (request, response) {
  response.sendFile(__dirname + '/public/index.html');
});

app.get("/success", function (request, response) {
  response.sendFile(__dirname + '/public/success.html');
});

app.get("/error", function (request, response) {
  response.sendFile(__dirname + '/public/error.html');
});

app.post('/upload', function (request, response, next) {

  try {
    upload(request, response, function (error) {
      // console.log(response.data);
      if (error) {
        console.log(error);
        return response.redirect("/error");
      }

      console.log('File uploaded successfully.');
      const data = request.files[0];
      //console.log(request.files);
      quotes.create(request.files);
      //response.json(data[0]['location']);
      response.json({
        "uploaded": 1,
        "fileName": data['originalname'],
        "url": data.transforms[0]['location']
      });
    });
  } catch (error) {
    console.error(error);
  }
});

module.exports = app;
