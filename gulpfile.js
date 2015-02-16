var gulp    = require('gulp'),
jshint      = require('gulp-jshint'),
del         = require('del'),
es          = require('event-stream'),
concat      = require('gulp-concat'),
sourcemaps  = require('gulp-sourcemaps'),
sass        = require('gulp-sass'),
// Check out https://github.com/coen-hyde/gulp-cog
// if lack of source maps becomes a problem
include     = require('gulp-include'),
// Constants
SCRIPTS_SRC = '_assets/js/**/**.js',
SASS_SRC    = '_assets/sass/**/*.scss',
VENDOR_JS   = 'vendor/**/*.js',
VENDOR_CSS  = 'vendor/**/*.css';

gulp.task('clean:scripts', function (cb) {
  return del('public/js/**', cb);
});

gulp.task('clean:styles', function (cb) {
  return del('public/css/**', cb);
});

gulp.task('clean:images', function (cb) {
  return del('public/img/**', cb);
});

gulp.task('clean', ['clean:scripts', 'clean:styles']);

gulp.task('scripts:vendor', function () {
  var angularSources = [
    "angular", "angular-animate", "angular-aria", "angular-material"
  ].map(function (module) {
    return "vendor/" + module + "/" + module + ".js";
  });

  angularSources.push('vendor/angular-socket-io/socket.min.js');

  return gulp.src(angularSources)
    .pipe(concat('vendors.js'))
    .pipe(gulp.dest('public/js'));
});

gulp.task('scripts:application', function () {
  return gulp.src('_assets/js/application.js')
    .pipe(include())
    .pipe(gulp.dest('public/js'));
});

gulp.task('scripts', ['scripts:vendor', 'scripts:application']);

gulp.task('move-source-maps', function () {
  return gulp.src('vendor/**/*.map')
    .pipe(es.map(function (file, cb) {
      file.path = file.base + file.path.split('/').slice(-1)[0];
      cb(null, file);
    }))
    .pipe(gulp.dest('public/js'));
});

gulp.task('lint', function () {
  return gulp.src([SCRIPTS_SRC])
    .pipe(jshint({
      "unused": true,
      "undef": true,
      "globals": {
        "console": false,
        "document": false,
        "window": false,
        "navigator": false
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

gulp.task('move-images', function () {
  return gulp.src("_assets/img/**")
    .pipe(gulp.dest('public/img'));
});

gulp.task('watch:scripts', function () {
  return gulp.watch(SCRIPTS_SRC, ['lint', 'scripts']);
});

gulp.task('watch:sass', function () {
  return gulp.watch(SASS_SRC, ['sass']);
});

gulp.task('watch:images', function () {
  return gulp.watch('_assets/img/**', ['move-images']);
})

gulp.task('build', [
  'styles',
  'scripts',
  'move-source-maps',
  'move-images'
]);

gulp.task('watch', ['build', 'watch:scripts', 'watch:sass', 'watch:images'], function () {
  console.log("Watching your project...");
});
