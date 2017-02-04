var databaseName = "MyTestDatabase";
var db;
var objStore;

function dbOpen() {
  var request = indexedDB.open(databaseName, 1);
  request.onerror = function(event) {
    console.log("indexedDB.open error: " + event.target.error.name + ": " + event.target.error.message);
  };
  request.onsuccess = function(event) {
    db = event.target.result;
    console.log("created database '" + databaseName + "'");
  };
  request.onupgradeneeded = function(event) { 
    var dbUpgrade = event.target.result;
    console.log("onupgradeneeded for database '" + databaseName + "'");

    // Create an objectStore for this database
    objStore = dbUpgrade.createObjectStore("primes", { autoIncrement : true });
  };
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

