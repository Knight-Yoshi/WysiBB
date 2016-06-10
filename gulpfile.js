/* global require: true */
var gulp = require( 'gulp' );
var changed = require( 'gulp-changed' );
var sass = require( 'gulp-sass' );
var prefixer = require( 'gulp-autoprefixer' );
var cleanCSS = require( 'gulp-clean-css' );
var rename = require( 'gulp-rename' );

var config = {
	prefixer : {
		browsers : [
				'last 2 versions',
		],
	},
	sass : {
		src : [
				'scss/*.scss',
		],
	},
	css : {
		src : [
				'css/*.css', '!css/*.min.css',
		],
		dest : 'css',
	},
};

// build css
gulp.task( 'sass', function ( ) {
	gulp.src( config.sass.src ).pipe( sass( {
		outputStyle : 'expanded',
		includePaths : [
				'node_modules/foundation-sites/scss', 'node_modules/font-awesome/scss',
		],
	} ).on( 'error', sass.logError ) ).pipe( prefixer( config.prefixer ) ).pipe( changed( config.css.dest, {
		extension : 'css',
	} ) ).pipe( gulp.dest( config.css.dest ) );
} );

gulp.task( 'minify-css', function ( ) {
	return gulp.src( config.css.src ).pipe( cleanCSS( {
		compatibility : '',
	} ) ).pipe( rename( {
		suffix : '.min',
	} ) ).pipe( gulp.dest( config.css.dest ) );
} );

gulp.task( 'run', function ( ) {
	gulp.watch( config.sass.src, [
			'sass',
	] );

	gulp.watch( config.css.src, [
			'minify-css',
	] );
} );
