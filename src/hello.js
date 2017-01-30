function myFunction() {
    alert('blue');
}

function myFunction2() {
  s = 'index.html';
  s = '../html/index.html';
  s = './bin/farage.jpg';
  
  var xhr = new XMLHttpRequest(); 
  xhr.open("GET", s); 
  // although we can get the remote data directly into an arraybuffer using the string
  // "arraybuffer" assigned to responseType property. For the sake of example we are putting it
  // into a blob and then copying the blob data into an arraybuffer.
  xhr.responseType = "blob";

  console.log('OPENED', xhr.readyState);

  xhr.onprogress = function () {
      console.log('PROGRESS', xhr.readyState);
  };

  xhr.onload = function () {
      console.log('LOAD', xhr.readyState);
      analyze_data(xhr.response);
  };

  xhr.onloadstart = function (event) {
      console.log('LOADSTART', event, xhr.readyState);
  };

  xhr.onerror = function () {
      console.log('ERROR', xhr.readyState);
  };

  xhr.send();  
  alert('request sent for ' + s);
}

function analyze_data(blob)
{
    var myReader = new FileReader();
    myReader.readAsArrayBuffer(blob)
    
    myReader.addEventListener("loadend", function(e)
    {
        var buffer = e.target.result;//arraybuffer object
       alert('loading complete, length=' + buffer.byteLength);
    });
}



