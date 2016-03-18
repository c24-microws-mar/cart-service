'use strict';

const agent = require('multiagent');
const MongoClient = require('mongodb').MongoClient;

module.exports.createMongoClient = function (DISCOVERY_SERVERS) {
    const client = agent.client({servers: DISCOVERY_SERVERS});
    return client.get('/v1/health/service/mongo')
      .timeout(500)
      .promise()
      .then(result => JSON.parse(result.text))
      .then(res => new Promise((resolve, reject) => {
          MongoClient.connect(`mongodb://${res[0].Service.Address}:${res[0].Service.Port}/carts-db`, (err, db) => {
              if (err) { 
                  reject(err);
              } else {
                  resolve(db);
              } 
          });
      }));
};