export const ERROR_MESSAGES = {
  required: (field) => `${field} is required`,
  minLength: (field, length) =>
    `${field} must be at least ${length} characters`,

  maxLength: (field, length) => `${field} cannot exceed ${length} characters`,
  unique: (field) => `${field} must be unique`,
  invalid: (field) => `Invalid ${field} format`,
  negative: (field) => `${field} cannot be negative`,
  range: (field, min, max) => `${field} must be between ${min} and ${max}`,
  minValue: (field, value) => `${field} must be at least ${value}`,
  maxValue: (field, value) => `${field} must be at most ${value}`,
};
