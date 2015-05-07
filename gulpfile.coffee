gulp = require('gulp')
coffee = require('gulp-coffee')
ts = require('gulp-typescript')
debug = require('gulp-debug')

gulp.task 'ping', ->
  console.log 'pong'

gulp.task 'compile-typescript', ->
  gulp.src(['app.ts', './tests/**/*.ts', './models/**/*.ts', './libs/**/*.ts', './routes/**/*.ts'], {base: './'})
  .pipe(debug({title: 'compile source'}))
  .pipe(ts({
      noImplicitAny: true,
      target: 'ES5',
      module: 'commonjs'
    }))
  .pipe(gulp.dest('./'))


# default
gulp.task 'default', ['ping']
