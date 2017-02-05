# Aliquot-JS

Attempt to get a completely client-side JS version of the C# Aliquot program.

Initial hurdle was generating all 32-bit primes. There are 203,280,221 of these, about 0.75G of uncompressed storage (rendering down to about 0.14G on compression).

The paged sieve of GordonBeGood did at least enable this to happen - all primes in less than 40 seconds, happening on a Web Worker with primes sent back in chunks. Took a while to finally get it working on the unsigned 32-bit range, but hey.

IndexedDB on Firefox holds things happily enough - interestingly all the puts seem to queue up, so you've got another minute or so before they all dutifully shuffle into the database - but they can then be queried back happily.

(Incidentally, to try this out, do "Close DB", "Delete DB", "Open DB" then generate primes. Check out console window for write progress. Finally "Report On DB" once everything's in)

But I'm getting alarm bells. We've got the primes persisted, but we've still got the generation of Alqiuot DBs to go. Total persistent storage is on the order of a GB, which is fine for a desktop - but I'd like this to work on a tablet if possible. Given that's the domain I'm looking at, I'm increasingly getting the feeling that I'm forcing this down client-side JS's throat - that perhaps the better way to proceed is to have a server up, and leave the client-side JS to the interfacing, maybe also graph drawing.

I'll try loading the primes up in-process and see how we go.
