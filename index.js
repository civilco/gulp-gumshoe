const gutil = require('gulp-util');
const through = require('through2');
const chalk = require('chalk');
const prettyBytes = require('pretty-bytes');
const StreamCounter = require('stream-counter');
const path = require('path');
const fetch = require('node-fetch');

module.exports = (opts) => {
  let totalSize = 0;
  let fileCount = 0;
  let output = {};

  const log = (what, size) => {
    gutil.log(what + ' ' + chalk.magenta(prettyBytes(size)));
  }

  return through.obj((file, enc, cb) => {
    if (file.isNull()) {
      cb();
      return;
    }

    const finish = (err, size) => {
      if (err) {
        cb(new gutil.PluginError('gulp-size', err));
        return;
      }

      let filename = file.relative;

      if (opts.fingerprint) {
        let parts = path.parse(filename);
        let newname = parts.name.replace(opts.fingerprint, '');
        filename = path.join(parts.dir, newname + parts.ext);
      }

      totalSize += size;

      if (size) {
        log(chalk.blue(filename), size);
        output[filename] = size;
      }

      fileCount++;
      cb(null, file);
    };

    if (file.isStream()) {
      file.contents.pipe(new StreamCounter())
        .on('error', finish)
        .on('finish', () => {
          finish(null, this.bytes);
        });
      return;
    }

    finish(null, file.contents.length);
  },

  // all done
  (cb) => {
    log(chalk.green('all files'), totalSize);

    let env = opts.env || process.env['NODE_ENV'] || 'development';
    fetch('https://ji53fd606b.execute-api.us-west-2.amazonaws.com/v1/files?env='+encodeURIComponent(env)+'&api_key='+encodeURIComponent(opts.apiKey), {
      method: 'POST',
      body: JSON.stringify(output),
    })
    .then(() => cb())
    .catch((err) => {
      console.log('error connecting to the server', err);
      cb(err);
    });
  });
};
