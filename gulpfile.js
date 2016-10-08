var assetPath = './src/';
var gulp = require('gulp'),
  browserSync = require('browser-sync');

gulp.task(bs);
function bs() {
    browserSync({ 
      // proxy: 'http://localhost:8080/zhibei2/web/src/' //利用tomcat或其他服务器
      server: { //browsersync内置
        baseDir: "./"
      }
    });
    // gulp.watch(['./src/precss/*.css','./src/precss/part/*.css', './src/prejs/*.js']).on('change', gulp.series(
    //     css, js, browserSync.reload
    //     ));
}

