import {contentType} from "./deps.ts";

export function search(params, indexes, replays) {
  if (!params.q) {
    return [
      400,
      contentType("json"),
      JSON.stringify({message: 'No search parameter'}),
    ];
  }

  if (!['race', 'player', 'map', 'all'].includes(params.index)) {
    return [
      400,
      contentType("json"),
      JSON.stringify({message: `No such index: ${params.index}`}),
    ];
  }

  const query = params.q;
  const isMirror = params.index === 'race' && params.mirror;
  const sortedSearchTerms = query.split(' ');
  sortedSearchTerms.sort();

  // get list of keys for each index category, then search index
  const rawPostingLists = sortedSearchTerms.map((term) => {
    let indexesToSearch: string[] = [];
    if (params.index !== 'all') {
      indexesToSearch.push(params.index);
    } else {
      indexesToSearch.push('race', 'player', 'map');
    }

    // find the keys in the index that contain the search term
    const replayReferences = new Set();
    indexesToSearch.forEach((indexName) => {
      const index = indexes[indexName];
      Object.entries(index).forEach(([key, references]) => {
        if (key.includes(term)) {
          references.forEach(r => replayReferences.add(r));
        }
      });
    });

    return Array.from(replayReferences);
  });

  // https://stackoverflow.com/a/1885569
  // progressively applying this intersection logic to each search term results, creates intersection of all terms
  // this is likely the most computationally intensive part of the search
  const postingList = rawPostingLists.reduce((current, next) => {
    return current.filter(value => next.includes(value))
  }, rawPostingLists[0]);
  let results = postingList.map(reference => replays[reference]);

  if (isMirror) {
    const race = sortedSearchTerms[0];
    results = results.filter((replay) => (
      replay.players.every(player => compare(player.race, race))
    ));
  }

  results.sort((a, b) => b.played_at - a.played_at);

  return [
    200,
    contentType("json"),
    JSON.stringify({results: results.slice(0, 100)}),
  ];
}

function compare(a: string, b: string) {
  return a.toLowerCase() === b.toLowerCase();
}
