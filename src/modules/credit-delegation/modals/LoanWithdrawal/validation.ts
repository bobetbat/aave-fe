import Ajv, { JSONSchemaType } from 'ajv';
import ajvErrors from 'ajv-errors';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ coerceTypes: true, allErrors: true, $data: true });

ajvErrors(ajv /*, {singleError: true} */);

addFormats(ajv);

interface LoanWithdrawalData {
  amount: number;
  // recipient: string;
  // company: string;
  // title: string;
  // signature: string;
}

export const schema: JSONSchemaType<LoanWithdrawalData> = {
  type: 'object',
  properties: {
    // recipient: {
    //   type: 'string',
    //   minLength: 4,
    // },
    // company: {
    //   type: 'string',
    // },
    // title: {
    //   type: 'string',
    // },
    // signature: {
    //   type: 'string',
    //   minLength: 1,
    // },
    amount: {
      type: 'number',
      // exclusiveMinimum: 0,
    },
  },
  required: ['amount'],
  additionalProperties: true,
  errorMessage: {
    properties: {
      recipient: 'Please enter valid recipient address',
      amount: 'Please enter a valid amount',
    },
  },
};
export const validate = ajv.compile(schema);
