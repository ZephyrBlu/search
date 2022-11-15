import {
  app,
  get,
} from "./deps.ts";
import {search} from "./search.ts";
import {matchupClusters, matchupTree, raceClusters, raceTree} from "./clusters.ts";

import index from './data/indexes.json' assert {type: "json"};
import replays from './data/replays.json' assert {type: "json"};
import trees from './data/build_tree.json' assert {type: "json"};
import clusters from './data/clusters.json' assert {type: "json"};

export const HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

app(
  get("/ping", () => [
    200,
    HEADERS,
    JSON.stringify({message: 'pong'}),
  ]),
  get("/search/:index", ({ params }) => search(params, index, {...replays})),
  get("/clusters", ({ params }) => matchupClusters(params, {...clusters})),
  get("/clusters/:race", ({ params }) => raceClusters(params, {...clusters})),
  get("/tree", ({ params }) => matchupTree(params, {...trees})),
  get("/trees/:race", ({ params }) => raceTree(params, {...trees})),
);
