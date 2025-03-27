// __tests__/middleware/validation.middleware.test.ts
import { Request, Response } from 'express';
import Joi from 'joi';
import { validate } from '../../src/middleware/validation.middleware';
import { ValidationError } from '../../src/utils/errors';

describe('Validation Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      body: {}
    };
    mockResponse = {};
    mockNext = jest.fn();
  });

  it('should call next with no error when validation passes', () => {
    const schema = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required()
    });

    mockRequest.body = {
      name: 'Test User',
      email: 'test@example.com'
    };

    const middleware = validate(schema);
    middleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should call next with ValidationError when validation fails', () => {
    const schema = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required()
    });

    mockRequest.body = {
      name: 'Test User'
      // email is missing
    };

    const middleware = validate(schema);
    middleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalledTimes(1);
    const error = mockNext.mock.calls[0][0];
    expect(error).toBeInstanceOf(ValidationError);
    expect(error.message).toContain('email');
  });

  it('should combine multiple validation errors into a single message', () => {
    const schema = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      age: Joi.number().min(18).required()
    });

    mockRequest.body = {
      // All fields are missing
    };

    const middleware = validate(schema);
    middleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalledTimes(1);
    const error = mockNext.mock.calls[0][0];
    expect(error).toBeInstanceOf(ValidationError);
    expect(error.message).toContain('name');
    expect(error.message).toContain('email');
    expect(error.message).toContain('age');
  });
});