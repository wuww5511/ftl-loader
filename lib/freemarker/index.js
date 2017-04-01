"use strict"

var _ftl = require('./fm');


class View {
    constructor (_opts) {
        
        this.__render = _ftl();
        
        this.__source = _opts.source;
        
    }
    
    _$render (_file, _data, _cb) {
        
        _data.settings = {
            views: this.__source
        }
        
        
        
        this.__render(_file, _data, _cb);
    }
}

function _getView (_source) {
    return new View({
        source: _source
    });
}

module.exports = _getView;