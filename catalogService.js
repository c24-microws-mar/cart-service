'use strict';

const serviceDiscovery = require('./service-discovery');
const client = serviceDiscovery.getClient('catalog-service', 'v2');

const catalogService = {

  getCd: (id) => {
    return client.get(`/cd/${id}`)
      .then((res) => res.body);
  }

};

module.exports = catalogService;
