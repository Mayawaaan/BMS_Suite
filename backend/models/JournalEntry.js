import mongoose from 'mongoose';
import { tenantScopingPlugin } from '../plugins/tenantScopingPlugin.js';

const journalLineSchema = new mongoose.Schema(
  {
    accountId: { type: String },
    accountCode: { type: String, required: true },
    accountName: { type: String, required: true },
    debit: { type: Number, default: 0, min: 0 },
    credit: { type: Number, default: 0, min: 0 },
    description: { type: String, default: '' },
  },
  { _id: false }
);

const journalEntrySchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true, index: true },
    entryNumber: { type: String, required: true },
    date: { type: String, required: true },
    memo: { type: String, required: true },
    sourceType: {
      type: String,
      enum: ['bill', 'sale', 'payment', 'inventory_adjustment', 'manual'],
      default: 'manual',
      index: true,
    },
    sourceId: { type: String, default: '' },
    lines: {
      type: [journalLineSchema],
      validate: {
        validator: function (lines) {
          return Array.isArray(lines) && lines.length >= 2;
        },
        message: 'A journal entry must contain at least two transaction lines (double-entry).',
      },
    },
    totalDebit: { type: Number, required: true },
    totalCredit: { type: Number, required: true },
    isBalanced: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ['draft', 'posted', 'voided'],
      default: 'posted',
      index: true,
    },
    postedBy: { type: String, default: 'System Engine' },
  },
  { timestamps: true }
);

// Compound unique index ensuring journal entry number is unique per tenant
journalEntrySchema.index({ tenantId: 1, entryNumber: 1 }, { unique: true });
journalEntrySchema.index({ tenantId: 1, date: -1 });
journalEntrySchema.index({ tenantId: 1, sourceType: 1 });

journalEntrySchema.plugin(tenantScopingPlugin);

export const JournalEntry = mongoose.models.JournalEntry || mongoose.model('JournalEntry', journalEntrySchema);
export default JournalEntry;
