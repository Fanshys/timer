'use strict';
 
var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var cleanCSS = require('gulp-clean-css');
var uglify = require('gulp-uglify');
const babel = require('gulp-babel');
var browserSync = require('browser-sync').create();
 
sass.compiler = require('node-sass');

var cssFiles = [
    './src/css/normalize.css',
    './src/libs/bootstrap4/bootstrap.min.css',
    './src/css/style.css' // always last place
];

var jsFiles = [
    './src/js/script.min.js', // always last place
];

gulp.task('sass', function () {
    return gulp.src('./src/sass/style.sass')
      .pipe(sass().on('error', sass.logError))
      .pipe(gulp.dest('./src/css'))
      .pipe(browserSync.stream());
});

gulp.task('styles', function() {
    return gulp.src(cssFiles)
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 2 versions'],
            cascade: false
        }))
        .pipe(cleanCSS({
            level: 2
        }))
        .pipe(gulp.dest('./build/css'))
        .pipe(browserSync.stream());
});

gulp.task('scripts', function() {
    return gulp.src(['./src/js/**/*.js', '!./src/js/script.min.js'])
        .pipe(concat('script.min.js'))
        .pipe(babel({
            presets: ['@babel/env'],
        }))
        .pipe(uglify({
            toplevel: true
        }))
        .pipe(gulp.dest('./src/js'))
});

gulp.task('concatScripts', function() {
    return gulp.src(jsFiles)
        .pipe(concat('script.min.js'))
        .pipe(gulp.dest('./build/js'))
        .pipe(browserSync.stream());
});

gulp.task('html', function() {
    return gulp.src('index.html')
        .pipe(browserSync.stream());
})

gulp.task('default', function () {
    browserSync.init({
        server: {
            baseDir: "./"
        },
        //tunnel: true
    });
    gulp.watch('./src/sass/**/*.sass', gulp.series('sass'));
    gulp.watch('./src/css/**/*.css', gulp.series('styles'));
    gulp.watch(['./src/js/**/*.js', '!./src/js/script.min.js'], gulp.series('scripts', 'concatScripts'));
    gulp.watch('./*.html', gulp.series('html'));
});