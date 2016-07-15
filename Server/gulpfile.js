var gulp = require('gulp')
var babel= require('gulp-babel')
var spawn = require('child_process').spawn

var children = []


gulp.task('spy', ['build', 'watch', 'reload'])

gulp.task('watch', ['build'], function(){
  gulp.watch(files, ['build', 'reload'] )
})

var files = [
  './api/**/*.js',
  './config/*.js',
  './methods/*.js',
  './Models/*.js',
  './Schemas/*.js',
  './Utils/*.js',
  './tests/**/*.js',
  './app.js'
]
gulp.task('build', function(cb){
  while(children.length != 0){
    children.pop().kill()
  }

  gulp.src(files, { base: './' })
    .pipe(babel())
    .pipe(gulp.dest('dist'))
    .on('end', cb)

})

gulp.task('reload', ['build'], function(){
  
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
  var proc = spawn('node', ['dist/app.js'])

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
