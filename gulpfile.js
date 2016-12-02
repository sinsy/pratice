var assetPath = './src/';
var gulp = require('gulp'),
  browserSync = require('browser-sync');
/*js*/
var assetPath = './scripts';
var outputPath = './output';
gulp.task(bs);
function bs() {
    browserSync({ 
      // proxy: 'http://localhost:8080/zhibei2/web/src/' //利用tomcat或其他服务器
      server: { //browsersync内置
        baseDir: "./"
      }
    });
    gulp.watch(['./**']).on('change', gulp.series(
        browserSync.reload
        ));
}
