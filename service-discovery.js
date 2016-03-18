const agent = require('multiagent');

module.exports = {

  getClient: (serviceName, tags) => {
    const DISCOVERY_SERVERS = [
      'http://46.101.245.190:8500',
      'http://46.101.132.55:8500',
      'http://46.101.193.82:8500'
    ];

    const options = {
      discovery: 'consul',
      discoveryServers: DISCOVERY_SERVERS,
      discoveryStrategy: 'randomly',
      serviceName: serviceName,
      serviceStrategy: 'randomly'
    };

    if (tags) {
      options.createConsulRequestPath = serviceName =>
        `/v1/health/service/${encodeURIComponent(serviceName)}?passing=true&tag=${tags}`
    }

    return agent.client(options);
 }
