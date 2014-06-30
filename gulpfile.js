// Load plugins
var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var envify = require('envify/custom');
var partialify = require('partialify');
var stylus = require('gulp-stylus');
var nib = require('nib');
var minifycss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var rename = require('gulp-rename');
var gulpif = require('gulp-if');
var clean = require('gulp-clean');
var cache = require('gulp-cache');
var notify = require('gulp-notify');
var connect = require('gulp-connect');
var watch = require('gulp-watch');


var env = process.env.NODE_ENV || 'debug';

// default task
gulp.task('default', ['build', 'connect', 'watch']);

// build
gulp.task('build', ['html', 'browserify', 'styles', 'assets']);

// watch
gulp.task('watch', ['build'], function() {
    gulp.watch('src/**/*.html', ['html', 'browserify']);
    gulp.watch('src/**/*.css', ['css']);
    gulp.watch('src/**/*.js', ['browserify']);
    gulp.watch('src/**/*.styl', ['styles']);
    gulp.watch('src/img/**/*', ['images']);
    gulp.watch('src/fonts/**/*', ['fonts']);
    gulp.watch('src/lib/**/*', ['lib']);
    gulp.watch('dist/**/*', ['reload']);
});

gulp.task('html', function() {
    gulp.src('./src/*.html')
        .pipe(gulp.dest('dist/'));
});

// browserify  a
gulp.task('browserify', function() {
    var environ = {
        NODE_ENV: process.env.NODE_ENV
    };
    browserify('./src/index.js')
        .transform(envify(environ))
        .transform(partialify)
        .bundle({
            debug: true //env === 'development'
        })
        .on('error', handleErrors)
        .pipe(source('bundle.js'))
        .pipe(gulpif(env === 'production', uglify()))
        .pipe(gulp.dest('dist/'))
});


// stylus
gulp.task('styles', function() {
    var stylus_options = {
        'use': [nib()],
        //'include css': true,
    };
    var minify_options = {
        noRebase: true,
        processImport: false,
        keepBreaks: env === 'development',
        noAdvanced: env === "development"
    };
    return gulp.src('src/index.styl')
        .pipe(stylus(stylus_options))
        .on('error', handleErrors)
        .pipe(minifycss(minify_options))
        .pipe(rename('index.css'))
        .pipe(gulp.dest('dist/'))
});


// images
gulp.task('assets', ['images', 'fonts', 'lib', 'css']);


gulp.task('css', function() {
    return gulp.src('src/**/*.css')
        .pipe(gulp.dest('dist/'));
});

gulp.task('lib', function() {
    return gulp.src('src/lib/**/*')
        .pipe(gulp.dest('dist/lib'));
});

gulp.task('fonts', function() {
    return gulp.src('src/fonts/**/*')
        .pipe(gulp.dest('dist/fonts'));
});

gulp.task('images', function() {
    return gulp.src('src/img/**/*')
    //.pipe(cache(imagemin({ 
    //optimizationLevel: 3, 
    //progressive: true, 
    //interlaced: true 
    //}))).on('error', handleErrors)
    .pipe(gulp.dest('dist/img'))
});


// connect server with livereload
gulp.task('connect', function() {
    connect.server({
        root: 'dist',
        port: 9000,
        livereload: true
    });
});

//reload
gulp.task('reload', function() {
    gulp.src('./src/index.html')
        .pipe(connect.reload());
});


// clean
gulp.task('clean', function() {
    return gulp.src(['dist/**/*'], {
        read: false
    })
        .pipe(clean());
});


//handle erros gracefully instead of quitting...
function handleErrors() {
    // Send error to notification center with gulp-notify
    notify.onError({
        title: "Compile Error",
        message: "<%= error %>"
    }).apply(this, arguments);
    // Keep gulp from hanging on this task
    this.emit('end');
};