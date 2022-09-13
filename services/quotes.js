const db = require('./db');
const config = require('../config');
var async = require('async');

function create(datasetArr){

  async.each(datasetArr,insertData,function(err) {
    // Release the client to the pg module
    done();
    if (err) {
      set_response(500, err, res);
      logger.error('error running query', err);
      return console.error('error running query', err);
    }
    logger.info('subscription with created');
    set_response(201);
  })

}


function insertData(item,callback) {
  db.query('INSERT INTO image_upload (img_path, img_type, original_name, size) values ($1,$2,$3,$4)', [
        item.location,
        item.mimetype,
        item.originalname,
        item.size
       ], 
  function(err,result) {
    // return any err to async.each iterator
    callback(err);
  })
}

module.exports = {
  create
}
