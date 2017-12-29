const gulp = require('gulp');
const clean = require('gulp-clean');
const babel = require('gulp-babel');
const plumber = require('gulp-plumber');
const vfs = require('vinyl-fs');

const srcFolder = './';
const srcFolderServer = srcFolder+'app';

const dstFolder = 'build/';
const dstFolderServer = dstFolder+'app';

///////////////////
// Server

// clean the previous server build
gulp.task('cleanServer', function() {
    return gulp.src(dstFolderServer, {read: false})
        .pipe(clean());
});

// compile server js (es6)
gulp.task('compileEs6Server', ['cleanServer'], function() {
    return gulp.src(srcFolderServer+'/**/*.es6')
        .pipe(plumber())
        .pipe(babel({
            presets: [
                ["env", {
                    "targets": {
                        "node": "6.10"
                    },
                    "modules": "commonjs",
                }],
            ]
        }))
        .pipe(gulp.dest(dstFolderServer));
});

// copy the other client js (plain)
gulp.task('copyJsServer', ['cleanServer'], function() {
    // vfs follows symlinks
    console.dir(srcFolderServer+'/**/*.js');
    return vfs.src([
        srcFolderServer+'/**/*.js',
    ]).pipe(vfs.dest(dstFolderServer));
});

///////////////////
// Root tasks

gulp.task('buildServer', ['compileEs6Server', 'copyJsServer']);
gulp.task('default', ['buildServer']);
