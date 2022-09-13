// Load dependencies
const aws = require('aws-sdk');
const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const quotes = require('./services/quotes');

var app = express();

// Use our env vars for setting credentials. 
// Remove lines 11-14 if using ~/.aws/credentials file on a local server.
aws.config.update({
    accessKeyId: process.env.aws_access_key_id,
    secretAccessKey: process.env.aws_secret_access_key
});

// Set S3 endpoint to DigitalOcean Spaces
const spacesEndpoint = new aws.Endpoint('sgp1.digitaloceanspaces.com');
const s3 = new aws.S3({
  endpoint: spacesEndpoint
});

// Change bucket property to your Space name
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'avocet',
    acl: 'public-read',
    key: function (request, file, cb) {
      console.log("-----------------");
      console.log(request.body);
      cb(null, "docs/" + file.originalname);
    }
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
      const data = request.files;
      // console.log(data);
      quotes.create(request.files);
      response.json(data);
    });
  } catch (error) {
    console.error(error);
  }
});

module.exports = app;