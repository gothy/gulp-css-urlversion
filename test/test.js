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
  var alalaPng = fs.readFileSync(path.join(__dirname, 'fixtures/ala)la.png'));
  var someFont = fs.readFileSync(path.join(__dirname, 'fixtures/somefont.ttf'));
  var someSvg = fs.readFileSync(path.join(__dirname, 'fixtures/somesvg.svg'));
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

  it('should replace url() when filename has closing paranthesis in path', function() {
    var fakeFile = new File({contents: new Buffer(
      ".rule {background: url(/test/fixtures/ala)la.png);}"
    )});

    stream.once('data', function(file) {
      fakeFile.contents.toString().should.equal(
        ".rule {background: url(/test/fixtures/ala)la.png?v=" + md5(alalaPng.toString()) + ");}"
      );
    }).write(fakeFile);
  });

  it('should replace url() with quotes', function() {
    var fakeFile = new File({contents: new Buffer(
      ".rule {background: url('/test/fixtures/ololo.jpg');}\n" +
        '.rule2 {background: url(  "  /test/fixtures/ala)la.png");}'
    )});

    stream.once('data', function(file) {
      fakeFile.contents.toString().should.equal(
        ".rule {background: url(/test/fixtures/ololo.jpg?v=" + md5(ololoJpg.toString()) + ");}\n" +
          ".rule2 {background: url(/test/fixtures/ala)la.png?v=" + md5(alalaPng.toString()) + ");}"
      );
    }).write(fakeFile);
  });

  it('should replace url() in double background rule', function() {
    var fakeFile = new File({contents: new Buffer(
      ".rule {background: url(/test/fixtures/ololo.jpg), url('/test/fixtures/ala)la.png');}"
    )});

    stream.once('data', function(file) {
      fakeFile.contents.toString().should.equal(
        ".rule {background: url(/test/fixtures/ololo.jpg?v=" + md5(ololoJpg.toString()) +
          "), url(/test/fixtures/ala)la.png?v=" + md5(alalaPng.toString()) + ");}"
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

  it('should NOT ignore fonts and svgs by default', function() {
    var fakeFile = new File({contents: new Buffer(
      ".rule {background: url(/test/fixtures/somefont.ttf);}\n" +
        ".rule2 {background: url(/test/fixtures/somesvg.svg);}"
    )});

    stream.once('data', function(file) {
      fakeFile.contents.toString().should.equal(
        ".rule {background: url(/test/fixtures/somefont.ttf?v=" +
          md5(someFont.toString()) + ");}\n" +
          ".rule2 {background: url(/test/fixtures/somesvg.svg?v=" +
          md5(someSvg.toString()) + ");}"
      );
    }).write(fakeFile);
  });

  it('should ignore fonts and svgs when explicitly declared', function() {
    var fileCont = ".rule {background: url(/test/fixtures/ololo.ttf);} " +
      ".rule {background: url(/test/fixtures/alala.svg);}";
    var fakeFile = new File({contents: new Buffer(
      fileCont
    )});
    var streamWithIgnores = cssUrlVersion({ignoreFonts: true, ignoreSvg : true});

    streamWithIgnores.once('data', function(file) {
      fakeFile.contents.toString().should.equal(fileCont);
    }).write(fakeFile);
  });
});
