const gulp = require('gulp');
const browserSync = require('browser-sync');
const bulk = require('gulp-sass-bulk-importer');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const clean = require('gulp-clean');
const concat = require('gulp-concat')
const imagemin = require('gulp-imagemin');
const recompress = require('imagemin-jpeg-recompress');
const pngquant = require('imagemin-pngquant');
const plumber = require('gulp-plumber');
const ttf2woff2 = require('gulp-ttftowoff2');
const ttf2woff = require('gulp-ttf2woff');
const ttf2svg = require('gulp-ttf-svg');
const ttf2eot = require('gulp-ttf2eot');
const uglify = require('gulp-uglify-es').default;
// const babel = require('gulp-babel');
const twig = require('gulp-twig');
// const gulpif = require('gulp-if');
const cleanCSS = require('gulp-clean-css');
// const sourcemap = require('gulp-sourcemaps');
const runSequence = require('run-sequence');
const webpackStream = require('webpack-stream');
const webpack = require('webpack');
const rename = require("gulp-rename");

const paths = {
  app: {
    css: 'assets/css/bundle.css',
    js: 'assets/js/bundle.js',
  },
  build: {
    css: 'assets/css/bundle.min.css',
    js: 'assets/js/bundle.min.js',
  }
}

gulp.task('clean-app', function(cb) {
  return gulp.src('app', {read: false}).pipe(clean())
});

gulp.task('clean-build', function(cb) {
  return gulp.src('build', {read: false}).pipe(clean())
});

gulp.task('browser-sync', function(cb) {
  return browserSync({
    server: {
      baseDir: 'app'
    },
    notify: false
  });
});

// SCSS
gulp.task('sass', function(cb) {
  return gulp.src('src/assets/css/index.scss')
    .pipe(plumber())
    .pipe(bulk())
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
    .pipe(concat('bundle.css'))
    .pipe(gulp.dest('app/assets/css'))
    .pipe(browserSync.reload({stream: true}))
});

// JS
gulp.task('js', function(cb) {
  return gulp.src(['src/assets/js/index.js'])
    .pipe(plumber())
    .pipe(webpackStream({
      mode: 'development',
      devtool: 'eval-source-map',
      optimization: {
        minimize: false
      },
      output: {
        filename: 'bundle.js',
      },
      module: {
        rules: []
      }
    }, webpack))
    .pipe(gulp.dest('app/assets/js'))
    .pipe(browserSync.reload({stream: true}))
});

gulp.task('img', function() {
  return gulp.src(['src/assets/img/**/*', '!src/assets/img/**/*.webp'])
    .pipe(plumber())
    .pipe(
      imagemin(
        {
          interlaced: true,
          progressive: true,
          optimizationLevel: 5,
        },
        [
          recompress({
            loops: 6,
            min: 50,
            max: 90,
            quality: 'high',
            use: [pngquant({
              quality: [0.8, 1],
              strip: true,
              speed: 1
            })],
          }),
          imagemin.gifsicle(),
          imagemin.optipng(),
        ],
      ),
    )
    .pipe(gulp.dest('app/assets/img'))
    .pipe(browserSync.reload({stream: true}))
});

gulp.task('ttf2eot', function(cb) {
  return gulp.src('src/assets/font/**/*.ttf')
    .pipe(plumber())
    .pipe(ttf2eot())
    .pipe(gulp.dest('app/assets/font'))
    .pipe(browserSync.reload({stream: true}))
})

gulp.task('ttf2svg', function(cb) {
  return gulp.src('src/assets/font/**/*.ttf')
    .pipe(plumber())
    .pipe(ttf2svg())
    .pipe(gulp.dest('app/assets/font'))
    .pipe(browserSync.reload({stream: true}))
})

gulp.task('ttf2woff', function(cb) {
  return gulp.src('src/assets/font/**/*.ttf')
    .pipe(plumber())
    .pipe(ttf2woff())
    .pipe(gulp.dest('app/assets/font'))
    .pipe(browserSync.reload({stream: true}))
})

gulp.task('ttf2woff2', function(cb) {
  return gulp.src('src/assets/font/**/*.ttf')
    .pipe(plumber())
    .pipe(ttf2woff2())
    .pipe(gulp.dest('app/assets/font'))
    .pipe(browserSync.reload({stream: true}))
})

gulp.task('font', ['ttf2eot', 'ttf2svg', 'ttf2woff', 'ttf2woff2'], function(cb) {
  return gulp.src('src/assets/font/**/*.ttf')
    .pipe(plumber())
    .pipe(gulp.dest('app/assets/font'))
    .pipe(browserSync.reload({stream: true}))
});

gulp.task('media', function(cb) {
  return gulp.src('src/assets/media/**/*')
    .pipe(plumber())
    .pipe(gulp.dest('app/assets/media'))
    .pipe(browserSync.reload({stream: true}))
});

gulp.task('html', function(cb) {
  return gulp.src('src/*.twig')
    .pipe(plumber())
    .pipe(twig({
      data: {
        css: paths.app.css,
        js: paths.app.js,
        cssLib: paths.app.cssLib,
        jsLib: paths.app.jsLib,
      }
    }))
    .pipe(gulp.dest('app'))
    .pipe(browserSync.reload({stream: true}))
});


gulp.task('watch', function() {
  gulp.watch(['src/**/*.twig'], ['html']);
  gulp.watch(['src/assets/js/**/*.js'], ['js']);
  gulp.watch(['src/assets/css/**/*.scss'], ['sass']);
  gulp.watch(['src/assets/img/**/*'], ['img']);
  gulp.watch(['src/assets/media/**/*'], ['media']);
  gulp.watch(['src/assets/font/*.ttf'], ['font']);
});

// SCSS
gulp.task('build-sass', function() {
  return gulp.src('src/assets/css/index.scss')
    .pipe(plumber())
    .pipe(bulk())
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: false }))
    .pipe(cleanCSS())
    .pipe(rename('bundle.min.css'))
    .pipe(gulp.dest('build/assets/css'))
});

// JS
gulp.task('build-js', function() {
  return gulp.src(['src/assets/js/index.js'])
    .pipe(plumber())
    .pipe(webpackStream({
      mode: 'production',
      devtool: false,
      optimization: {
        minimize: true
      },
      output: {
        filename: 'bundle.js',
      },
      module: {
        rules: [
          {
            test: /\.(js)$/,
            exclude: /(node_modules)/,
            loader: 'babel-loader',
          }
        ]
      }
    }, webpack))
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('build/assets/js'))
});

// IMG
gulp.task('build-img', function() {
  return gulp.src('src/assets/img/**/*')
    .pipe(plumber())
    .pipe(
      imagemin(
        {
          interlaced: true,
          progressive: true,
          optimizationLevel: 5,
        },
        [
          recompress({
            loops: 6,
            min: 50,
            max: 90,
            quality: 'high',
            use: [pngquant({
              quality: [0.8, 1],
              strip: true,
              speed: 1
            })],
          }),
          imagemin.gifsicle(),
          imagemin.optipng(),
        ],
      ),
    )
    .pipe(gulp.dest('build/assets/img'))
});

gulp.task('build-ttf2eot', function() {
  return gulp.src('src/assets/font/**/*.ttf')
    .pipe(plumber())
    .pipe(ttf2eot())
    .pipe(gulp.dest('build/assets/font'))
})

gulp.task('build-ttf2svg', function() {
  return gulp.src('src/assets/font/**/*.ttf')
    .pipe(plumber())
    .pipe(ttf2svg())
    .pipe(gulp.dest('build/assets/font'))
})

gulp.task('build-ttf2woff', function() {
  return gulp.src('src/assets/font/**/*.ttf')
    .pipe(plumber())
    .pipe(ttf2woff())
    .pipe(gulp.dest('build/assets/font'))
})

gulp.task('build-ttf2woff2', function() {
  return gulp.src('src/assets/font/**/*.ttf')
    .pipe(plumber())
    .pipe(ttf2woff2())
    .pipe(gulp.dest('build/assets/font'))
})

gulp.task('build-font', ['build-ttf2eot', 'build-ttf2svg', 'build-ttf2woff', 'build-ttf2woff2'], function() {
  return gulp.src('src/assets/font/**/*.ttf')
    .pipe(plumber())
    .pipe(gulp.dest('build/assets/font'))
});

gulp.task('build-media', function() {
  return gulp.src('src/assets/media/**/*')
    .pipe(plumber())
    .pipe(gulp.dest('build/assets/media'))
});

gulp.task('build-html', function() {
  return gulp.src('src/*.twig')
    .pipe(plumber())
    .pipe(twig({
      data: {
        css: paths.app.css,
        js: paths.app.js,
      }
    }))
    .pipe(gulp.dest('build'))
});

gulp.task('default', function() {
  runSequence(
    ['clean-app', 'clean-build'],
    ['sass', 'js', 'img', 'font', 'media', 'html'],
    ['browser-sync', 'watch']
  )
})

gulp.task('build', function() {
  runSequence(
    ['clean-app', 'clean-build'],
    ['build-sass', 'build-js', 'build-img', 'build-font', 'build-media', 'build-html'],
  );
});
gulp.task('clean', function() {
  runSequence(
    'clean-app','clean-build',
  );
});
