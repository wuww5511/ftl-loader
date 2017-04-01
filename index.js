var loaderUtils = require('loader-utils');
var getRender = require('./lib/freemarker');
var superagent = require('superagent');

module.exports = function (source) {
    var callback = this.async();
    var options = loaderUtils.getOptions(this);
    
    var render = getRender(options.root);
  
    var getdata = null;
    var headers = options.headers || {}
    
    if(typeof options.data == 'object') {
        getdata = new Promise(resolve => {
            resolve(options.data);
        })  
    }
    else if(typeof options.data == 'string') {
        getdata = new Promise((resolve, reject) => {
            superagent.get(options.data).set(headers).end((err, res) =>{
                
                if(err) {
                    reject(err);
                }
                else
                    resolve(JSON.parse(res.text))
            })
        })
    }
    else if(typeof options.data == 'function') {
        getdata = new Promise((resolve, reject) => {
            var res = options.data({
                path: this.resourcePath
            });
            
            if(typeof res == 'string') {
                superagent.get(res).set(headers).end((err, res) =>{
                    if(err)
                        reject(err)
                    else
                        resolve(JSON.parse(res.text))
                })
            }
            else
                resolve(res)
        })
    }
    
    getdata.then(data => {
        
        render._$render(this.resourcePath, data, function (err, content) {
            callback(null, `module.exports = ${JSON.stringify(err || content)}`);
        });
    }).catch(error => {
        render._$render(this.resourcePath, {}, function (err, content) {
            callback(null, `module.exports = ${JSON.stringify(error.message || "error")}`);
        });
    })
  
    
    
}