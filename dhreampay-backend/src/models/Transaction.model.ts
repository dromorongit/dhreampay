import mongoose, { Schema, model } from "mongoose";
import { ITransaction } from "../types/transaction.types.js";

const TransactionSchema = new Schema<ITransaction>(
  {
    transactionId: { type: String, required: true },
    source: { type: String, enum: ["bank", "visa"], required: true },
    transactionType: {
      type: String,
      enum: ["purchase", "refund", "reversal", "adjustment"],
      required: true,
    },
    cardNumberMasked: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: "GHS" },
    transactionDate: { type: Date, required: true },
    postingDate: { type: Date, required: true },
    merchantId: { type: String, required: true },
    terminalId: { type: String },
    authorizationCode: { type: String },
    isVIP: { type: Boolean, required: true, default: false },
    settlementBatchId: { type: Schema.Types.ObjectId, ref: "SettlementBatch" },
    status: {
      type: String,
      enum: ["unmatched", "matched", "exception", "resolved"],
      required: true,
      default: "unmatched",
    },
    rawData: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
  },
);

TransactionSchema.index({ transactionId: 1, source: 1 }, { unique: true });
TransactionSchema.index({ source: 1, status: 1 });

export { TransactionSchema };

export const TransactionModel = model<ITransaction>(
  "Transaction",
  TransactionSchema,
);
