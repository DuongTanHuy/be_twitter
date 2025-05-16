export const USER_MESSAGE = {
  VALIDATION_ERROR: 'Validation error',
  NAME_IS_REQUIRED: 'Please enter your username',
  NAME_IS_STRING: 'User Name must be string',
  NAME_IS_LENGTH: 'Please enter enough characters',
  USER_NOT_FOUND: 'User not found',
  USER_NOT_VERIFIED: 'User not verified',
  GET_ME_SUCCESS: 'Get my profile successfully',

  EMAIL_IS_REQUIRED: 'Please enter your email',
  EMAIL_FORMAT: 'Please enter a valid email',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  EMAIL_OR_PASSWORD_IS_INCORRECT: 'Email or password is incorrect',
  EMAIL_VERIFY_TOKEN_IS_REQUIRED: 'Email verify token is required',
  EMAIL_VERIFY_TOKEN_IS_INVALID: 'Email verify token is invalid',
  EMAIL_ALREADY_VERIFIED: 'Email already verified',
  EMAIL_VERIFY_SUCCESS: 'Email verified successfully',
  RESEND_EMAIL_VERIFY_SUCCESS: 'Resend email verify successfully',
  EMAIL_NOT_FOUND: 'Email not found',
  SEND_EMAIL_FORGOT_PASSWORD_SUCCESS: 'Send email forgot password successfully',

  PASSWORD_IS_REQUIRED: 'Please enter your password',
  PASSWORD_IS_STRING: 'Please enter a valid password',
  PASSWORD_IS_LENGTH: 'Please enter enough characters',
  PASSWORD_IS_STRONG: 'Please enter strongest password',

  PASSWORD_CONFIRM_IS_REQUIRED: 'Please enter your confirm password',
  PASSWORD_CONFIRM_IS_STRING: 'Please enter a valid confirm password',
  PASSWORD_CONFIRM_IS_LENGTH: 'Please enter enough characters',
  PASSWORD_CONFIRM_IS_STRONG: 'Please enter strongest confirm password',
  PASSWORD_CONFIRM_IS_EQUAL: 'Confirm password does not match',

  INVALID_ACCESS_TOKEN: 'Invalid access token',
  INVALID_REFRESH_TOKEN: 'Invalid refresh token',
  REFRESH_TOKEN_NOT_FOUND: 'Refresh token not found',
  REFRESH_TOKEN_SUCCESS: 'Refresh token successfully',
  REFRESH_TOKEN_IS_REQUIRED: 'Refresh token is required',
  REFRESH_TOKEN_IS_STRING: 'Refresh token must be string',
  FORGOT_PASSWORD_TOKEN_IS_REQUIRED: 'Forgot password token is required',
  INVALID_FORGOT_PASSWORD_TOKEN: 'Invalid forgot password token',
  VERIFY_FORGOT_PASSWORD_SUCCESS: 'Verify forgot password successfully',
  RESET_PASSWORD_TOKEN_IS_REQUIRED: 'Reset password token is required',
  INVALID_RESET_PASSWORD_TOKEN: 'Invalid reset password token',
  RESET_PASSWORD_SUCCESS: 'Reset password successfully',

  UPLOAD_IMAGE_SUCCESS: 'Upload image successfully',

  LOGOUT_SUCCESS: 'Logout successfully',

  DATE_OF_BIRTH_MUST_BE_ISO8601: 'Date of birth must be ISO8601'
} as const
