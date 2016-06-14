var gulp = require('gulp'),
    minifycss = require('gulp-minify-css'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    del = require('del');

gulp.task('minifyjs', function() {
    return gulp.src('jquery.district-selector/*.js')
        .pipe(rename({suffix: '.min'}))   //rename压缩后的文件名
        .pipe(uglify())    //压缩
        .pipe(gulp.dest('build/'));  //输出
});

gulp.task('clean', function(cb) {
    del(['build/'], cb)
});

gulp.task('default',['clean'], function () {
    gulp.start('minifyjs');
});