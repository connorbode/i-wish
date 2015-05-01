var onDoc = function (doc) {
  numDocs += 1;
  var tweet = doc.tweet.toLowerCase();
  var match = tweet.match(/i wish [a-z ]*/);

  if (match) {
    var split = match[0].split(' ');
    var currentTrie = trie;
    split.forEach(function (word) {
      if (!currentTrie[word])
        currentTrie[word] = { count: 1, next: {} };
      else
        currentTrie[word].count += 1;
      currentTrie = currentTrie[word].next;
    });
    if (numDocs > docLimit) {
      onEndOfDocs();
    }
  }
};