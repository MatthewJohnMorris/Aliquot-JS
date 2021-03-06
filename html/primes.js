var SoEPgClass = (function ()
  {
    function SoEPgClass()
    {
      // How far are we along the current page?
      this.page_index = -1;

      // Index at start of current page
      this.page_index_start = 0;

      // Some tests on generating primes up to 10,000,000,000
      // 32768 -> 90s
      // 16384 -> 91s
      //  8192 -> 91s
      //  4096 -> 97s
      //  2048 -> 107s
      this.page_slots = 8192;

      // We only consider odd numbers (hence the factor of 2)
      // We're using a bitwise index on 32-bit numbers (hence the factor of 32)
      // We're limited to 32 bits because Javascript.
      this.page_size = 2 * 32 * this.page_slots;

      // Generated primes from our base stream - use for page culling
      this.base_primes = [];
    }
                  
    SoEPgClass.prototype.get_sq_start_index = function(p)
    {
      // get index for s      
      var s = (p * p - 3) / 2;

      if (s >= this.page_index_start)
      {
        // if s is in this page, get page-relative index by simply subtracting page lower limit
        s -= this.page_index_start;
      }
      else
      {
        // otherwise, adjust for s in relation to page lower limit
        var r = (this.page_index_start - s) % p;
        s = (r != 0) ? p - r : 0;
      }
      return s;
    }


    // This is the heart of our primes generation - more than 50% of runtime
    // is spent here.                 
    SoEPgClass.prototype.cull = function (start, p)
    {
      // Our representation automatically skips multiples of 2
      // So to go for the next multiple of p, we only need to move by p, not 2*p
      for (var j = start; j < this.page_size; j += p)
      {
        this.buf[j >> 5] |= 1 << (j & 31);
      }
    }
                  
    SoEPgClass.prototype.cull_prime = function (p)
    {
      this.cull(this.get_sq_start_index(p), p);
    }
                  
    SoEPgClass.prototype.is_composite = function(x)
    {
      return this.buf[x >> 5] & (1 << (x & 31));
    }
                  
    SoEPgClass.prototype.init_buf = function()
    {
      this.buf = new Array(this.page_slots); 
      for(var i = 0; i < this.page_slots; i++)
      {
        this.buf[i] = 0;
      }
    }

    SoEPgClass.prototype.init_zeroth_page = function(nxt)
    {
      // Special culling for first page as no base primes yet
      // The value for i is p = 3 + (i * 2)
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
      // If this is the first page after the zero one
      if (!this.base_primes.length)
      {
        // Initialise a generator of base primes - another instance of this class!
        // Our generator will know about all primes up to 131072 without having to
        // spawn its own generator, so it's not *quite* turtles all the way down.
        // The first next() moves past 2, which we don't want.
        // The second next() yields 3, which we do want to keep.
        this.prime_stream = new SoEPgClass();
        this.prime_stream.next();
        this.base_primes.push(this.prime_stream.next());
      }

      // Get enough base primes for the page range.
      // We don't need to worry about any primes > sqrt(nxt) for primality testing purposes.
      var p1 = this.base_primes[this.base_primes.length - 1];
      while(p1 * p1 < nxt)
      {
        p1 = this.prime_stream.next();
        this.base_primes.push(p1);
      }

      // Cull all our primes from our new page.
      for (var i = 0; i < this.base_primes.length; i++)
      {
        var p = this.base_primes[i];
        this.cull_prime(p);
      }
    }

    SoEPgClass.prototype.init_page = function()
    {
      // Get the number just beyond the current page.
      var nxt = 3 + 2 * (this.page_index_start + this.page_size);

      // Initialise our new page.
      this.init_buf();
      if (this.page_index_start <= 0)
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
      // Special case - get 2 out of the way before our paging system kicks in.
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
            var next_prime = 3 + ((this.page_index_start + this.page_index) * 2);
            this.page_index++;
            return next_prime;
          }
          this.page_index++;
        }
                  
        // beyond buffer range: advance buffer
        this.page_index = 0;
        this.page_index_start += this.page_size;
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

