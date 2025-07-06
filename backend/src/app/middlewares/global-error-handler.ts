import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

import config from '../../config';
import { TErrorSources, TGenericErrorResponse } from '../types/error';
import handleZodError from '../errors/handle-zod-error';
import handleValidationError from '../errors/handle-validation-error';
import AppError from '../errors/app-error';
import handleDuplicateError from '../errors/handle-duplicate-error';
import handleCastError from '../errors/handle-cast-error';
import logger from '../utils/logger';

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  logger.error('Global error handler caught an error', {
    path: req.path,
    method: req.method,
    statusCode: err?.statusCode || 500,
    name: err?.name,
    message: err?.message,
    stack: err?.stack,
    err,
  });
  //setting default values
  let statusCode = 500;
  let message = 'Something went wrong!';
  let errorSources: TErrorSources = [
    {
      path: '',
      message: 'Something went wrong',
    },
  ];

  if (err instanceof ZodError) {
    const simplifiedError: TGenericErrorResponse = handleZodError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err?.name === 'ValidationError') {
    const simplifiedError: TGenericErrorResponse = handleValidationError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err?.name === 'CastError') {
    const simplifiedError: TGenericErrorResponse = handleCastError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err?.code === 11000) {
    const simplifiedError: TGenericErrorResponse = handleDuplicateError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err instanceof AppError) {
    statusCode = err?.statusCode;
    message = err.message;
    errorSources = [
      {
        path: '',
        message: err?.message,
      },
    ];
  } else if (err instanceof Error) {
    message = err.message;
    errorSources = [
      {
        path: '',
        message: err?.message,
      },
    ];
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    err,
    stack: config.node_env === 'development' ? err?.stack : null,
  });
};

export default globalErrorHandler;
