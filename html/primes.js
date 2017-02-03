var SoEPgClass = (function ()
  {
    function SoEPgClass()
    {
      this.page_index = -1; // constructor resets the enumeration to start...
      this.page_size = 131072; // 131072 = 2 * 32 * 2048;
      this.lowi = 0; // other initialization done here...
      this.found_primes = [];
      this.fast = 1;
    }
                  
    SoEPgClass.prototype.get_sq_start_index = function(p)
    {
      // Not getting this bit!
      // next() has 3 + 2 * (lowi, page_size)
      // s is aparently intended to be in index space
      // via s = (p*p - 3) / 2
      // but then it's modularised by p, also p is added to it in "cull()"
      
      var s = (p * p - 3) / 2; // compute the start index of the prime squared
      if (s >= this.lowi) // adjust start index based on page lower limit...
      {
        s -= this.lowi;
      }
      else
      {
        // for the case where this isn't the first prime squared instance
        var r = (this.lowi - s) % p;
        s = (r != 0) ? p - r : 0;
      }
      return s;
    }
                  
    SoEPgClass.prototype.cull = function (start, p)
    {
      for (var j = start; j < this.page_size; j += p)
      {
        // var j_div_32 = Math.floor(j / 32);
        // var j_div_32 = ~~(j/32);
        // var j_mod_32 = j % 32;
        // this.buf[j_div_32] |= 1 << j_mod_32;
        this.buf[j >> 5] |= 1 << (j & 31);
      }
    }
                  
    SoEPgClass.prototype.cull_prime = function (p)
    {
      this.cull(this.get_sq_start_index(p), p);
    }
                  
    SoEPgClass.prototype.is_composite = function(x)
    {
      // var j_div_32 = Math.floor(x / 32);
      // var j_div_32 = ~~(x/32);
      // var j_mod_32 = x % 32;
      // return this.buf[j_div_32] & 1 << j_mod_32;
      return this.buf[x >> 5] & (1 << (x & 31));
    }
                  
    SoEPgClass.prototype.init_buf = function()
    {
      this.buf = [];
      for (var i = 0; i < 2048; i++)
      {
        this.buf.push(0);
      }
    }

    SoEPgClass.prototype.init_zeroth_page = function(nxt)
    {
      // special culling for first page as no base primes yet:
      for (var i = 0, p = 3, sqr = 9; sqr < nxt; i++, p += 2, sqr = p * p)
      {
        if(this.is_composite(i) === 0)
        {
          this.cull_prime(p);
        }
      }
    }

    SoEPgClass.prototype.init_normal_page = function(nxt)
    {
      if (!this.found_primes.length)
      {
        // if this is the first page after the zero one:
        this.prime_stream = new SoEPgClass(); // initialize separate base primes stream:
        this.prime_stream.next(); // advance past the only even prime of 2
        this.found_primes.push(this.prime_stream.next()); // keep the next prime (3 in this case)
      }
      // get enough base primes for the page range...
      var p1 = this.found_primes[this.found_primes.length - 1];
      while(p1 * p1 < nxt)
      {
        p1 = this.prime_stream.next();
        this.found_primes.push(p1);
      }
      for (var i = 0; i < this.found_primes.length; i++)
      {
        // for each base prime in the array
        var p = this.found_primes[i];
        this.cull_prime(p);
      }
    }

    SoEPgClass.prototype.init_page = function()
    {
      // bi must be zero:
      var nxt = 3 + 2 * (this.lowi + this.page_size); //just beyond the current page
      this.init_buf();
      if (this.lowi <= 0)
      {
        this.init_zeroth_page(nxt);
      }
      else
      {
        this.init_normal_page(nxt);
      }
    }
                  
    SoEPgClass.prototype.next = function ()
    {
      if (this.page_index < 0)
      {
        this.page_index = 0;
        return 2;
      }
                  
      while(1)
      {
        if (this.page_index === 0)
        {
          this.init_page();
        }
                  
        // find next marker still with prime status
        while (this.page_index < this.page_size)
        {
          if(this.is_composite(this.page_index) === 0)
          {
            var next_prime = 3 + ((this.lowi + this.page_index) * 2);
            this.page_index++;
            return next_prime;
          }
          this.page_index++;
        }
                  
        // beyond buffer range: advance buffer
        this.page_index = 0;
        this.lowi += this.page_size;
      }
    };
                  
    return SoEPgClass;
  }
  )();

function calc_primes()
{
  console.log('start');
  var elpsd = -new Date().getTime();
  // see https://primes.utm.edu/howmany.html
  // see http://www.umopit.ru/CompLab/primes32eng.htm
  //  1000000000 ok, should be 50847534 (11,314ms)
  //  2147483647 ?
  //  4294967291 ok, should be 203280221 (216,090ms)
  // 10000000000 not ok, should be 455052511 	 
  var top_num = 1000000000; // 4294967291; // 2147483647; // 1000000000;
  var cnt = 0;
  for(var i = 0; i < 64; i++)
  {
    var j = i >> 5;
    var k = i / 32;
    var l = Math.floor(i / 32);
    console.log(i.toString() + '->' + j.toString() + '->' + l.toString());
  }
  var gen = new SoEPgClass();
  while (gen.next() <= top_num) cnt++;
  elpsd += (new Date()).getTime();
  var maxSafe = Number.MAX_SAFE_INTEGER;
  document.getElementById('calc-primes-result').innerText = 
    'Found ' + cnt + ' primes up to ' + top_num + ' in ' + elpsd + ' milliseconds.';
};

