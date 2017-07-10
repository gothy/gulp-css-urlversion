gulp-css-urlversion
=====================

Plugin inlines md5-based version of url() resources in css files to force web browsers to fetch updated resources only.

### Install

    $ npm install --save-dev gulp-css-urlversion


### Usage

Example css/sass source:

```css
.royal_button {
    background: url(/images/bg-royal-button.png) 0 0 no-repeat;
    width: 14px;
    height: 14px;
    cursor: pointer;
}
```

output css:
```css
.royal_button {
    background: url(/images/bg-royal-button.png?v=aa73ac3b951818635c87dc4f56e9cc97) 0 0 no-repeat;
    width: 14px;
    height: 14px;
    cursor: pointer;
}
```

gulpfile.js:

```js
var gulp = require('gulp'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    cssUrlVersion = require('gulp-css-urlversion');

gulp.task('sass', function () {
    gulp.src('./sass/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({errLogToConsole: true}))
        .pipe(cssUrlVersion({baseDir: './static/www/'}))
        .pipe(sourcemaps.write('../maps/newthemes/'))
        .pipe(gulp.dest(_csspath + 'css/'));
});

```

### Options

**baseDir** - root for root-relative url() resources that you want to version.
By default - *process.cwd()* is used as a root for root-relative resources.

**ignoreFonts** - ignore links that point to webfont files *since 2.0.0*
**ignoreSvg** - ignore links that point to .svg files *since 2.0.0*


### Changelog

#### Version 2.0.0

- support for Node 6.x and up
- option for ignoring .svg files and fonts(.eot, .woff, .ttf, .otf)

#### Version 1.1.3

- ignore `https://` urls also

#### Version 1.1.2

- handling closing paranthesis in url()s path to fix #1. Thanks @flftfqwxf :)
- tests updated

#### Version 1.1.1

- tests added

#### Version 1.1.0

- Support for relative defined url()s
- Support for multiple background declarations
