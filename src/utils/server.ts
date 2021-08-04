import express from "express";
import * as OpenApiValidator from 'express-openapi-validator';
import { Express } from 'express-serve-static-core';
import { connector, summarise } from 'swagger-routes-express';
import YAML from 'yamljs';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import morganBody from 'morgan-body';

import {expressDevLogger} from '@exmpl/utils/express_dev_logger';
import * as api from '@exmpl/api/controllers';

export async function createServer(): Promise<Express> {
  const yamlSpecFile = './config/openapi.yml';
  const apiDefinition = YAML.load(yamlSpecFile);
  const apiSummary = summarise(apiDefinition);
  console.info(apiSummary);

  // Server init
  const server = express();
  server.use(bodyParser.json());
  server.use(morgan(':method :url :status :response-time ms - :res[content-length]'));
  morganBody(server);
  server.use(expressDevLogger);

  // Setup API validator
  const validatorOptions = {
    apiSpec: yamlSpecFile,
    validateRequests: true,
    validateResponses: true
  };

  server.use(OpenApiValidator.middleware(validatorOptions));

  // Error customization, if request is invalid
  server.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.status(err.status).json({
      error: {
        type: 'request_validation',
        message: err.message,
        errors: err.errors
      }
    });
  });

  const connect = connector(api, apiDefinition, {
    onCreateRoute: (method: string, descriptor: any[]) => {
      descriptor.shift();
      console.log(`${method}: ${descriptor.map((d: any) => d.name).join(', ')}`)
    },
    security: {
      bearerAuth: api.auth
    }
  });

  connect(server);

  return server;
}