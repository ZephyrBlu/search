import {HEADERS} from './main.ts';

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function buildMatchupIdentifiers(params) {
  const races = params.m.toLowerCase().split(',').map(race => capitalize(race));
  races.sort();
  return races.map(race => ({
    race,
    identifier: `${race}-${races.join(',')}`,
  }));
}

export function matchupClusters(params, clusters) {
  if (!params.m) {
    return [
      400,
      HEADERS,
      JSON.stringify({message: 'No matchup parameter'}),
    ];
  }

  let matchupClusters = {};
  const matchupIdentifiers = buildMatchupIdentifiers(params);
  Object.entries(clusters).forEach(([build, cluster]) => {
    matchupIdentifiers.forEach(({ race, identifier }) => {
      if (identifier === build.split('__')[0]) {
        if (!matchupClusters[race]) {
          matchupClusters[race] = {
            total: 0,
            clusters: [],
          };
        }
        cluster.cluster.builds.sort((a, b) => b.total - a.total);
        matchupClusters[race].clusters.push(cluster);
        matchupClusters[race].total += cluster.total;

        matchupClusters[race].clusters[matchupClusters[race].clusters.length - 1].cluster.builds = cluster.cluster.builds.slice(0, 5);
        delete matchupClusters[race].clusters[matchupClusters[race].clusters.length - 1].matchup;
        delete matchupClusters[race].clusters[matchupClusters[race].clusters.length - 1].tree;
      }
    });
  });

  Object.values(matchupClusters).forEach((matchup) => {
    matchup.clusters.sort((a, b) => b.total - a.total);
    matchup.clusters = matchup.clusters.slice(0, 10);
  });

  return [
    200,
    HEADERS,
    JSON.stringify({results: matchupClusters}),
  ];
}

export function matchupTree(params, trees) {
  if (!params.m) {
    return [
      400,
      HEADERS,
      JSON.stringify({message: 'No matchup parameter'}),
    ];
  }

  let matchupTrees = {};
  const matchupIdentifiers = buildMatchupIdentifiers(params);
  matchupIdentifiers.forEach(({ race, identifier }) => {
    matchupTrees[race] = trees[identifier];
  }); 

  return [
    200,
    HEADERS,
    JSON.stringify({results: matchupTrees}),
  ];
}

function findOpponentRace(identifier: string, race: string) {
  const opponentRace = identifier
    .split('__')[0]
    .split('-')[1]
    .split(',')
    .find(identifierRace => identifierRace !== capitalize(race));
  return opponentRace || capitalize(race);
}

export function raceClusters(params, clusters) {
  if (!params.race) {
    return [
      400,
      HEADERS,
      JSON.stringify({message: 'No race parameter'}),
    ];
  }

  let raceClusters = {};
  const race = params.race;
  Object.entries(clusters).forEach(([build, cluster]) => {
    if (capitalize(race) === build.split('-')[0]) {
      const identifier = build.split('__')[0];
      const opponentRace = findOpponentRace(identifier, race);
      if (!raceClusters[opponentRace!]) {
        raceClusters[opponentRace!] = {
          total: 0,
          clusters: [],
        };
      }
      cluster.cluster.builds.sort((a, b) => b.total - a.total);
      raceClusters[opponentRace!].clusters.push(cluster);
      raceClusters[opponentRace!].total += cluster.total;

      raceClusters[opponentRace!].clusters[raceClusters[opponentRace!].clusters.length - 1].cluster.builds = cluster.cluster.builds.slice(0, 5);
      delete raceClusters[opponentRace!].clusters[raceClusters[opponentRace!].clusters.length - 1].matchup;
      delete raceClusters[opponentRace!].clusters[raceClusters[opponentRace!].clusters.length - 1].tree;
    }
  });

  Object.values(raceClusters).forEach((race) => {
    race.clusters.sort((a, b) => b.total - a.total);
    race.clusters = race.clusters.slice(0, 10);
  });

  return [
    200,
    HEADERS,
    JSON.stringify({results: raceClusters}),
  ];
}
export function raceTree(params, trees) {
  if (!params.race) {
    return [
      400,
      HEADERS,
      JSON.stringify({message: 'No race parameter'}),
    ];
  }

  let raceTrees = {};
  Object.entries(trees).forEach(([identifier, tree]) => {
    if (capitalize(params.race) === identifier.split('-')[0]) {
      const opponentRace = findOpponentRace(identifier, params.race);
      raceTrees[opponentRace!] = tree;
    }
  });

  return [
    200,
    HEADERS,
    JSON.stringify({results: raceTrees}),
  ];
}
