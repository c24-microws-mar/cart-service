'use strict';

const express = require('express');
const cors = require('cors');
const endpoints = require('express-endpoints');
const gracefulShutdown = require('http-graceful-shutdown');
const agent = require('multiagent');

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

// Add health check endpoint
app.get(SERVICE_CHECK_HTTP, (req, res) => res.send({ uptime: process.uptime() }));

// Add metadata endpoint
app.get(SERVICE_ENDPOINTS, endpoints());

// Add all other service routes
app.get('/carts/:id', (req, res) => {
  const id = req.params.id;
  
  if (!carts[id]) {
      return res.status(404).end(`Cart with id ${id} is not found.`);
  }
  
  return res.send(carts[id]);
});

app.post('/carts', (req, res) => {
    const id = Math.round(Math.random()*1000000);
    carts[id] = [ id ];
    res.send(`{ cartId: ${id} }`);
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
