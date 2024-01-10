# Beamy technical test

## Prerequisites

the purpose of this test is to build 2 servers that can handle incoming HTTP requests.
*Server #1* should handle the incoming requests, extract and custom format their associated sampled payload, then push each formatted payload output to a single file in the `parsed` directory at the root of the project.
*Server #2* should also handle incoming requests, extract and JSON format their associated sampled payload, add a slow computation process that will supplement it, and finally push the output in a Redis list.

#### General

- The levels have been solved in ascending order
- I took the liberty to encapsulate (usually tiny) handlers and helpers in order to clarify the main server code written for level 1 and level 2
- The resulting code is arguably clean, extensible, reliable and reproducible on various environments
- Each main server level can be run using a single command

#### Technical

- Node v18 has been used to solve this test
- All the librairies supplied were used as is and none of them has been modified along the way
- `Express` was picked as the HTTP server
- `Redis-stack` has been used in order to enable its JSON handling capabilities out of the box
- default configurations have been used in order to speed up the coding process

## How to run

Main code for *Server #1* can be found at the root of the project under the `level1` directory. Same thing applies for *Server #2* under the `level2` directory.

First run `npm install` at the root of the project in order to download and install the required modules. Then open 2 bash terminal windows.

#### Server level 1

In order to launch and use *Server #1* run the following command in the first terminal:
```
npm run start:level1
```
The server should then answer *HTTP server listening on http://localhost:3000...* It means it is ready to work!
In the second terminal window run the following command in order to make *Server #1* do his work:
```
npm run logs:emit
```

You will then be able to see a directory called `parsed` has been created at the root level of the project. It is now populated with 500 log files by default named by their id (in `UUID` form). Use the `ls | wc -l` command in that `parsed` folder in order to help count the files.

alternatively, you could use the following command to ask the server the number of handled incoming requests (in total):
```
curl http://localhost:3000/stats
```

#### Server level 2

For *Server #2* to be running properly, you should first instantiate a docker container with `Redis-stack` in order to push logs. To do so, open a third terminal window and execute the following commands from the project's root level:
```
cd stack
docker-compose up
```

Go back to the first terminal, shutdown *Server #1* if it is still running (`ctrl+c` in your terminal) then run the following command in order to launch and use *Server #2*:
```
npm run start:level2
```
The server should also answer *HTTP server listening on http://localhost:3000...* It also means that it is ready to work! :)
Then follow the same procedure as with *Server#1* and go to the second terminal window run the following command:
```
npm run logs:emit
```
You will then be able to check in Redis how `log` keys have been added according to all the sample logs previously generated and passed on to *Server #2* using the following commands in another terminal:
```
redis-cli
KEYS *
JSON.GET log:$UUID
```
`$UUID` being a sample log ID.

Alternatively, you could use the following command to ask the server the number of handled incoming requests (in total):
```
curl http://localhost:3000/stats
```

Or a suggestion would be to use RedisInsight web client accessible from http://localhost:8001 (http://localhost:8001/redis-stack/browser) and check there all the logs that have been added to the `log` list.

## Found issues

If one deletes the `parsed` folder once *Server #1* is up and running it will fail with error code `ENOENT`, as it does not test for the `parsed` folder's existence once incoming requests are catched and handled.

## Alternatives

- Use of https://github.com/redis/redis-om-node package as an alternative?

## Useful commands

- Redis delete all logs with the following redis-cli command:
```
redis-cli --raw keys "log" | xargs redis-cli del
```

- Redis retrieve a specific log with the following redis-cli command:
```
JSON.GET log:$UUID (ie. JSON.GET log:babc5a1c-b657-45c3-8ebf-5a5d30005e49)
```

- Retrieve all logs with the following server code sequence:
`KEYS log:*` (using `redisCli.keys()`)
`JSON.GET log:$ID` for each log key returned by the previous command (using `redis.json.get()`)

- In order to search/query existing and future logs, simply create indexes on chosen JSON object **attributes** using JSON schema (`FT.CREATE` Redis command). See https://redis.io/docs/interact/search-and-query/indexing/#index-json-objects for reference.

## Improvements

 - create custom error classes
 - add custom logger
 - add tests
 - add indexes in Redis to query logs with controlled granularity
 - declare and instantiate a Redis repository
