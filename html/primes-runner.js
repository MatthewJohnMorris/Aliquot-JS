  // see https://primes.utm.edu/howmany.html
  // see http://www.umopit.ru/CompLab/primes32eng.htm
  //  1000000000 ok, should be 50847534 (11,314ms)
  //  2147483647 ?
  //  4294967291 ok, should be 203280221 (216,090ms)
  // 10000000000 not ok, should be 455052511 	 

importScripts('primes.js');

var top_num = 1000; // 1000000000; // 4294967291; // 2147483647; // 1000000000;
var cnt = 0;
var timeStart = new Date().getTime();

postMessage('initialising: top_num = ' + top_num);

var gen = new SoEPgClass();
var p = 1;
while ((p = gen.next()) <= top_num) {
  cnt++;
  if(cnt % 1000000 == 0) {
    var percent = Math.floor(100 * p / top_num);
    var elapsed = Math.floor(((new Date()).getTime() - timeStart) / 1000);
    var is_big = (2147483647 < gen.lowi*2);
    postMessage({is_big: is_big, lowi: gen.page_index_start, elapsed:elapsed, cnt:cnt, percent:percent, top_num:top_num, p:p});
  }
}
var percent = Math.floor(100 * p / top_num);
var elapsed = Math.floor(((new Date()).getTime() - timeStart) / 1000);
var is_big = (2147483647 < gen.lowi*2);
postMessage({is_big: is_big, lowi: gen.page_index_start, elapsed:elapsed, cnt:cnt, percent:percent, top_num:top_num, p:p});

dbDelete();
writeToDb();
var databaseName = "MyTestDatabase";

function writeToDb() {
  var request = indexedDB.open(databaseName, 1);
  request.onerror = function(event) {
    console.log("indexedDB.open error: " + event.target.error.name + ": " + event.target.error.message);
  };
  request.onsuccess = function(event) {
    db = event.target.result;
    console.log("created database '" + databaseName + "'");
    var transaction = db.transaction(["primes"], "readwrite");

    var primesArray = new Uint32Array(5);
    primesArray[0] = 2;
    primesArray[1] = 3;
    primesArray[2] = 5;
    primesArray[3] = 7;
    primesArray[4] = 11;
    var putReq = transaction.objectStore("primes").put(primesArray);
    putReq.onsuccess = function(event) {
      console.log("Put result: " + event.target.result);
    };

    console.log("stored data in database '" + databaseName + "'");

    var objectStore = db.transaction("primes").objectStore("primes");
    var customers = [];
    objectStore.openCursor().onsuccess = function(event) {
      var cursor = event.target.result;
      if (cursor) {
        customers.push(cursor.value);
        cursor.continue();
      }
      else {
        console.log("Got all customers: " + customers);
      }
    };
  };
  request.onupgradeneeded = function(event) { 
    var dbUpgrade = event.target.result;
    console.log("onupgradeneeded for database '" + databaseName + "'");

    // Create an objectStore for this database
    objStore = dbUpgrade.createObjectStore("primes", { autoIncrement : true });
    console.log("created objectStore for database '" + databaseName + "'");
  };
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

