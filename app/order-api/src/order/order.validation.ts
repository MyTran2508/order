import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const OWNER_NOT_FOUND = 'OWNER_NOT_FOUND';
export const INVALID_ORDER_ITEMS = 'INVALID_ORDER_ITEMS';
export const INVALID_ORDER_OWNER = 'INVALID_ORDER_OWNER';
export const INVALID_ORDER_APPROVAL_BY = 'INVALID_ORDER_APPROVAL_BY';
export const ORDER_INVALID = 'ORDER_INVALID';
export const ORDER_SLUG_INVALID = 'ORDER_SLUG_INVALID';
export const SUBTOTAL_NOT_VALID = 'SUBTOTAL_NOT_VALID';
export const ORDER_NOT_FOUND = 'ORDER_NOT_FOUND';
export const ORDER_STATUS_INVALID = 'ORDER_STATUS_INVALID';
export const REQUEST_QUANTITY_EXCESS_CURRENT_QUANTITY =
  'REQUEST_QUANTITY_EXCESS_CURRENT_QUANTITY';
export const ORDER_TYPE_INVALID = 'ORDER_TYPE_INVALID';
export const CREATE_ORDER_ERROR = 'CREATE_ORDER_ERROR';
export const ORDER_ID_INVALID = 'ORDER_ID_INVALID';
export const UPDATE_ORDER_ERROR = 'UPDATE_ORDER_ERROR';
export const INVALID_ORDER_SLUG = 'INVALID_ORDER_SLUG';
export const REQUEST_QUANTITY_MUST_OTHER_INFINITY =
  'REQUEST_QUANTITY_MUST_OTHER_INFINITY';
export const ERROR_WHEN_CREATE_CHEF_ORDERS_FROM_ORDER =
  'ERROR_WHEN_CREATE_CHEF_ORDERS_FROM_ORDER';
export const START_DATE_CAN_NOT_BE_EMPTY = 'START_DATE_CAN_NOT_BE_EMPTY';
export const END_DATE_CAN_NOT_BE_EMPTY = 'END_DATE_CAN_NOT_BE_EMPTY';
export const INVALID_TABLE_SLUG = 'INVALID_TABLE_SLUG';
export const INVALID_VOUCHER_SLUG = 'INVALID_VOUCHER_SLUG';
export const ORDER_IS_NOT_PENDING = 'ORDER_IS_NOT_PENDING';
export const ERROR_WHEN_CANCEL_ORDER = 'ERROR_WHEN_CANCEL_ORDER';
export const VOUCHER_IS_THE_SAME_PREVIOUS_VOUCHER =
  'VOUCHER_IS_THE_SAME_PREVIOUS_VOUCHER';

export type TOrderErrorCodeKey =
  | typeof OWNER_NOT_FOUND
  | typeof ORDER_STATUS_INVALID
  | typeof ORDER_NOT_FOUND
  | typeof ORDER_SLUG_INVALID
  | typeof SUBTOTAL_NOT_VALID
  | typeof ORDER_TYPE_INVALID
  | typeof CREATE_ORDER_ERROR
  | typeof ORDER_ID_INVALID
  | typeof ORDER_INVALID
  | typeof INVALID_ORDER_OWNER
  | typeof INVALID_ORDER_APPROVAL_BY
  | typeof INVALID_ORDER_ITEMS
  | typeof UPDATE_ORDER_ERROR
  | typeof INVALID_ORDER_SLUG
  | typeof REQUEST_QUANTITY_MUST_OTHER_INFINITY
  | typeof ERROR_WHEN_CREATE_CHEF_ORDERS_FROM_ORDER
  | typeof REQUEST_QUANTITY_EXCESS_CURRENT_QUANTITY
  | typeof START_DATE_CAN_NOT_BE_EMPTY
  | typeof END_DATE_CAN_NOT_BE_EMPTY
  | typeof INVALID_TABLE_SLUG
  | typeof INVALID_VOUCHER_SLUG
  | typeof ORDER_IS_NOT_PENDING
  | typeof ERROR_WHEN_CANCEL_ORDER
  | typeof VOUCHER_IS_THE_SAME_PREVIOUS_VOUCHER;

export type TOrderErrorCode = Record<TOrderErrorCodeKey, TErrorCodeValue>;

// Error range: 101000 - 102000
export const OrderValidation: TOrderErrorCode = {
  OWNER_NOT_FOUND: createErrorCode(101000, 'Owner invalid'),
  ORDER_NOT_FOUND: createErrorCode(101001, 'Order not found'),
  ORDER_STATUS_INVALID: createErrorCode(101002, 'Order status invalid'),
  REQUEST_QUANTITY_EXCESS_CURRENT_QUANTITY: createErrorCode(
    101003,
    'Request quantity excess current quantity',
  ),
  ORDER_SLUG_INVALID: createErrorCode(101004, 'Order slug not found'),
  SUBTOTAL_NOT_VALID: createErrorCode(101005, 'Order subtotal is not valid'),
  ORDER_TYPE_INVALID: createErrorCode(101006, 'Order type is not valid'),
  CREATE_ORDER_ERROR: createErrorCode(101007, 'Error when saving order'),
  ORDER_ID_INVALID: createErrorCode(101008, 'Order id invalid'),
  ORDER_INVALID: createErrorCode(101009, 'Order invalid'),
  INVALID_ORDER_OWNER: createErrorCode(1010010, 'Owner invalid'),
  INVALID_ORDER_APPROVAL_BY: createErrorCode(1010011, 'Approval invalid'),
  INVALID_ORDER_ITEMS: createErrorCode(1010012, 'Invalid order items'),
  UPDATE_ORDER_ERROR: createErrorCode(1010013, 'Error when updating order'),
  INVALID_ORDER_SLUG: createErrorCode(1010014, 'Invalid order slug'),
  REQUEST_QUANTITY_MUST_OTHER_INFINITY: createErrorCode(
    1010015,
    'Request quantity must other infinity',
  ),
  ERROR_WHEN_CREATE_CHEF_ORDERS_FROM_ORDER: createErrorCode(
    1010016,
    'Error when create chef orders from order',
  ),
  START_DATE_CAN_NOT_BE_EMPTY: createErrorCode(
    1010017,
    'Start date can not be empty',
  ),
  END_DATE_CAN_NOT_BE_EMPTY: createErrorCode(
    1010018,
    'End date can not be empty',
  ),
  INVALID_TABLE_SLUG: createErrorCode(1010019, 'Invalid table slug'),
  INVALID_VOUCHER_SLUG: createErrorCode(1010020, 'Invalid voucher slug'),
  ORDER_IS_NOT_PENDING: createErrorCode(1010021, 'Order is not pending'),
  ERROR_WHEN_CANCEL_ORDER: createErrorCode(1010022, 'Error when cancel order'),
  VOUCHER_IS_THE_SAME_PREVIOUS_VOUCHER: createErrorCode(
    1010023,
    'Voucher is the same previous voucher',
  ),
};
