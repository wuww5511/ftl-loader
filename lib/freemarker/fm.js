var spawn = require("child_process").spawn;
var mkdirp = require("mkdirp");
var path = require("path");
var fs = require("fs");


var path2fmpp = path.join(__dirname, "./libs/bin/fmpp" + (process.platform === 'win32' ? '.bat' : ''));


module.exports = function (options) {
    options = options || {};
    var staticTmp = options.tmp;

    return function render(filename, data, callback) {

        var sourceRoot = data.settings.views;


        //clean the data
        delete data.settings;
        delete data._locals;
        delete data.cache;

        var data = JSON.stringify(data);
        var dirname = staticTmp || path.dirname(filename);
        var rdname = randomname(),
            tname;

        var tname = path.join(dirname, randomname() + ".html");

        var args = [filename, "-D", data, "-o", tname, "-S", sourceRoot, "-E", "utf8"];
        var fmpp = spawn(path2fmpp, args, {})

        var errorMsg = "";


        fmpp.stdout.on('data', function (data) {
            errorMsg += data.toString();
        });

        fmpp.on('close', function (code) {
            if (
                errorMsg.indexOf(">>> ABORTED! <<<") > 0 
                || code !== 0 
                || errorMsg.indexOf("Failed") > 0
            ) {
                var isError = true;
                fs.exists(tname, function () {
                    fs.unlink(tname, function () {
                        callback(errorMsg || "uncatched freemarker parse Error occurs in " + filename)
                    })
                });
                
            }
            else {
                fs.readFile(tname, 'utf8', function (err, content) {
                    callback(err, content);
                    fs.unlink(tname, function () {});
                })
            }
        });

    }
}




function randomname() {
    return "tmp" + (+new Date);
}
