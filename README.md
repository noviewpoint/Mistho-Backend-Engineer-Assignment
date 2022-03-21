# Mistho Backend Engineer Assignment

## Description

API that gathers data from the Glassdoor website. App is built using [Nest](https://github.com/nestjs/nest) framework TypeScript
starter repository.

## Installation

```bash
$ npm install
```

### MongoDB

MongoDB database is required. To run MongoDB inside Docker (Docker must be pre-installed), type:

```bash
$ docker run --name some-mongodb -p 27017:27017 -d mongo
```

This will pull MongoDB image if you do not have it already installed and start the container. It will expose MongoDB on
default port 27017 with default settings and authentication.

### Redis

Redis database is required. To run Redis inside Docker (Docker must be pre-installed), type:

```bash
$ docker run --name some-redis -p 6379:6379 -d redis
```

This will pull Redis image if you do not have it already installed and start the container. It will expose Redis on
default port 6379 with default settings and authentication.

### RabbitMQ

RabbitMQ message broker is required. To run RabbitMQ inside Docker (Docker must be pre-installed), type:

```bash
$ docker run --name some-rabbitmq -p 5672:5672 -p 15672:15672 -d --hostname my-rabbit rabbitmq:3-management
```

This will pull RabbitMQ image if you do not have it already installed and start the container. It will expose RabbitMQ
on default port 5672 with default settings and authentication. It will also expose RabbitMQ Management
on `http://localhost:15672`.

## Environment variables

Create a copy of `.env.dist` file named `.env` in the root of the repository. Set according environment variables in
this file before starting the application.

## Running the application

```bash
# development for api
$ npm run start api

# development for scraper
$ npm run start scraper

# watch mode for api
$ npm run start:dev api

# watch mode for scraper
$ npm run start:dev scraper

# TODO - production modes for api and scraper currently not working
```

## OpenAPI Swagger documentation

To see API documentation, start the app and visit `http://localhost:4000/docs` or `http://localhost:3000/docs` (this depends on `API_HTTP_PORT` and `SCRAPER_HTTP_PORT` values from environment file).

## Test

```bash
# unit tests for whole repo
$ npm run test

# e2e tests for api
$ npm run test:e2e:api

# e2e tests for scraper
$ npm run test:e2e:scraper

# test coverage for whole repo
$ npm run test:cov
```