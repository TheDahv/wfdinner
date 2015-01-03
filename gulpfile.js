var gulp    = require('gulp'),
jshint      = require('gulp-jshint'),
del         = require('del'),
concat      = require('gulp-concat'),
sourcemaps  = require('gulp-sourcemaps'),
sass        = require('gulp-sass'),
// Constants
SCRIPTS_SRC = '_assets/js/**/*.js',
SASS_SRC    = '_assets/sass/*.scss',
VENDOR_JS   = 'vendor/**/*.js',
VENDOR_CSS  = 'vendor/**/*.css';

gulp.task('clean:scripts', function (cb) {
  return del('public/js/**', cb);
});

gulp.task('clean:styles', function (cb) {
  return del('public/css/**', cb);
});

gulp.task('clean', ['clean:scripts', 'clean:styles']);

gulp.task('scripts', ['clean:scripts'], function () {
  // Grab all project JavaScript sources
  return gulp.src([VENDOR_JS, SCRIPTS_SRC])
    // Initialize source maps
    .pipe(sourcemaps.init())
    // Bring everything into one file
    .pipe(concat('application.js'))
    // Write the result to javascripts folder
    .pipe(gulp.dest('public/js/'));
});

gulp.task('lint', function () {
  return gulp.src([SCRIPTS_SRC])
    .pipe(jshint({
      "unused": true,
      "undef": true,
      "globals": {
        "console": false,
        "document": false,
        "navigator": false,
        "requestAnimationFrame": false,
        "Uint8Array": false,
        "RTCSessionDescription": false,
        "RTCIceCandidate": false,
        "RTCPeerConnection": false,
        "define": false,
        "io": false,
        "Audio": false,
        "attachMediaStream": false,
        "AudioContext": false
      }
    }))
    .pipe(jshint.reporter(require('jshint-stylish')));
});

gulp.task('vendor-styles', function () {
  return gulp.src(VENDOR_CSS)
    .pipe(concat('vendor.css'))
    .pipe(gulp.dest('./public/css'));
});

gulp.task('sass', function () {
  return gulp.src(SASS_SRC)
    .pipe(sass({
      logErrToConsole: true
    }))
    .pipe(gulp.dest('./public/css'));
});

gulp.task('styles', ['vendor-styles', 'sass']);

gulp.task('watch:scripts', function () {
  return gulp.watch(SCRIPTS_SRC, ['lint', 'move-scripts']);
});

gulp.task('watch:sass', function () {
  return gulp.watch(SASS_SRC, ['sass']);
});

gulp.task('build', [
  'clean',
  'vendor-styles',
  'sass',
  'styles',
  'scripts'
]);

gulp.task('watch', ['build', 'watch:scripts', 'watch:sass'], function () {
  console.log("Watching your project...");
});
