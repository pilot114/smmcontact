function Debugger() {

    this.start = Date.now();
    // https://developers.google.com/web/tools/chrome-devtools/console/console-reference
    this.c = window.console;
    // clear all prev vk console output
    this.c.clear();

    this.time = function(eventName){
        this.c.log("* " + eventName + ":", (Date.now()-this.start)/1000 + ' sec' );
    }
    this.interval = function(name, args, cb){
        this.c.time(name);
        cb(args);
        this.c.timeEnd(name);
    }

    this.group = function(title, arr, collapsed){
        if (collapsed) {
            console.groupCollapsed(title);
        } else {
            console.group(title);
        }
        for (var i = 0; i < arr.length; i++) {
            console.log(arr[i]);
            // MAYBE TODO: with formatting
            // console.log("Authenticating user '%s'", user);
        }
        console.groupEnd();
    }

    /*
        %s - string
        %i - integer
        %f - float
        %o - DOM element
        %O - JS object
        %c - apply CSS rules
    */
    this.log = function(data) {
        if (typeof data === 'object') {
            this.c.log("%O", data);
        } else {
            this.c.log(data);
        }
    }
    this.color = function(data) {
        this.c.log('%c ' + data, 'background: #222; color: #bada55');
    }

    // this.c.log("error");
    // this.c.info("info");
    // this.c.warn("warn");
    // this.c.error("error");

    // this.time("test array init", [1000000], function(args){
    //     var array = new Array(args[0]);
    //     for (var i = 0; i <= args[0]; i++) {
    //         array[i] = new Object();
    //     }
    // });
}