// Gulp file
var devPath         = "./wp-content/themes/target99/lib";
var distPath        = "./wp-content/themes/target99";
var scriptsArray    = [
        devPath + '/js/*/*.js',
        devPath + '/js/scripts.js'
    ];

var ignoreList  = [
        "*.git",
        "*.bin",
        "*.DS_Store",
        ".gitignore",
        ".gitmodules",
        '.vagrant',
        'ansible',
        "gulpfile.js",
        "node_modules",
        "uploads",
        "package.json"
    ];

// Plugins
var autoprefixer    = require('gulp-autoprefixer');
var chalk           = require('chalk');
var concat          = require('gulp-concat');
var gulp            = require('gulp');
var gutil           = require('gulp-util');
var imagemin        = require('gulp-imagemin');
var inquirer        = require('inquirer');
var livereload      = require('gulp-livereload');
var maps            = require('gulp-sourcemaps');
var notifier        = require('node-notifier');
var rename          = require('gulp-rename');
var rsync           = require('rsyncwrapper').rsync;
var less            = require('gulp-less');
var uglify          = require('gulp-uglify');


// -------------------------------------------------
// ----------------- DEVELOPMENT -------------------
// -------------------------------------------------

// Default - watch for any changes
gulp.task('default', ['styles', 'scripts', 'images'], function() {
    livereload.listen();
    gulp.watch(devPath + '/less/**/*.less', ['styles']);
    gulp.watch(devPath + '/js/**/*.js', ['scripts']);
    // gulp.watch(distPath + '/img/original/**', ['images']);
});

gulp.task('styles', function() {
    return gulp.src(devPath + '/less/main.less')
        .pipe(maps.init())

        // Now create some minified CSS
        .pipe(less())

        // Rename it so we don't overwrite our unmin CSS
        .pipe(rename({
            basename: 'main',
            suffix: '.min'
        }))
        .pipe(autoprefixer({
            browsers: ['last 3 versions'],
            cascade: false
        }))
        .pipe(maps.write('./'))
        .pipe(gulp.dest(distPath + '/css/'))
        .pipe(livereload());
});

gulp.task('scripts', function () {
    return gulp.src(devPath + '/js/**/*.js')
        .pipe(maps.init())
        .pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(maps.write('./'))
        .pipe(gulp.dest(distPath + '/js/'))
        .pipe(livereload());
});

gulp.task('images', function() {
    gulp.src(distPath + '/img/original/**')
    .pipe(imagemin())
    .pipe(gulp.dest(distPath + '/img/min/'))
    .pipe(livereload());
});
