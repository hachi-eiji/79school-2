gulp = require('gulp')
del = require('del')
vinylPaths = require('vinyl-paths')
coffee = require('gulp-coffee')
ts = require('gulp-typescript')
debug = require('gulp-debug')

gulp.task 'ping', ->
  console.log 'pong'

gulp.task 'compile:typescript', ->
  gulp.src(['app.ts', './models/**/*.ts', './libs/**/*.ts', './routes/**/*.ts', './tests/**/*.ts'], {base: './'})
  .pipe(debug({title: 'compile source'}))
  .pipe(ts({
      noImplicitAny: true,
      target: 'ES5',
      module: 'commonjs'
    }))
  .pipe(gulp.dest('./'))

# clean js, js.map
gulp.task 'clean:typescript', ->
  gulp.src([
    'app.js',
    'app.js.map',
    './models/**/*.js',
    './models/**/*.js.map',
    './libs/**/*.js',
    './libs/**/*.js.map',
    './routes/**/*.js',
    './routes/**/*.js.map'
  ], {base: './'})
  .pipe(debug({title: 'delete file'}))
  .pipe(vinylPaths(del));

# default
gulp.task 'default', ['ping']
