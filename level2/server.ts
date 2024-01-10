import * as setupEnv from "app/setup/environment";
import express, { Request, Response } from "express";
import { createClient } from "redis";
import * as setupExpress from "app/setup/express";
import * as jsonHelper from "app/helpers/json";
import { RedisJSON } from "@redis/json/dist/commands";
import { Log } from "app/types/log";
import { compute } from "lib/slowComputation";

setupEnv.setupEnvironment();

// Setup Express
const server = express();
// Define or retrieve the proper port on which the server is allowed to listen
const port = process.env.HTTP_SERVER_PORT || 3000;
// Define a dedicated folder path where all incoming requests' payloads are pushed to as files
const directoryPath = process.env.LOG_FOLDER || "parsed";
// Define default Redis client handler and base key
const redisCli = createClient();
const redisBaseKey = process.env.REDIS_LIST || "log";
// Incoming requests counter (access from the /stat route)
let incomingCounter = 0;

// Setup Redis
redisCli.on("ready", () => console.log("Redis is up and running!"));
redisCli.on("error", (err) => console.log("Redis Client Error", err));
await redisCli.connect();

setupExpress.initMiddlewares(server);
setupExpress.fire(server, port);

// Define a POST route matching the one defined in httpEmitter.ts
server.post("/", async (req: Request, res: Response) => {
  try {
    incomingCounter++;
    const formatted = jsonHelper.toJSONformat(req.body.log);
    const parsed = jsonHelper.parseJSON<Log>(formatted);
    const computed = await compute<Log>(parsed);
    const redisKey = `${redisBaseKey}:${parsed.id}`;
    await redisCli.json.set(redisKey, "$", computed as unknown as RedisJSON);
    res.end(); // status 200 OK
  } catch (e: any) {
    console.log(`Error ${e.code}: ${e.message}`);
    res.status(500).end(); // Internal Server Error
  }
});

server.get("/list", async (req: Request, res: Response) => {
  const results = await redisCli.keys(`${redisBaseKey}:*`);
  for (const result of results) {
    const log = await redisCli.json.get(result);
    console.log(log);
  }
  res.end(); // status 200 OK
});

server.get("/stats", (req: Request, res: Response) => {
  console.log(`Has handled a total of ${incomingCounter} requests so far!`);
  res.send({ "incoming_total": incomingCounter }); // status 200 OK
});

setupExpress.catchAll(server);
