
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
 walkSync('./js/', function(filePath, stat) { 
    files.push(filePath.replace('\\', '/')); 
});

// console.log(files);
var obj = {};
for(var i in files) {
  var name = files[i].replace('.js', '');
  obj[name] = './js/' + files[i];
}

module.exports = { 
	entry: obj,
	output: {
		filename: "[name].min.js"
	},
	watch:true
}