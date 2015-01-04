var gulp    = require('gulp'),
jshint      = require('gulp-jshint'),
del         = require('del'),
es          = require('event-stream'),
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

var buildScripts = function (scriptsGlob, name)  {
  // Grab all project JavaScript sources
  return gulp.src(scriptsGlob)
    // Initialize source maps
    .pipe(sourcemaps.init())
    // Bring everything into one file
    .pipe(concat(name))
    // Write the result to javascripts folder
    .pipe(gulp.dest('public/js'));
};

gulp.task('scripts:vendor', function () {
  var angularSources = [
    "angular", "angular-animate", "angular-aria", "angular-material"
  ].map(function (module) {
    return "vendor/" + module + "/" + module + ".min.js";
  });

  angularSources.unshift('vendor/hammerjs/hammer.min.js');

  return gulp.src(angularSources)
    .pipe(concat('vendors.js'))
    .pipe(gulp.dest('public/js'));
});

gulp.task('scripts:application', function () {
  return buildScripts(SCRIPTS_SRC, 'application.js');
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

gulp.task('watch:scripts', function () {
  return gulp.watch(SCRIPTS_SRC, ['lint', 'scripts']);
});

gulp.task('watch:sass', function () {
  return gulp.watch(SASS_SRC, ['sass']);
});

gulp.task('build', [
  'clean',
  'styles',
  'scripts',
  'move-source-maps'
]);

gulp.task('watch', ['build', 'watch:scripts', 'watch:sass'], function () {
  console.log("Watching your project...");
});
