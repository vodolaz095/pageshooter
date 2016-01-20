'use strict';

var
  exec = require('child_process').exec,
  gulp = require('gulp'),
  debug = require('gulp-debug'),
  less = require('gulp-less'),
  bower = require('gulp-bower'),
  gulpFilter = require('gulp-filter'),
  minifyCSS = require('gulp-minify-css'),
  uglify = require('gulp-uglify'),
  mainBowerFiles = require('main-bower-files'),
  rename = require('gulp-rename'),
  concat = require('gulp-concat'),
  del = require('del'),
  jsFilter = gulpFilter('*.js'),
  lessFilter = gulpFilter('*.less'),
  cssFilter = gulpFilter(['*.less', '*.css']),
  fontFilter = gulpFilter(['*.eot', '*.woff', '*.svg', '*.ttf']);

gulp.task('clean', function (cb) {
  return del(['public/dist/*.js', 'public/dist/*.css'], cb);
});

gulp.task('bower', ['clean'], function () {
  return bower();
});

gulp.task('vendor-js',['bower'], function () {
  return gulp.src(mainBowerFiles())
    .pipe(jsFilter)
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('public/dist'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('public/dist'));
});

gulp.task('vendor-css',['bower'], function () {
  return gulp.src(mainBowerFiles())
    .pipe(cssFilter)
    .pipe(debug({title: 'Vendor less files:'}))
    .pipe(less())
    .pipe(debug({title: 'Vendor css files:'}))
    .pipe(concat('vendor.css'))
    .pipe(gulp.dest('public/dist'))
    .pipe(minifyCSS())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('public/dist'));
});

gulp.task('scripts',['vendor-js'], function () {
  return gulp.src(['public/dist/vendor.js', 'public/javascripts/*.js'])
    .pipe(debug({title: 'Custom js files:'}))
    .pipe(concat('dist.js'))
    .pipe(gulp.dest('public/dist'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('public/dist'));
});

////http://stackoverflow.com/questions/26273358/gulp-minify-all-css-files-to-a-single-file
gulp.task('styles',['vendor-css'], function () {
  return gulp.src(['public/dist/vendor.css', 'public/styles/*.css'])
    .pipe(debug({title: 'Custom CSS files:'}))
    .pipe(concat('dist.css'))
    .pipe(gulp.dest('public/dist'))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifyCSS())
    .pipe(gulp.dest('public/dist'));
});


gulp.task('vendor', ['bower'], function () {
  return gulp.start('vendor-js', 'vendor-css');
});

gulp.task('default', ['clean'], function () {
  return gulp.start('scripts', 'styles');
});

gulp.task('heroku', ['default'], function (cb) {
  exec('node index.js', cb);
});