'use strict';

const gulp = require('gulp');
const mocha = require('gulp-mocha');
const shell = require('gulp-shell');
const minimist = require('minimist');
const runSequence = require('run-sequence');
const liveServer = require('gulp-live-server');
const TinyShipyardClient = require('tiny-shipyard-client');
const pkg = require('./package.json');

const args = minimist(process.argv.slice(2), { string: ['tag'] });
const options = {
  serviceName: pkg.name,
  instances: 2,
  registryHost: '46.101.193.82',
  registryPort: '5000',
  shipyardUrl: 'http://46.101.245.190:8080',
  shipyardServiceKey: 'DbcGOIHQxGxgBVVT0/RYPvq7UB5t9vmhoTNO',
  versionTag: /^v?\d+\.\d+\.\d+$/.test(args.tag) ? args.tag.replace(/^v/, '') : undefined // do we have a version tag?
}

let server;

gulp.task('test', function () {
  return gulp.src(['**/*.specs.js', '!node_modules/**'], { read: false })
    .pipe(mocha({ reporter: 'spec' }));
});

gulp.task('serve', function (done) {
  server = server || liveServer.new('index.js');
  server.start();
  done();
});

gulp.task('watch', ['serve'], function () {
  gulp.watch(['**/*.js', '!node_modules/**', '!gulpfile.js'], ['test', 'serve']);
});

gulp.task('dockerize', shell.task([
  `docker build -t ${options.serviceName} .`,
]));

gulp.task('push', shell.task([
  `docker run --privileged -d -p 5000:5000 -e REGISTRY_HOST="${options.registryHost}" -e REGISTRY_PORT="${options.registryPort}" rsmoorthy/registry-forwarder`,
  `docker tag ${options.serviceName} localhost:5000/${options.serviceName}:${options.versionTag}`,
  `docker push localhost:5000/${options.serviceName}:${options.versionTag}`
]));

gulp.task('deploy', function (done) {
  const client = new TinyShipyardClient(options.shipyardUrl, options.shipyardServiceKey);
  const imageName = `${options.registryHost}:${options.registryPort}/${options.serviceName}:${options.versionTag}`;
  let promise = Promise.resolve();
  for (let i = 0; i < options.instances; i += 1) promise = promise.then(() => client.createContainer(imageName));
  promise.then(() => done(), error => done(error));
});

gulp.task('ci', function (done) {
  runSequence.apply(null, options.versionTag ? ['test', 'dockerize', 'push', 'deploy', done] : ['test', 'dockerize', done]);
});

gulp.task('default', ['watch'], function () {});
