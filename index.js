'use strict';

const express = require('express');
const cors = require('cors');
const endpoints = require('express-endpoints');
const gracefulShutdown = require('http-graceful-shutdown');
const agent = require('multiagent');
const bodyParser = require('body-parser');
const mongodb = require('mongodb');

const mongo = require('./mongo-client');

// Define some default values if not set in environment
const PORT = process.env.PORT || 3000;
const SHUTDOWN_TIMEOUT = process.env.SHUTDOWN_TIMEOUT || 10000;
const SERVICE_CHECK_HTTP = process.env.SERVICE_CHECK_HTTP || '/healthcheck';
const SERVICE_ENDPOINTS = process.env.SERVICE_ENDPOINTS || '/endpoints';
const DISCOVERY_SERVERS = process.env.DISCOVERY_SERVERS
  ? process.env.DISCOVERY_SERVERS.split(',')
  : ['http://46.101.245.190:8500', 'http://46.101.132.55:8500', 'http://46.101.193.82:8500'];

// Create a new express app
const app = express();

const carts = {};

// Add CORS headers
app.use(cors());
app.use(bodyParser.json());

// Add health check endpoint
app.get(SERVICE_CHECK_HTTP, (req, res) => res.send({ uptime: process.uptime() }));

// Add metadata endpoint
app.get(SERVICE_ENDPOINTS, endpoints());

// Add all other service routes
app.get('/carts/:id', (req, res) => {
    const id = req.params.id;
    
    return mongo.createMongoClient(DISCOVERY_SERVERS)
        .then(db => new Promise((resolve, reject) => {
            const carts = db.collection('carts');
            carts.find({ _id: new mongodb.ObjectId(id) }).toArray((err, result) =>{
                if (err) {
                    reject(err);
                } else {
                    console.log(result);
                    resolve(result[0]);
                }
            });
        }).then(res=>{
            db.close(); 
            return res;
        }))        
        .then(result => {
            res.send(result);
        })
        .catch(err => {
            console.error(err); 
            res.status(501).end(err.message);
        })
        .catch(err =>{
            console.log(err);
        }); 
});

app.post('/carts', (req, res) => {
    return mongo.createMongoClient(DISCOVERY_SERVERS)
        .then(db => new Promise((resolve, reject) => {
            const carts = db.collection('carts');
            carts.insertMany([
                { 
                    items: req.body
                }
            ], (err, res) => {
               if (err) {
                   reject(err);
               } else {
                   resolve({ cartId: res.ops[0]._id })
               }
            });
        }).then(res=>{
            db.close(); 
            return res;
        }))        
        .then(result => {
            res.send(result);
        })
        .catch(err => {
            console.error(err); 
            res.status(501).end(err.message);
        })
        .catch(err =>{
            console.log(err);
        });    
});

// Start the server
const server = app.listen(PORT, () => console.log(`Service listening on port ${PORT} ...`));

// Enable graceful server shutdown when process is terminated
gracefulShutdown(server, { timeout: SHUTDOWN_TIMEOUT });



// This is how you would use the discovery
// client to talk to other services:
//
// const client = agent.client({
//   discovery: 'consul',
//   discoveryServers: DISCOVERY_SERVERS,
//   serviceName: 'some-service'
// });

// client
//   .get('/healthcheck')
//   .then(res => console.log(res.body))
//   .catch(err => console.log(err));
