var
    gulp = require( 'gulp' ),
    panini = require( 'panini' ),
    sync = require( 'browser-sync' ).create(),
    sass = require( 'gulp-sass' ),
    autoprefixer = require( 'autoprefixer' )
    babel = require( 'gulp-babel' ),
    minify = require( 'gulp-babel-minify' ),
    concat = require( 'gulp-concat' ),
    cache = require( 'gulp-cache' ),

    reload = sync.reload,
    path = {
        dist: 'dist/',
        src: 'src/',
        html: 'src/html/',
        scss: 'src/styles/**/**/*.scss',
        scripts: 'src/scripts/**/*.js',
        css: 'dist/assets/css/',
        js: 'dist/assets/js'
    };

// PROCESS SASS - AUTOPREFIX & (optionally) MINIFY
gulp.task('sass', () => {
  return gulp.src('src/styles/styles.scss')
      .pipe(sass().on('error', sass.logError))
      /*.pipe(autoprefixer({
          browsers: ['last 2 versions'],
          grid: true,
      }))
      //.pipe(cleanCSS()) // install gulp-clean-css
      */
      .pipe(gulp.dest(path.css))
      .pipe(reload({ stream: true }))
});

// CONCAT ALL JS SCRIPTS 
// ES6 TO ES5 VIA BABEL, THEN MINIFES
gulp.task( 'scripts', () => {
  gulp.src( [ 'src/scripts/site.js' ] )
    .pipe( concat( 'site.js' ) )
    .pipe( babel( {
      presets: [ 'env' ]
    } ) )
    .pipe( minify( {
      mangle: {
        keepClassName: true
      }
    } ) )
    .pipe( gulp.dest( path.js ) )
    .pipe( reload( { stream: true } ) )
} );

// BUILD HTML PAGES, PARTIALS, APPLY LAYOUTS & DATA
gulp.task('html', function() {
  return gulp.src(path.html + 'pages/**/*.html')
      .pipe(panini({
          root: path.html + 'pages/',
          layouts: path.html + 'layouts/',
          partials: path.html + 'partials/',
          helpers: path.html + 'helpers/',
          data: path.html + 'data/'
      }))
      .pipe(gulp.dest(path.dist));
});

// FLUSH OUT OLD HTML & REBUILD FRESH
gulp.task('resetPages', (done) => {
    panini.refresh();
    done();
});

// START BROWSER SYNC / HOT RELOAD
gulp.task('serve', ['html'], function() {
    sync.init({
        server: path.dist,
        port: 3000
    })
});

gulp.task('watch', ['serve'], () => {
  gulp.watch( [path.html + '{pages,layouts,partials,data}/**/*.html'], ['resetPages', 'html', reload] );
  gulp.watch( path.scss, [ 'sass', reload ] );
  gulp.watch( path.scripts, [ 'scripts', reload ] );
})

// FOR ALL TASKS RUN 'gulp'
gulp.task( 'default', [ 'serve', 'html', 'sass', 'scripts', 'watch' ] );