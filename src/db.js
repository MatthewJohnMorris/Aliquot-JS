var databaseName = "MyTestDatabase";
var db;
var dbPutsIssued = 0;
var dbPutsCompleted = 0;

function dbCreateOrOpen() {
  try {
    dbCreateOrOpenImpl();
  }
  catch(e) {
    console.log("Exception: " + e);
  }
}

function dbCreateOrOpenImpl() {
  var request = indexedDB.open(databaseName, 1);
  request.onerror = function(event) {
    console.log("indexedDB.open error: " + event.target.error.name + ": " + event.target.error.message);
  };
  setDefaultHandlers(request, "indexedDB.open(" + databaseName + ")");
  request.onsuccess = function(event) {
    db = event.target.result;
    dbPutsIssued = 0;
    dbPutsCompleted = 0;
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
  try {
    dbStoreImpl(resultsValues, resultsCount);
  }
  catch(e) {
    console.log("Exception: " + e);
  }
}

function dbStoreImpl(resultsValues, resultsCount) {
    var transactionPrimesValues = db.transaction(["primes.values"], "readwrite");
    var transactionPrimesCounts = db.transaction(["primes.counts"], "readwrite");
    var putReqValues = transactionPrimesValues.objectStore("primes.values").put(resultsValues);
    setDefaultHandlers(putReqValues, "primes.values.put(" + databaseName + ")");
    putReqValues.onsuccess = function(event) {
      dbPutsCompleted++;
      //   console.log("putReqValues result: " + event.target.result);
      if(dbPutsCompleted === dbPutsIssued) {
        console.log("Completed all puts: " + dbPutsIssued);
      }
    };
    putReqValues.onerror = function(event) {
      dbPutsCompleted++;
      console.log("putReqValues error: " + event.target.error.name + ": " + event.target.error.message);
      if(dbPutsCompleted === dbPutsIssued) {
        console.log("Completed all puts: " + dbPutsIssued);
      }
    };
    
    dbPutsIssued++;
    if(dbPutsIssued % 1000 === 0) {
      console.log("Issued " + dbPutsIssued + " putReqValues for database '" + databaseName + "'");
    }

    var putReqCount = transactionPrimesCounts.objectStore("primes.counts").put(resultsCount);
    setDefaultHandlers(putReqCount, "primes.counts.put(" + databaseName + ")");
    putReqCount.onsuccess = function(event) {
      dbPutsCompleted++;
      var id = event.target.result;
      if(id % 1000 === 0) {
        console.log("putReqCount result: " + event.target.result);
      }
      if(dbPutsCompleted === dbPutsIssued) {
        console.log("Completed all puts: " + dbPutsIssued);
      }
    };
    putReqCount.onerror = function(event) {
      dbPutsCompleted++;
      console.log("putReqCount error: " + event.target.error.name + ": " + event.target.error.message);
      if(dbPutsCompleted === dbPutsIssued) {
        console.log("Completed all puts: " + dbPutsIssued);
      }
    };
    // console.log("Issued putReqCount (" + resultsCount + ") for database '" + databaseName + "'");
    dbPutsIssued++;
    if(dbPutsIssued % 1000 === 0) {
      console.log("Issued " + dbPutsIssued + " putReqValues for database '" + databaseName + "'");
    }
}

function dbReport() {
  try {
    dbReportImpl();
  }
  catch(e) {
    console.log("Exception: " + e);
  }
}

function dbReportImpl() {
  var transactionPrimesCounts = db.transaction(["primes.counts"], "readonly");
  var objStorePrimesCounts = transactionPrimesCounts.objectStore("primes.counts");
  var total = 0;
  var i = 0;
  var reqCursor = objStorePrimesCounts.openCursor();
  setDefaultHandlers(reqCursor, "primes.counts.openCursor(" + databaseName + ")");
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
  console.log("Issued openCursor() for database '" + databaseName + "'");
}

function dbRead() {
  try {
    dbReadImpl();
  }
  catch(e) {
    console.log("Exception: " + e);
  }
}

function dbReadImpl() {
  var transactionPrimesCounts = db.transaction(["primes.counts"], "readonly");
  var objStorePrimesCounts = transactionPrimesCounts.objectStore("primes.counts");
  var total = 0;
  var i = 0;
  var reqCursor = objStorePrimesCounts.openCursor();
  setDefaultHandlers(reqCursor, "primes.counts.openCursor(" + databaseName + ")");
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
  console.log("Issued openCursor() for database '" + databaseName + "'");
}

function dbClose() {
  try {
    db.close();
    console.log("closed database '" + databaseName + "'");
  }
  catch(e) {
    console.log("Exception: " + e);
  }
}

function setDefaultHandlers(req, opDesc) {
  req.onsuccess = function () {
    console.log("onsuccess: " + opDesc);
  };
  req.onerror = function (event) {
    console.log("onerror: " + opDesc + event.target.error.name + ": " + event.target.error.message);
  };
  req.onblocked = function () {
    console.log("onblocked: " + opDesc);
  };
  req.oncomplete = function(event) {
    console.log("oncomplete: " + opDesc);
  }
  req.onabort = function(event) {
    console.log("onabort: " + opDesc);
  }
  req.onversionchange = function(event) {
    console.log("onversionchange: " + opDesc);
  }
  req.onclose = function(event) {
    console.log("onclose: " + opDesc);
  }
}

function dbDelete() {
  var req = indexedDB.deleteDatabase(databaseName);
  setDefaultHandlers(req, "deleteDatabase(" + databaseName + ")");
  console.log("Issued deleteDatabase() for database '" + databaseName + "'");
}

