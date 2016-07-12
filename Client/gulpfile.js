var gulp = require('gulp')
var babel= require('gulp-babel')
var spawn = require('child_process').spawn

var children = []

var filesToCompile = [
  './middleware/*.js',
  './routes/*.js',
  './src/index.js',
  './app.js',
  './bin/www',
  './config/*.js'
]
var otherFiles = [
  './views/**/*.ejs',
  './public/**/*'
]

var allFiles = filesToCompile.concat(otherFiles)


gulp.task('spy', ['build', 'copy', 'reload', 'watch'])

gulp.task('watch', ['build'], function(){
  gulp.watch(allFiles, ['build', 'copy', 'reload'] )
})


gulp.task('build', function(cb){
  while(children.length != 0){
    children.pop().kill()
  }

  // build js files with babel
  gulp.src(filesToCompile, { base: './' })
    .pipe(babel())
    .pipe(gulp.dest('dist'))
    .on('end', cb)

})

gulp.task('copy', ['build'], function(cb){
  //Copy view files
  gulp.src(otherFiles, { base: './' }) 
    .pipe(gulp.dest('dist'))
    .on('end', cb)
})

gulp.task('reload', ['copy'], function(){
  
  // If no child processes exist, make a new one
  if(children.length === 0){
    children.push ( startProcess() )
  }
  else {
    console.log('Killing previous process.')
    children.pop().kill()
    children.push ( startProcess() )
  }
})

function startProcess(){
  var proc = spawn('node', ['dist/bin/www'])

  proc.stdout.on('data', function(data){
    console.log('stdout:', data.toString())
  })
  
  proc.stderr.on('data', function(data){
    console.log('stderr:', data.toString())
  })

  return proc
  
}

process.on('SIGINT', function(){
  while(children.length != 0){
    children.pop().kill()
  }
  process.exit()
})
