  // see https://primes.utm.edu/howmany.html
  // see http://www.umopit.ru/CompLab/primes32eng.htm
  //  1000000000 ok, should be 50847534 (11,314ms)
  //  2147483647 ?
  //  4294967291 ok, should be 203280221 (216,090ms)
  // 10000000000 not ok, should be 455052511 	 

importScripts('primes.js');

var top_num = 4294967291; // 1000000000; // 4294967291; // 2147483647; // 1000000000;
var cnt = 0;
var timeStart = new Date().getTime();

postMessage('initialising: top_num = ' + top_num);

var gen = new SoEPgClass();
var p = 1;
while ((p = gen.next()) <= top_num) {
  cnt++;
  if(cnt % 100000 == 0) {
    var percent = Math.floor(100 * p / top_num);
    var elapsed = Math.floor(((new Date()).getTime() - timeStart) / 1000);
    var is_big = (2147483647 < gen.lowi*2);
    postMessage({is_big: is_big, lowi: gen.lowi, elapsed:elapsed, cnt:cnt, percent:percent, top_num:top_num, p:p});
  }
}
var percent = Math.floor(100 * p / top_num);
var elapsed = Math.floor(((new Date()).getTime() - timeStart) / 1000);
var is_big = (2147483647 < gen.lowi*2);
postMessage({is_big: is_big, lowi: gen.lowi, elapsed:elapsed, cnt:cnt, percent:percent, top_num:top_num, p:p});

