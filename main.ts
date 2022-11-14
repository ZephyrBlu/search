import {
  app,
  get,
  contentType,
} from "https://denopkg.com/syumai/dinatra/mod.ts";
import {search} from "./search.ts";

import index from './data/indexes.json' assert {type: "json"};
import replays from './data/replays.json' assert {type: "json"};

app(
  get("/ping", () => [
    200,
    contentType("json"),
    JSON.stringify({message: 'pong'}),
  ]),
  get("/search/:index", ({ params }) => search(params, index, replays)),
);
