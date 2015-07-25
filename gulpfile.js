var gulp = require('gulp'),
    less = require('gulp-less'),
    handlebars = require('gulp-compile-handlebars'),
    browserSync = require('browser-sync'),
    autoprefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    jshint = require('gulp-jshint'),
    header  = require('gulp-header'),
    rename = require('gulp-rename'),
    minifyCSS = require('gulp-minify-css'),
    data = require('gulp-data'),
    path = require('path'),
    package = require('./package.json');

var banner = [
  '/*!\n' +
  ' * <%= package.name %>\n' +
  ' * <%= package.title %>\n' +
  ' * <%= package.url %>\n' +
  ' * @author <%= package.author %>\n' +
  ' * @version <%= package.version %>\n' +
  ' * Copyright ' + new Date().getFullYear() + '. <%= package.license %> licensed.\n' +
  ' */',
  '\n'
].join('');


gulp.task('css', function () {
  return gulp.src('./src/less/**/*.less')
    .pipe(less())
    .pipe(autoprefixer('last 4 version'))
    .pipe(minifyCSS())
    .pipe(rename({ suffix: '.min' }))
    .pipe(header(banner, { package : package }))
    .pipe(gulp.dest('app/assets/css'))
    .pipe(browserSync.reload({stream:true}));
});

/*
  Get data via JSON file, keyed on filename.
*/
gulp.task('handlebars', function() {
  return gulp.src('./src/templates/**/[^_]*.hbs')
    .pipe(data(function(file) {
      var filepath = file.path.replace('.hbs', '') + '.json';

      try {
          require.resolve(filepath);
      } catch(e) {
          return;
      }

      return require(filepath);

    }))
    .pipe(handlebars())
    .pipe(rename(function (path) {
      path.extname = '.html'
    }))
    .pipe(gulp.dest('app'))
    .pipe(browserSync.reload({stream:true}));
});

gulp.task('js',function(){
  gulp.src('src/js/scripts.js')
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'))
    .pipe(header(banner, { package : package }))
    .pipe(gulp.dest('app/assets/js'))
    .pipe(uglify())
    .pipe(header(banner, { package : package }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('app/assets/js'))
    .pipe(browserSync.reload({stream:true, once: true}));
});

gulp.task('browser-sync', function() {
    browserSync.init(null, {
        server: {
            baseDir: "app"
        }
    });
});

gulp.task('bs-reload', function () {
    browserSync.reload();
});

gulp.task('default', ['css', 'js', 'handlebars', 'browser-sync'], function () {
    gulp.watch("src/less/**/*.less", ['css']);
    gulp.watch("src/templates/**/*", ['handlebars']);
    gulp.watch("src/js/*.js", ['js']);
    gulp.watch("app/*.html", ['bs-reload']);
});
