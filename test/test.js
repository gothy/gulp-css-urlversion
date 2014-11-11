var File = require('gulp-util').File,
    assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    crypto = require('crypto'),
    should = require('should');
    cssUrlVersion = require('../');

function md5(data) {
  return crypto.createHash("md5").update(data).digest("hex");
}

describe("gulp-css-urlversion", function() {

  var ololoJpg = fs.readFileSync(path.join(__dirname, 'fixtures/ololo.jpg'));
  var stream = null;

  beforeEach(function() {
    stream = cssUrlVersion();
  });

  it('should leave plain file unchanged', function() {
    var original = ".rule {background: #fff;}";
    var fakeFile = new File({contents: new Buffer(original)});

    stream.once('data', function(file) {
      fakeFile.contents.toString().should.equal(original);
    }).write(fakeFile);
  });

  it('should replace url() without quotes', function() {
    var fakeFile = new File({contents: new Buffer(
      ".rule {background: url(/test/fixtures/ololo.jpg);}"
    )});

    stream.once('data', function(file) {
      fakeFile.contents.toString().should.equal(
        ".rule {background: url(/test/fixtures/ololo.jpg?v=" + md5(ololoJpg.toString()) + ");}"
      );
    }).write(fakeFile);
  });

  it('should replace url() with quotes', function() {
    var fakeFile = new File({contents: new Buffer(
      ".rule {background: url('/test/fixtures/ololo.jpg');}\n" +
      '.rule2 {background: url("/test/fixtures/ololo.jpg");}'
    )});

    stream.once('data', function(file) {
      fakeFile.contents.toString().should.equal(
        ".rule {background: url(/test/fixtures/ololo.jpg?v=" + md5(ololoJpg.toString()) + ");}\n" +
        ".rule2 {background: url(/test/fixtures/ololo.jpg?v=" + md5(ololoJpg.toString()) + ");}"
      );
    }).write(fakeFile);
  });

  it('should replace url() in double background rule', function() {
    var fakeFile = new File({contents: new Buffer(
      ".rule {background: url(/test/fixtures/ololo.jpg), url('/test/fixtures/ololo.jpg');}"
    )});

    stream.once('data', function(file) {
      fakeFile.contents.toString().should.equal(
        ".rule {background: url(/test/fixtures/ololo.jpg?v=" + md5(ololoJpg.toString()) + 
          "), url(/test/fixtures/ololo.jpg?v=" + md5(ololoJpg.toString()) + ");}"
      );
    }).write(fakeFile);
  });

  it('should replace both relative and root-relative urls', function() {
    var fakeFile = new File({contents: new Buffer(
      ".rule {background: url(/test/fixtures/ololo.jpg), url('./test/fixtures/ololo.jpg');}"
    )});

    stream.once('data', function(file) {
      fakeFile.contents.toString().should.equal(
        ".rule {background: url(/test/fixtures/ololo.jpg?v=" + md5(ololoJpg.toString()) + 
          "), url(./test/fixtures/ololo.jpg?v=" + md5(ololoJpg.toString()) + ");}"
      );
    }).write(fakeFile);
  });



  it('should build root-relative paths with baseDir option', function() {
    var fakeFile = new File({contents: new Buffer(
      ".rule {background: url(/ololo.jpg);}"
    )});
    var streamBaseDir = cssUrlVersion({baseDir: './test/fixtures/'});

    streamBaseDir.once('data', function(file) {
      fakeFile.contents.toString().should.equal(
        ".rule {background: url(/ololo.jpg?v=" + md5(ololoJpg.toString()) + ");}"
      );
    }).write(fakeFile);
  });
});
