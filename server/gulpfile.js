const gulp = require('gulp');
const clean = require('gulp-clean');
const babel = require('gulp-babel');
const less = require('gulp-less');
const path = require('path');
const plumber = require('gulp-plumber');
const spawn = require('child_process').spawn;
const vfs = require('vinyl-fs');

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

// compile client js (js)
gulp.task('compileEs6Client', ['cleanClient'], function() {
    // vfs follows symlinks
    return vfs.src(srcFolderClient+'/**/*.js')
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
        .pipe(vfs.dest(dstFolderClient));
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

// compile server js (js)
gulp.task('compileEs6Server', ['cleanServer'], function() {
    // vfs follows symlinks
    return vfs.src(srcFolderServer+'/**/*.js')
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
        .pipe(vfs.dest(dstFolderServer));
});

// run the server
gulp.task('server', ['buildServer'], function() {
    if (node) node.kill();
    node = spawn('node', [dstFolderServer+'/index.js'], {stdio: 'inherit'});
    node.on('close', function (code) {
        if (code === 8)
        {
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
gulp.task('buildClient', ['compileEs6Client', 'compileLessClient', /*'copyCss'*/]);
gulp.task('buildServer', ['compileEs6Server',]);
gulp.task('default', ['buildClient', 'buildServer', 'watch', 'server']);
