const path = require('path');

/*================================== SETTINGS ===============================*/
const proj_name = "";
const built_folder = "";

const proj_path = "." + proj_name;
const built_path = proj_path + "/"+ built_folder;

const js_version = "es5";

const files_to_ssh = built_path + "/**/*";
const sshDir = '/var/www/html/';



const sshConfig = {
  host: '',
  port: 22,
  username: '',
  password: ''
};


const min_dir = proj_path + "/min";
const purify_css_html = built_path +"/**/*.html";

/*------------------------------------- HTML -------------------------------------*/
const pages_files = proj_path + "/*.html";
const pages_dest_dir = built_path;
const min_pages_dest_dir = min_dir;

const pages_watch = proj_path + "/**/*.html";
/*------------------------------------- CSS -------------------------------------*/
const scss_files = proj_path + "/scss/*.{scss,css}";
const css_dest_dir = built_path +"/css";
const min_css_dest_dir = min_dir + "/css";

const scss_watch = proj_path + "/scss/**/*.{scss,css}";
/*------------------------------------- JS -------------------------------------*/
const ts_files = proj_path + "/ts/*.{ts,js}";
const js_dest_dir = built_path +"/js";
const min_js_dest_dir = min_dir + "/js";

const ts_watch = proj_path + "/js/**/*.{js,ts}";
/*------------------------------------- IMG -------------------------------------*/
const img_files = proj_path + "/img/**/*";
const img_dest = built_path +"/img";
const min_img_dest = min_dir +"/img";

const img_watch = proj_path + "/img/**/*";
/*------------------------------------- FONTS -------------------------------------*/
const fonts_files = proj_path + "/fonts/**/*";
const fonts_dest = built_path +"/fonts";
const min_fonts_dest = min_dir +"/fonts";

const fonts_watch = proj_path + "/fonts/**/*";

/*======================================== PRESET ===============================*/
/* system */
const fs = require('fs');

/* global */
const { src, dest, parallel, task } = require('gulp');
const gwatch = require('gulp').watch;
const browSync = require('browser-sync').create();
const sourcemaps = require('gulp-sourcemaps');

/* css */
const sass = require('gulp-sass');
const cssbeautify = require('gulp-cssbeautify');
const autoprefixer = require('gulp-autoprefixer');
const sassGlob = require('gulp-sass-glob');
const cssPurify = require('gulp-purgecss');


/* js */
const ts = require('gulp-typescript');
const jsinclude = require('gulp-include')


/* html */
const fileinclude = require('gulp-file-include');

/*======================================== FUNCTIONS ===============================*/
function css() {
  let purify_files = [
        purify_css_html
  ];

  return src(scss_files)
    .pipe(sourcemaps.init())
    .pipe(sassGlob())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(cssbeautify())
    .pipe(sourcemaps.write('./maps'))
    .pipe(dest(css_dest_dir))
    .pipe(browSync.stream())        
}


function js() {
  return src(ts_files, { sourcemaps: true })
    .pipe(browSync.stream());
}

function pages(){
  return src(pages_files)
    .pipe(browSync.stream())
}


function img(){
  return src(img_files)
    .pipe(browSync.stream())
}

function fonts(){
  return src(fonts_files)
    .pipe(browSync.stream());
}


function compile_all() {
  css();
  js();
  pages();
  fonts();
  img();
}

function initBrowser() {
  browSync.init({
    port: 3000, 
    server: {
      baseDir: "./",
    },
  });
}

function watch() {
  gwatch(fonts_watch).on('change', browSync.reload);
  gwatch(img_watch).on('change', browSync.reload);
  gwatch(scss_watch, css);
  gwatch(ts_watch).on('change', browSync.reload);
  gwatch(pages_watch).on('change', browSync.reload);
}

function clean_all(){
  return src(built_path +"/*")
    .pipe(require('gulp-clean')());
}

function ssh_all() {
  const ssh = require('gulp-ssh');
  const gulpSSH = new ssh ({
    ignoreErrors: false,
    sshConfig: sshConfig
  });

  return src(files_to_ssh)
    .pipe(gulpSSH.dest(sshDir));
}

/*======================================== TASKS ===============================*/
task("start", function() { 
  return new Promise(function(resolve, reject) {
    console.log(pages_files);
    initBrowser()
    compile_all();
    watch();
    resolve();
  });
});
