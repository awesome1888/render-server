const gulp = require('gulp');
const clean = require('gulp-clean');
const babel = require('gulp-babel');
const less = require('gulp-less');
const path = require('path');
const plumber = require('gulp-plumber');
const spawn = require('child_process').spawn;

const srcFolder = './';
const srcFolderServer = srcFolder+'server';
const srcFolderClient = srcFolder+'client';

const dstFolder = 'build/';
const dstFolderServer = dstFolder+'server';
const dstFolderClient = dstFolder+'client';

let node = null;

///////////////////
// Client

// clean the previous client build
gulp.task('cleanClient', function() {
    return gulp.src(dstFolderClient, {read: false})
        .pipe(clean());
});

// compile client js (es6)
gulp.task('compileEs6Client', ['cleanClient'], function() {
    return gulp.src(srcFolderClient+'/**/*.es6')
        .pipe(plumber())
        .pipe(babel({
            presets: [
                ["env", {
                    "targets": {
                        "browsers": ["last 2 versions", "safari >= 7"]
                    },
                    "modules": "amd",
                }]
            ]
        }))
        .pipe(gulp.dest(dstFolderClient));
});

// copy the other client js (plain)
gulp.task('copyJsClient', ['cleanClient'], function() {
    return gulp.src([
        srcFolderClient+'/**/*.js',
        // 'node_modules/jquery/dist/jquery.slim.js'
    ]).pipe(gulp.dest(dstFolderClient));
});

// compile less
gulp.task('compileLessClient', ['cleanClient'], function () {
    return gulp.src(srcFolderClient+'/css/**/*.less')
        .pipe(plumber())
        .pipe(less({
            paths: [ path.join(__dirname, 'less', 'includes') ]
        }))
        .pipe(gulp.dest(dstFolderClient+'/css'));
});

// copy css
// gulp.task('copyCss', ['clean'], function() {
//     return gulp.src([
//         'node_modules/bootstrap/dist/**/*.css',
//     ]).pipe(gulp.dest('dest'));
// });

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
    return gulp.src([
        srcFolderServer+'/**/*.js',
    ]).pipe(gulp.dest(dstFolderServer));
});

// run the server
gulp.task('server', ['buildServer'], function() {
    if (node) node.kill();
    node = spawn('node', [dstFolderServer+'/index.js'], {stdio: 'inherit'});
    node.on('close', function (code) {
        if (code === 8) {
            gulp.log('Error detected, waiting for changes...');
        }
    });
});

///////////////////
// Root tasks

gulp.task('watch', function() {
    gulp.watch([srcFolderClient+'/**/*'], ['buildClient']);
    gulp.watch([srcFolderServer+'/**/*'], ['buildServer', 'server']);
});
gulp.task('buildClient', ['compileEs6Client', 'copyJsClient', 'compileLessClient', /*'copyCss'*/]);
gulp.task('buildServer', ['compileEs6Server', 'copyJsServer']);
gulp.task('default', ['buildClient', 'buildServer', 'watch', 'server']);
