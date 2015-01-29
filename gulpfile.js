var gulp = require('gulp');
var to5 = require('gulp-6to5');
var chmod = require('gulp-chmod');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');

var path = require('path');

gulp.task('bin', function() {
  gulp.src('src/*.js')
    .pipe(sourcemaps.init())
    .pipe(to5())
    .pipe(sourcemaps.write('.'))
    .pipe(chmod(755))
    .pipe(gulp.dest('bin'));
});

gulp.task('lib', function() {
  gulp.src('src/tistory/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(to5())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('lib/tistory/'));
    // .pipe(gulp.dest(function(file){
    //   return path.join("lib", 
    //     path.relative(path.join(__dirname, 'src'), path.dirname(file.path)));
    // }));
});

gulp.task('watch', function() {
  gulp.watch('src/tistory/**/*.js', ['lib']);
  gulp.watch('src/*.js', ['bin']);
});

gulp.task('default', ['bin', 'lib'], function () {});
