import Joi from 'joi';

export const updateUserSchema = Joi.object({
  displayName: Joi.string().min(2).max(255).optional()
});

export const userPaginationSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  search: Joi.string().optional()
});
