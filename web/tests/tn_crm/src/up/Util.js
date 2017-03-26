function Util() {
	this.intervals = [];
	this.setInterval = function(cb, period) {
		util.intervals.push( window.setInterval(cb, period) );
	}
	this.clearIntervals	= function(){
		util.intervals = [];
	};

	// TODO: check use cases, maybe dont need
	// http://stackoverflow.com/a/728694
	this.clone = function(obj) {
	    var copy;

	    // Handle the 3 simple types, and null or undefined
	    if (null == obj || "object" != typeof obj) return obj;

	    // Handle Date
	    if (obj instanceof Date) {
	        copy = new Date();
	        copy.setTime(obj.getTime());
	        return copy;
	    }

	    // Handle Array
	    if (obj instanceof Array) {
	        copy = [];
	        for (var i = 0, len = obj.length; i < len; i++) {
	            copy[i] = this.clone(obj[i]);
	        }
	        return copy;
	    }

	    // Handle Object
	    if (obj instanceof Object) {
	        copy = {};
	        for (var attr in obj) {
	            if (obj.hasOwnProperty(attr)) copy[attr] = this.clone(obj[attr]);
	        }
	        return copy;
	    }
	    throw new Error("Unable to copy obj! Its type isn't supported.");
	},

	this.groupBy = function(collection, property) {
	    var i = 0, val, index,
	        values = [], result = [];
	    for (; i < collection.length; i++) {
	        val = collection[i][property];
	        index = values.indexOf(val);
	        if (index > -1)
	            result[index].push(collection[i]);
	        else {
	            values.push(val);
	            result.push([collection[i]]);
	        }
	    }
	    return result;
	}
}