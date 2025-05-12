export const USER_MESSAGE = {
  VALIDATION_ERROR: 'Validation error',
  NAME_IS_REQUIRED: 'Please enter your username',
  NAME_IS_STRING: 'User Name must be string',
  NAME_IS_LENGTH: 'Please enter enough characters',

  EMAIL_IS_REQUIRED: 'Please enter your email',
  EMAIL_FORMAT: 'Please enter a valid email',
  EMAIL_ALREADY_EXISTS: 'Email already exists',

  PASSWORD_IS_REQUIRED: 'Please enter your password',
  PASSWORD_IS_STRING: 'Please enter a valid password',
  PASSWORD_IS_LENGTH: 'Please enter enough characters',
  PASSWORD_IS_STRONG: 'Please enter strongest password',

  PASSWORD_CONFIRM_IS_REQUIRED: 'Please enter your confirm password',
  PASSWORD_CONFIRM_IS_STRING: 'Please enter a valid confirm password',
  PASSWORD_CONFIRM_IS_LENGTH: 'Please enter enough characters',
  PASSWORD_CONFIRM_IS_STRONG: 'Please enter strongest confirm password',
  PASSWORD_CONFIRM_IS_EQUAL: 'Confirm password does not match',

  REFRESH_TOKEN_IS_REQUIRED: 'Refresh token is required',
  REFRESH_TOKEN_IS_STRING: 'Refresh token must be string',

  DATE_OF_BIRTH_MUST_BE_ISO8601: 'Date of birth must be ISO8601'
} as const
