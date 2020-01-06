import { Schema } from 'mongoose';

export default new Schema(
  {
    transaction_type: {
      type: String,
      enum: ['mint', 'transfer_outgoing', 'transfer_incoming', 'burn', 'shielding'],
      required: true,
    },
    token_uri: {
      type: String,
      required: true,
    },
    token_id: {
      type: String,
      index: true,
      required: true,
    },
    shield_contract_address: String,

    // receiver info
    receiver: {
      name: String,
      address: String,
    },

    // sender info
    sender: {
      name: String,
      address: String,
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);
