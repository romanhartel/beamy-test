import express, { Express, Request, Response, NextFunction } from "express";

export const initMiddlewares = (app: Express) => {
  // Mount a JSON body-parsing middleware
  app.use(express.json()); // parse 'application/json' payload type
};

export const catchAll = (app: Express) => {
  app.use(errorHandler);
}

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // Send bye bye
  res.status(500).send({ errors: [{ message: err.message }] });
  next();
};

// Bind and start listening to port `port`

export const fire = async (app: Express, port: string|Number) => {
  app.listen(port, () => {
    /* eslint-disable no-console */
    console.log(`HTTP server listening on http://localhost:${port}...`);
    /* eslint-enable no-console */
  });
};
