import Ajv, { JSONSchemaType } from 'ajv';
import ajvErrors from 'ajv-errors';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ coerceTypes: true, allErrors: true, $data: true });

ajvErrors(ajv /*, {singleError: true} */);

addFormats(ajv);

const internationalPhoneNumberPattern = '^\\+[0-9]{1,3}[0-9( )+\\-]{1,20}$';

export interface LoanApplicationData {
  name: string;
  phone: string;
  email: string;
  // farmland: string;
  // additionalInfo: string;
  amount: number;
  minAmount: number;
  // repaymentDuration: string;
  // collateral: string[];
  asset: string;
}

const schema: JSONSchemaType<LoanApplicationData> = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 2,
    },
    phone: {
      type: 'string',
      pattern: internationalPhoneNumberPattern,
    },
    email: {
      type: 'string',
      format: 'email',
    },
    // farmland: {
    //   type: 'string',
    //   minLength: 3,
    // },
    // additionalInfo: {
    //   type: 'string',
    // },
    amount: {
      type: 'number',
      exclusiveMinimum: 0,
    },
    minAmount: {
      type: 'number',
    },
    asset: {
      type: 'string',
    },
    // repaymentDuration: {
    //   type: 'string',
    //   minLength: 1,
    // },
    // collateral: {
    //   type: 'array',
    //   items: {
    //     type: 'string',
    //   },
    //   minItems: 1,
    // },
  },
  required: [
    'name',
    'phone',
    'email',
    // 'farmland',
    'amount',
    // 'collateral',
    // 'repaymentDuration',
    'asset',
  ],
  additionalProperties: true,
  errorMessage: {
    properties: {
      name: 'Please enter your name',
      phone: 'Please enter a valid phone number',
      email: 'Please enter a valid email address',
      // farmland: 'Please enter a valid farmland',
      amount: 'Please enter a valid number',
      // collateral: 'Please select at least one option',
      // repaymentDuration: 'Please enter a valid repayment duration',
      asset: 'Please enter a valid asset',
    },
  },
};

export const getValidationFunction = () => {
  return ajv.compile({
    ...schema,
    properties: {
      ...schema.properties,
    },
  });
};
