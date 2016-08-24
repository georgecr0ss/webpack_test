// var fs = require('fs');

// function readFiles(dirname, onFileContent, onError) {
//   fs.readdir(dirname, function(err, filenames) {
//     if (err) {
//       onError(err);
//       return;
//     }
//     filenames.forEach(function(filename) {
//       fs.readFile(dirname + filename, 'utf-8', function(err, content) {
//         if (err) {
//           onError(err);
//           return;
//         }
//         onFileContent(filename, content);
//       });
//     });
//   });
// }

// var data = {};
// readFiles('./css/', function(filename, content) {
//   data[filename] = content;
//   console.log(filename);
// }, function(err) {
//   throw err;
// });

function walkSync(currentDirPath, callback) {
    var fs = require('fs'),
        path = require('path');
    fs.readdirSync(currentDirPath).forEach(function (name) {
        var filePath = path.join(currentDirPath, name);
        var name = name;
        var stat = fs.statSync(filePath);
        if (stat.isFile()) {
            callback(name, stat);
        } else if (stat.isDirectory()) {
            walkSync(name, callback);
        }
    });
}

var files = [];
 walkSync('./css/', function(filePath, stat) {
    // do something with "filePath"...
    // 
    // console.log(filePath);
    // 
    files.push(filePath.replace('\\', '/'));
    // return filePath;
});

// console.log(files);
var obj = {};
for(var i in files) {
  var name = files[i].replace('.css', '');
  obj[name] = './css/' + files[i];
}

console.log(obj);