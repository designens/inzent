/*! gulpfile.js v1.0.0 © inyoung524@naver.com */

// =======================================
// NPM 모듈 호출
// =======================================

var gulp = require('gulp'),
    g_if = require('gulp-if'),
    shell = require('gulp-shell'),
    rename = require('gulp-rename'),
    filter = require('gulp-filter'),

    includer = require('gulp-html-ssi'),

    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    csso = require('gulp-csso'),

    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),

    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),

    browserSync = require('browser-sync'),
    reload = browserSync.reload;


// =======================================
// 환경설정
// =======================================

// 디렉토리 설정
const SRC          = 'markup';
const BUILD        = 'public';

// 파일 압축 설정
var compress = {
    'css_singleline' : true,
    'js' : false,
};

// 디렉토리 설정
var dir = {
    'css': SRC + '/assets/css',
    'js' : SRC + '/assets/js',
};

// 자바스크립트 프래임워크(framework) & 라이브러리(Library) 병합
var js_order = [
    dir.js + '/smooth-scroll.js',
    dir.js + '/svg-injector.min.js',
    dir.js + '/jquery.popupLayer.js',
    dir.js + '/jquery.a11y.popup.js',
    dir.js + '/jquery.accordion.js',
    dir.js + '/jquery.tabs.js',
    dir.js + '/jquery.carousel.js',
    dir.js + '/owl.carousel.min.js',
];

// 자바스크립트 유지관리 파일 이동
var moveJS = [
    dir.js + '/modernizr-2.8.3.min.js', // Modernizr 2.8.3
    dir.js + '/jquery-3.2.1.min.js', // jQuery 3.2.1
    dir.js + '/jquery-ui.min.js', // jQuery 1.12.0
    dir.js + '/uni-common.js', // 공통 작업 자바스크립트
];

// 스타일 프래임워크(framework) 병합
var moveCSS = [
    SRC + '/sass/**.{sass,scss}', // sass 모든 스타일
    SRC + '/guide/**.{sass,scss}' // guide 스타일
];

// 스타일 압축 파일 이동
var minCSS = [
    dir.css + '/uni-common.css', // 공통 UI 스타일
    dir.css + '/uni-main.css', // 메인 스타일
    dir.css + '/uni-style.css', // 서브 컨텐츠 스타일
];

// =======================================
// 기본 업무
// =======================================
gulp.task('default', ['server', 'font:move']);
// 'remove', 
// =======================================
// 빌드 업무
// =======================================
gulp.task('build', function() {
    compress.css = true;
    compress.js  = true;
    // gulp.start('remove');
    gulp.start('htmlSSI');
    gulp.start('sass');
    gulp.start('js');
    gulp.start('imagemin');
    gulp.start('font:move');
    setTimeout(function() {
        gulp.start('css:min');
    }, 7000);
 });

// =======================================
// 관찰 업무
// =======================================
gulp.task('watch', function() {
    gulp.watch( SRC + '/**/*.html', ['htmlSSI'] );
    gulp.watch( SRC + '/sass/**/*', ['sass']);
    gulp.watch( SRC + '/assets/js/**/*', ['js']);
    gulp.watch(SRC + '/assets/images/**/*', ['imagemin']);
    gulp.watch( SRC + '/**/*.html' ).on('change', reload);
    gulp.watch( 'gulpfile.js' ).on('change', reload);
 });

// =======================================
// 폴더 제거 업무
// =======================================
gulp.task('remove', shell.task('rm -rf ' + BUILD + ' ' + BUILD + '/assets/css/map '));

// =======================================
// 서버 업무
// =======================================
gulp.task('server', ['htmlSSI', 'sass', 'js', 'imagemin' ], function() {
    browserSync.init({
        // 알림 설정
        notify: !true,
        // 포트 설정
        port: 9090,
        // 서버 설정
        server: {
            // 기본 디렉토리 설정
            baseDir: [ BUILD ],
            // 라우트 설정
            routes: {
                '/bower_components' : 'bower_components',
            }
        },
    });
    gulp.start('watch');
 });

// =======================================
// HTML SSI(Server Side Include) 업무
// =======================================
// 로컬서버 설정하여 인크루드 사용
// [참고] https://www.npmjs.com/package/gulp-html-ssi
gulp.task('htmlSSI', function() {
    gulp.src( SRC + '/**/*.html' )
        .pipe( includer() )
        .pipe( gulp.dest( BUILD ) );
 });

// =======================================
// Sass 업무
// =======================================
gulp.task('sass', function() {
    return gulp.src( moveCSS )
        .pipe(sourcemaps.init())
        .pipe( sass({
            // 'outputStyle': 'compact'
            outputStyle: 'compact',
            includePaths: ['node_modules/susy/sass']
        }).on('error', sass.logError) )
        .pipe( sourcemaps.write( './map' ) )
        .pipe( gulp.dest(BUILD + '/assets/css') )
        .pipe( filter("**/*.css") )
        .pipe( reload({stream: true}) );
 });

gulp.task('css:min', function() {
    gulp.src( moveCSS )
        .pipe( csso() )
        .pipe( gulp.dest(BUILD + '/assets/css') );
 });

// =======================================
// JS 병합 업무
// =======================================
gulp.task('js', ['js:concat']);

// 공통 JS  파일 이동
gulp.task('js:moveJS', function() {
    gulp.src( moveJS )
        .pipe( gulp.dest( BUILD + '/assets/js') );
 });

// 공통 JS 파일 병합 후 이동
gulp.task('js:concat', ['js:moveJS'], function() {
    gulp.src( js_order )
        .pipe( concat('lib-jquery.js') )
        .pipe( g_if(compress.js, uglify()) )
        .pipe( g_if(compress.js, rename( 'lib-jquery.min.js' )) )
        .pipe( gulp.dest( BUILD + '/assets/js' ) );
 });

// =======================================
// Images min 업무
// =======================================
gulp.task('imagemin', function () {
    return gulp.src( SRC + '/assets/images/**/*' )
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe( gulp.dest( BUILD + '/assets/images' ) );
 });

// =======================================
// Iconfont 업무
// =======================================
gulp.task('iconfont', ['iconfont:make']);

gulp.task('iconfont:make', function(cb){
    iconic({
        // 템플릿 파일 경로 설정 (filename)
        // gulp-iconic/template/_iconfont.scss
        cssTemplate: SRC + '/sass/template/_iconfont.scss',
        // Scss 생성 파일 경로 설정
        cssFolder: SRC + '/sass/fonts',
        // Fonts 생성 파일 경로 설정
        fontFolder: SRC + '/iconfont/fonts',
        // SVG 파일 경로 설정
        svgFolder: SRC + '/iconfont/fonts_here',
        // Preview 생성 폴더 경로 설정
        previewFolder: SRC + '/iconfont/preview',
        // font 경로 설정
        fontUrl: '/assets/fonts',
        // 아이콘 베이스라인 위치 설정
        descent: 30
    }, cb);

    setTimeout(function() {
        gulp.start('iconfont:move');
    }, 1000);
 });

gulp.task('iconfont:move', function(){
    gulp.src(SRC + '/iconfont/fonts/*')
        .pipe( gulp.dest( BUILD + '/assets/fonts' ) );
 });

// =======================================
// web font 이동 업무
// =======================================

gulp.task('font:move', function(){
    gulp.src(SRC + '/assets/fonts/**/*')
        .pipe( gulp.dest( BUILD + '/assets/fonts' ) );
 });