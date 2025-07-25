import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const INVALID_PHONENUMBER = 'INVALID_PHONENUMBER';
export const INVALID_USERID = 'INVALID_USERID';
export const INVALID_PASSWORD = 'INVALID_PASSWORD';
export const INVALID_FIRSTNAME = 'INVALID_FIRSTNAME';
export const INVALID_LASTNAME = 'INVALID_LASTNAME';
export const USER_EXISTS = 'USER_EXISTS';
export const USER_NOT_FOUND = 'USER_NOT_FOUND';
export const INVALID_OLD_PASSWORD = 'INVALID_OLD_PASSWORD';
export const FORGOT_TOKEN_EXPIRED = 'FORGOT_TOKEN_EXPIRED';
export const FORGOT_TOKEN_EXISTS = 'FORGOT_TOKEN_EXISTS';
export const INVALID_CREDENTIALS = 'INVALID_CREDENTIALS';
export const ERROR_UPDATE_USER = 'ERROR_UPDATE_USER';
export const INVALID_EMAIL = 'INVALID_EMAIL';
export const INVALID_ADDRESS = 'INVALID_ADDRESS';
export const INVALID_DOB = 'INVALID_DOB';
export const INVALID_TOKEN = 'INVALID_TOKEN';
export const VERIFY_EMAIL_TOKEN_ALREADY_EXISTS =
  'VERIFY_EMAIL_TOKEN_ALREADY_EXISTS';
export const VERIFY_EMAIL_TOKEN_IS_EXPIRED = 'VERIFY_EMAIL_TOKEN_IS_EXPIRED';
export const VERIFY_EMAIL_TOKEN_NOT_FOUND = 'VERIFY_EMAIL_TOKEN_NOT_FOUND';
export const EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS';
export const CONFIRM_EMAIL_VERIFICATION_ERROR =
  'CONFIRM_EMAIL_VERIFICATION_ERROR';
export const THIS_EMAIL_ALREADY_VERIFY = 'THIS_EMAIL_ALREADY_VERIFY';
export const ERROR_REGISTER_USER = 'ERROR_REGISTER_USER';
export const ERROR_UPDATE_PASSWORD = 'ERROR_UPDATE_PASSWORD';
export const ERROR_CREATE_FORGOT_PASSWORD_TOKEN =
  'ERROR_CREATE_FORGOT_PASSWORD_TOKEN';
export const USER_ALREADY_VERIFIED_EMAIL = 'USER_ALREADY_VERIFIED_EMAIL';
export const USER_ALREADY_VERIFIED_PHONENUMBER =
  'USER_ALREADY_VERIFIED_PHONENUMBER';
export const VERIFY_PHONE_NUMBER_TOKEN_ALREADY_EXISTS =
  'VERIFY_PHONE_NUMBER_TOKEN_ALREADY_EXISTS';
export const ERROR_CREATE_VERIFY_PHONE_NUMBER_TOKEN =
  'ERROR_CREATE_VERIFY_PHONE_NUMBER_TOKEN';
export const ERROR_CREATE_VERIFY_EMAIL_TOKEN =
  'ERROR_CREATE_VERIFY_EMAIL_TOKEN';
export const VERIFY_PHONE_NUMBER_TOKEN_NOT_FOUND =
  'VERIFY_PHONE_NUMBER_TOKEN_NOT_FOUND';
export const VERIFY_PHONE_NUMBER_TOKEN_IS_EXPIRED =
  'VERIFY_PHONE_NUMBER_TOKEN_IS_EXPIRED';
export const CONFIRM_PHONE_NUMBER_VERIFICATION_ERROR =
  'CONFIRM_PHONE_NUMBER_VERIFICATION_ERROR';

export type TAuthErrorCodeKey =
  | typeof INVALID_PHONENUMBER
  | typeof INVALID_PASSWORD
  | typeof INVALID_LASTNAME
  | typeof INVALID_USERID
  | typeof USER_EXISTS
  | typeof USER_NOT_FOUND
  | typeof INVALID_OLD_PASSWORD
  | typeof FORGOT_TOKEN_EXPIRED
  | typeof INVALID_CREDENTIALS
  | typeof FORGOT_TOKEN_EXISTS
  | typeof ERROR_UPDATE_USER
  | typeof INVALID_EMAIL
  | typeof INVALID_ADDRESS
  | typeof INVALID_DOB
  | typeof INVALID_TOKEN
  | typeof EMAIL_ALREADY_EXISTS
  | typeof VERIFY_EMAIL_TOKEN_ALREADY_EXISTS
  | typeof VERIFY_EMAIL_TOKEN_NOT_FOUND
  | typeof VERIFY_EMAIL_TOKEN_IS_EXPIRED
  | typeof CONFIRM_EMAIL_VERIFICATION_ERROR
  | typeof THIS_EMAIL_ALREADY_VERIFY
  | typeof ERROR_REGISTER_USER
  | typeof ERROR_UPDATE_PASSWORD
  | typeof ERROR_CREATE_FORGOT_PASSWORD_TOKEN
  | typeof INVALID_FIRSTNAME
  | typeof USER_ALREADY_VERIFIED_EMAIL
  | typeof USER_ALREADY_VERIFIED_PHONENUMBER
  | typeof VERIFY_PHONE_NUMBER_TOKEN_ALREADY_EXISTS
  | typeof ERROR_CREATE_VERIFY_PHONE_NUMBER_TOKEN
  | typeof ERROR_CREATE_VERIFY_EMAIL_TOKEN
  | typeof VERIFY_PHONE_NUMBER_TOKEN_NOT_FOUND
  | typeof VERIFY_PHONE_NUMBER_TOKEN_IS_EXPIRED
  | typeof CONFIRM_PHONE_NUMBER_VERIFICATION_ERROR;

export type TAuthErrorCode = Record<TAuthErrorCodeKey, TErrorCodeValue>;

// 119000 - 120000
export const AuthValidation: TAuthErrorCode = {
  INVALID_PHONENUMBER: createErrorCode(119000, 'Phone number is required'),
  INVALID_PASSWORD: createErrorCode(119001, 'Password is required'),
  INVALID_FIRSTNAME: createErrorCode(119002, 'First name is required'),
  INVALID_LASTNAME: createErrorCode(119003, 'Last name is required'),
  INVALID_USERID: createErrorCode(119004, 'User ID is required'),
  USER_EXISTS: createErrorCode(119005, 'User exist'),
  USER_NOT_FOUND: createErrorCode(119006, 'User not found'),
  INVALID_OLD_PASSWORD: createErrorCode(119007, 'Invalid old password'),
  FORGOT_TOKEN_EXPIRED: createErrorCode(119008, 'Forgot token is expired'),
  FORGOT_TOKEN_EXISTS: createErrorCode(119009, 'Forgot token exists'),
  INVALID_CREDENTIALS: createErrorCode(119010, 'Invalid credentials'),
  ERROR_UPDATE_USER: createErrorCode(119011, 'Error when updating user'),
  INVALID_EMAIL: createErrorCode(119012, 'Invalid email'),
  INVALID_ADDRESS: createErrorCode(119013, 'Invalid address'),
  INVALID_DOB: createErrorCode(119014, 'Invalid date of birth'),
  INVALID_TOKEN: createErrorCode(119015, 'Invalid token'),
  EMAIL_ALREADY_EXISTS: createErrorCode(119016, 'Email already exists'),
  VERIFY_EMAIL_TOKEN_ALREADY_EXISTS: createErrorCode(
    119017,
    'Verify email token already exists',
  ),
  VERIFY_EMAIL_TOKEN_NOT_FOUND: createErrorCode(
    119018,
    'Verify email token not found',
  ),
  VERIFY_EMAIL_TOKEN_IS_EXPIRED: createErrorCode(
    119019,
    'Verify email token is expired',
  ),
  CONFIRM_EMAIL_VERIFICATION_ERROR: createErrorCode(
    119020,
    'Error when confirming email verification',
  ),
  THIS_EMAIL_ALREADY_VERIFY: createErrorCode(
    119021,
    'This email already verified',
  ),
  ERROR_REGISTER_USER: createErrorCode(119022, 'Error when registering user'),
  ERROR_UPDATE_PASSWORD: createErrorCode(
    119023,
    'Error when updating password',
  ),
  ERROR_CREATE_FORGOT_PASSWORD_TOKEN: createErrorCode(
    119024,
    'Error when creating forgot password token',
  ),
  USER_ALREADY_VERIFIED_EMAIL: createErrorCode(
    119025,
    'User already verified email',
  ),
  USER_ALREADY_VERIFIED_PHONENUMBER: createErrorCode(
    119026,
    'User already verified phone number',
  ),
  VERIFY_PHONE_NUMBER_TOKEN_ALREADY_EXISTS: createErrorCode(
    119027,
    'Verify phone number token already exists',
  ),
  ERROR_CREATE_VERIFY_PHONE_NUMBER_TOKEN: createErrorCode(
    119028,
    'Error when creating verify phone number token',
  ),
  ERROR_CREATE_VERIFY_EMAIL_TOKEN: createErrorCode(
    119029,
    'Error when creating verify email token',
  ),
  VERIFY_PHONE_NUMBER_TOKEN_NOT_FOUND: createErrorCode(
    119030,
    'Verify phone number token not found',
  ),
  VERIFY_PHONE_NUMBER_TOKEN_IS_EXPIRED: createErrorCode(
    119031,
    'Verify phone number token is expired',
  ),
  CONFIRM_PHONE_NUMBER_VERIFICATION_ERROR: createErrorCode(
    119032,
    'Error when confirm phone number verification',
  ),
};
