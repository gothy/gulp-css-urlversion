var path = require('path');
var crypto = require('crypto');
var fs = require('fs');

var gutil = require('gulp-util');
var through = require('through2');

var PLUGIN_NAME = 'gulp-css-urlversion';

function md5ify(data) {
  var hash = crypto.createHash("md5");
  hash.update(data);
  return hash.digest("hex");
}

module.exports = function(options) {
  options = options || {};
  var baseDir = options.baseDir || process.cwd();

  return through.obj(function (file, enc, cb) {
    if (file.isNull()) {
      cb(null, file);
      return;
    }

    if (file.isStream()) {
      cb(new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
      return;
    }

    var incoming = file.contents.toString();

    var outgoing = incoming.replace(/url\((.+)\)/g, function (str, dirtyUrl) {
      var url = dirtyUrl.replace(/'|"/g, '').trim();
      var replaceWithStr = null;
      if (url.indexOf("base64,") > -1 || url.indexOf("http://") > -1 ) {
        replaceWithStr = str; // ignoring base64 and external links
      } else {
        var imagePath = path.join(baseDir, url);

        try {
          var idata = fs.readFileSync(imagePath);
          replaceWithStr = 'url(' + url + "?v=" + md5ify(idata) + ')';
        } catch(err) {
          replaceWithStr = str;
          this.emit('error', new gutil.PluginError(PLUGIN_NAME, err, {fileName: file.path}));
        }
      }

      return replaceWithStr;
    }.bind(this));

    try {
      file.contents = new Buffer(outgoing);
      this.push(file);
    } catch (err) {
      this.emit('error', new gutil.PluginError(PLUGIN_NAME, err, {fileName: file.path}));
    }

    cb();
  });
};