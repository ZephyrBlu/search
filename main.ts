import {
  app,
  get,
  contentType,
} from "./deps.ts";
import {search} from "./search.ts";

import index from './data/indexes.json' assert {type: "json"};
import replays from './data/replays.json' assert {type: "json"};

app(
  get("/ping", () => [
    200,
    {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },,
    JSON.stringify({message: 'pong'}),
  ]),
  get("/search/:index", ({ params }) => search(params, index, replays)),
);
