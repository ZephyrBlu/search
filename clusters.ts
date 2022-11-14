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
