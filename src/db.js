var databaseName = "MyTestDatabase";
var db;

function dbCreateOrOpen() {
  var request = indexedDB.open(databaseName, 1);
  request.onerror = function(event) {
    console.log("indexedDB.open error: " + event.target.error.name + ": " + event.target.error.message);
  };
  request.onsuccess = function(event) {
    db = event.target.result;
    console.log("opened database '" + databaseName + "'");
  };
  request.onupgradeneeded = function(event) { 
    var dbUpgrade = event.target.result;
    dbUpgrade.createObjectStore("primes.values", { autoIncrement : true });
    dbUpgrade.createObjectStore("primes.counts", { autoIncrement : true });
    console.log("onupgradeneeded for database '" + databaseName + "'");
  };
}

function dbStore(resultsValues, resultsCount) {

    var transactionPrimesValues = db.transaction(["primes.values"], "readwrite");
    var transactionPrimesCounts = db.transaction(["primes.counts"], "readwrite");

    var putReqValues = transactionPrimesValues.objectStore("primes.values").put(resultsValues);
    putReqValues.onsuccess = function(event) {
      //   console.log("putReqValues result: " + event.target.result);
    };
    putReqValues.onerror = function(event) {
      console.log("putReqValues error: " + event.target.error.name + ": " + event.target.error.message);
    };
    // console.log("Issued putReqValues for database '" + databaseName + "'");

    var putReqCount = transactionPrimesCounts.objectStore("primes.counts").put(resultsCount);
    putReqCount.onsuccess = function(event) {
      var id = event.target.result;
      if(id % 1000 === 0) {
        console.log("putReqCount result: " + event.target.result);
      }
    };
    putReqCount.onerror = function(event) {
      console.log("putReqCount error: " + event.target.error.name + ": " + event.target.error.message);
    };
    // console.log("Issued putReqCount (" + resultsCount + ") for database '" + databaseName + "'");
}

function dbReport() {
  var transactionPrimesCounts = db.transaction(["primes.counts"], "readonly");
  var objStorePrimesCounts = transactionPrimesCounts.objectStore("primes.counts");
  var total = 0;
  var i = 0;
  var reqCursor = objStorePrimesCounts.openCursor();
  reqCursor.onsuccess = function(event) {
    var cursor = reqCursor.result || event.result || event.target.result;
    if (cursor) {
      total += cursor.value;
      if(i % 1000 === 0) {
        console.log("After " + i + ": total=" + total);
      }
      i++;
      cursor.continue();
    }
    else {
      console.log("Cursors: " + i + ", Total: " + total);
    }
  };
  reqCursor.onerror = function(event) {
    console.log("Cursor error: " + event.target.error.name + ": " + event.target.error.message);
  };
  reqCursor.oncomplete = function(event) {
    console.log("Cursor oncomplete");
  }
  reqCursor.onabort = function(event) {
    console.log("Cursor onabort"); 
  }
  reqCursor.onblocked = function(event) {
    console.log("Cursor onblocked");
  }
  reqCursor.onversionchange = function(event) {
    console.log("Cursor onversionchange");
  }
  reqCursor.onclose = function(event) {
    console.log("Cursor onclose");
  }
  console.log("Issued openCursor() for database '" + databaseName + "'");
}

function dbClose() {
  db.close();
  console.log("closed database '" + databaseName + "'");
}

function dbDelete() {
  var req = indexedDB.deleteDatabase(databaseName);
  req.onsuccess = function () {
    console.log("Deleted database  '" + databaseName + "' successfully");
  };
  req.onerror = function () {
    console.log("Couldn't delete database '" + databaseName + "'");
  };
  req.onblocked = function () {
    console.log("Couldn't delete database '" + databaseName + "' due to the operation being blocked");
  };
}

