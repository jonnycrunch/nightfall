import {Schema} from 'mongoose';

export default new Schema(
  {
    transaction_type: {
      type: String,
      enum: ['mint', 'transfer_outgoing', 'transfer_incoming', 'burn'],
      required: true,
    },
    input_commitments: [
      {
        token_uri: {
          type: String,
          required: true,
        },
        token_id: {
          type: String,
          required: true,
        },
        salt: {
          type: String,
          required: true,
        },
        commitment: {
          type: String,
          index: true,
          required: true,
        },
        commitment_index: {
          type: Number,
          required: true,
        },
        owner: {
          name: {
            type: String,
          },
          public_key: {
            type: String,
          },
        },
      },
    ],

    output_commitments: [
      {
        token_uri: {
          type: String,
          required: true,
        },
        token_id: {
          type: String,
          required: true,
        },
        salt: {
          type: String,
          required: true,
        },
        commitment: {
          type: String,
          index: true,
          required: true,
        },
        commitment_index: {
          type: Number,
          required: true,
        },
        owner: {
          name: {
            type: String,
          },
          public_key: {
            type: String,
          },
        },
      },
    ],

    sender: {
      public_key: {
        type: String,
      },
      name: {
        type: String,
      },
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);
