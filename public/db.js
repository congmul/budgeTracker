let db;
// create a new db request for a "budget" database.
const request = window.indexedDB.open("budget", 1);

request.onupgradeneeded = function (event) {
  // create object store called "pending" and set autoIncrement to true
  db = event.target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function (event) {
  db = event.target.result;


  //navigator - browser function , it check if the browser is online or not.
  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function (event) {
  // log error here
  console.error("ERROR", request.error);
};

function saveRecord(record) {
  // create a transaction on the pending db with readwrite access
  // access your pending object store
  // add record to your store with add method.
  console.log(record);
  
  // const db = request.result;
  const transaction = db.transaction(["pending"], "readwrite");
  const pendingTransaction = transaction.objectStore("pending");

  pendingTransaction.add(record);

}

function checkDatabase() {
  // open a transaction on your pending db
  // access your pending object store
  // get all records from store and set to a variable
  const transaction = db.transaction(["pending"], "readwrite");
  const pendingTransaction = transaction.objectStore("pending");
  const getAllRequest = pendingTransaction.getAll();

  getAllRequest.onsuccess = function () {
    if (getAllRequest.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAllRequest.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then(() => {
          // if successful, open a transaction on your pending db
          // access your pending object store
          // clear all items in your store
          const transaction = db.transaction(["pending"], "readwrite");
          const pendingTransaction = transaction.objectStore("pending");
          pendingTransaction.clear();
        });
    }
  };
}

// listen for app coming back online
window.addEventListener('online', checkDatabase);
