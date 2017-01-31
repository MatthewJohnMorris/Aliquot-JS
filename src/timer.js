class Timer {
  static start(updater) {
    if(typeof(Worker) == "undefined") {
      Timer.timerUpdate(targetName, "Sorry! No Web Worker support.");
      return;
    }
    return new Timer(updater);
  }

  static stop(x) {
    if(typeof(x) == "undefined") {
      return;
    }  
    x.minion.terminate();
  } 

  constructor(funcUpdater) {
    this.updater = funcUpdater;
    this.minion = Timer.createTimer();
    this.minion.onmessage = function(event) {
      funcUpdater(event.data);
    };   
  }

  static createTimer() {
    // "Server response", used in all examples
    var response = "var i = 0; function timedCount() { i = i + 1; postMessage(i); setTimeout('timedCount()',500); } timedCount();";

    var blob;
    try {
      blob = new Blob([response], {type: 'application/javascript'});
    } catch (e) { // Backwards-compatibility
      window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
      blob = new BlobBuilder();
      blob.append(response);
      blob = blob.getBlob();
    }
    // URL.createObjectURL
    window.URL = window.URL || window.webkitURL;
    return new Worker(URL.createObjectURL(blob));
  }
}

