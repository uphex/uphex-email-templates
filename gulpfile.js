var pkg         = require('./package.json'),
    gulp        = require('gulp'),

    connect     = require('gulp-connect'),
    del         = require('del'),
    imagemin    = require('gulp-imagemin'),
    inlineCss   = require('gulp-inline-css'),
    jade        = require('gulp-jade'),
    plumber     = require('gulp-plumber'),
    runSequence = require('run-sequence'),
    sass        = require('gulp-sass'),
    sourcemaps  = require('gulp-sourcemaps');

var paths = {
  assets  : 'src/assets/**/*',
  images  : 'src/images/**/*.{png,jpg,gif}',
  jade    : 'src/**/*.jade',
  sass    : 'src/sass/**/*.scss',
  release : 'release/'
};

gulp.task('clean', function(cb) {
  del(paths.release, cb);
});

gulp.task('watch', function () {
  gulp.watch(paths.scripts, ['js:dev']);
  gulp.watch(paths.jade, ['jade:dev']);
  gulp.watch(paths.sass, ['sass:dev', 'jade:dev']);
  gulp.watch(paths.images, ['imagemin:dev']);
  gulp.watch(paths.assets, ['assets']);
});

gulp.task('assets', function() {
  return gulp.src(paths.assets)
    .pipe(plumber())
    .pipe(gulp.dest(paths.release + 'assets/'));
});

gulp.task('connect:dev', function() {
  connect.server({
    root: paths.release,
    port: 8000,
    livereload: true
  });
});

gulp.task('connect:rel', function() {
  connect.server({
    root: paths.release,
    port: 8000
  });
});

gulp.task('sass:dev', function() {
  return gulp.src([paths.sass, '!**/_*.scss'])
    .pipe(plumber())
      .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.release + 'css/'))
    .pipe(connect.reload());
});

gulp.task('sass:rel', function() {
  return gulp.src([paths.sass, '!**/_*.scss'])
  .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
  .pipe(gulp.dest(paths.release + 'css/'))
});

gulp.task('jade:dev', function() {
  return gulp.src([paths.jade, '!**/_*.jade'])
    .pipe(plumber())
    .pipe(jade())
    .pipe(gulp.dest(paths.release))
    .pipe(inlineCss())
    .pipe(gulp.dest(paths.release))
    .pipe(connect.reload());
});

gulp.task('jade:rel', function() {
  return gulp.src([paths.jade, '!**/_*.jade'])
    .pipe(jade())
    .pipe(gulp.dest(paths.release))
    .pipe(inlineCss())
    .pipe(gulp.dest(paths.release))
});

gulp.task('imagemin:dev', function() {
  return gulp.src(paths.images)
    .pipe(plumber())
    .pipe(gulp.dest(paths.release + 'images/'))
});

gulp.task('imagemin:rel', function() {
  return gulp.src(paths.images)
    .pipe(imagemin())
    .pipe(gulp.dest(paths.release + 'images/'))
});

// Start server in development mode
gulp.task('default', ['clean'], function(cb) {
  runSequence(
    'sass:dev',
    [
      'jade:dev',
      'assets',
      'imagemin:dev',
    ], [
      'connect:dev',
      'watch'
    ]
  , cb);
});

// Start server in preview mode
gulp.task('preview', ['clean'], function(cb) {
  runSequence(
    'sass:rel',
    [
      'jade:rel',
      'assets',
      'imagemin:rel',
    ],
    'connect:rel'
  , cb);
});

// Build optimized files
gulp.task('build', function(cb) {
  runSequence(
    'clean',
    'sass:rel',
    [
      'jade:rel',
      'assets',
      'cname',
      'imagemin:rel']
  , cb)
});
