import * as setupEnv from "app/setup/environment";
import express, { Request, Response } from "express";
import * as setupExpress from "app/setup/express";
import * as utils from "app/helpers/utils";
import fs from "node:fs";
import { toJSONformat } from "app/helpers/json";

setupEnv.setupEnvironment();

// Setup Express
const server = express();
// Define or retrieve the proper port on which the server is allowed to listen
const port = process.env.HTTP_SERVER_PORT || 3000;
// Define a dedicated folder path where all incoming requests' payloads are pushed to as files
const directoryPath = process.env.LOG_FOLDER || "parsed";
// Incoming requests counter
let incomingCounter = 0;

setupExpress.initMiddlewares(server);
setupEnv.initFolder(directoryPath);
setupExpress.fire(server, port);

// Define a POST route matching the one defined in `httpEmitter.ts`
server.post("/", (req: Request, res: Response) => {
  try {
    incomingCounter++;
    const fileId = utils.extractIdLog(req.body.log);
    const filePath = utils.formLogFilePath(directoryPath, fileId);
    const stream = fs.createWriteStream(filePath);
    const outputLog = toJSONformat(req.body.log);
    stream.write(outputLog);
    stream.close();
    res.end(); // status 200 OK
  } catch (e: any) {
    console.log(`Error ${e.code}: ${e.message}`);
    res.status(500).end(); // Internal Server Error
  }
});

server.get("/stats", (req: Request, res: Response) => {
  console.log(`Has handled a total of ${incomingCounter} requests so far!`);
  res.send({ "incoming_total": incomingCounter }); // status 200 OK
});

setupExpress.catchAll(server);
