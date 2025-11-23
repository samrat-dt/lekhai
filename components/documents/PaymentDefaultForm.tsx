'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export interface PaymentDefaultFormData {
  // Sender (Notice Giver) Details
  senderName: string;
  senderAddress: string;
  senderPhone: string;
  senderEmail: string;

  // Recipient (Defaulter) Details
  recipientName: string;
  recipientAddress: string;
  recipientPhone: string;
  recipientEmail: string;

  // Transaction Details
  amountOwed: string;
  transactionDate: string;
  paymentMethod: string; // cash, bank transfer, cheque, UPI, etc.
  transactionReference: string; // cheque number, UPI ref, etc.

  // Context
  relationshipContext: string; // friend, contractor, tenant, freelancer, etc.
  purposeOfPayment: string; // loan, service rendered, rent, work done, etc.
  agreementDetails: string; // verbal agreement, written contract, etc.

  // Default Details
  paymentDueDate: string;
  remindersSent: string; // number of reminders
  lastReminderDate: string;

  // Demand
  paymentDeadline: string; // days from notice date (7, 15, 30)
  additionalDemands: string; // interest, damages, etc.

  // Tone
  tone: 'polite' | 'firm' | 'strict';
}

interface PaymentDefaultFormProps {
  onSubmit: (data: PaymentDefaultFormData) => void;
  isSubmitting: boolean;
}

export default function PaymentDefaultForm({ onSubmit, isSubmitting }: PaymentDefaultFormProps) {
  const [formData, setFormData] = useState<PaymentDefaultFormData>({
    senderName: '',
    senderAddress: '',
    senderPhone: '',
    senderEmail: '',
    recipientName: '',
    recipientAddress: '',
    recipientPhone: '',
    recipientEmail: '',
    amountOwed: '',
    transactionDate: '',
    paymentMethod: '',
    transactionReference: '',
    relationshipContext: '',
    purposeOfPayment: '',
    agreementDetails: '',
    paymentDueDate: '',
    remindersSent: '',
    lastReminderDate: '',
    paymentDeadline: '15',
    additionalDemands: '',
    tone: 'firm',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateField = (field: keyof PaymentDefaultFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Your Details */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Your Details (Notice Sender)</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="senderName">Full Name *</Label>
            <Input
              id="senderName"
              required
              value={formData.senderName}
              onChange={(e) => updateField('senderName', e.target.value)}
              placeholder="Your full name"
            />
          </div>
          <div>
            <Label htmlFor="senderPhone">Phone Number *</Label>
            <Input
              id="senderPhone"
              required
              value={formData.senderPhone}
              onChange={(e) => updateField('senderPhone', e.target.value)}
              placeholder="+91 9876543210"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="senderAddress">Complete Address *</Label>
            <Textarea
              id="senderAddress"
              required
              value={formData.senderAddress}
              onChange={(e) => updateField('senderAddress', e.target.value)}
              placeholder="House/Flat No., Building, Street, Area, City, State, PIN"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="senderEmail">Email Address</Label>
            <Input
              id="senderEmail"
              type="email"
              value={formData.senderEmail}
              onChange={(e) => updateField('senderEmail', e.target.value)}
              placeholder="your@email.com"
            />
          </div>
        </div>
      </section>

      {/* Defaulter Details */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Defaulter Details (Notice Recipient)</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="recipientName">Full Name *</Label>
            <Input
              id="recipientName"
              required
              value={formData.recipientName}
              onChange={(e) => updateField('recipientName', e.target.value)}
              placeholder="Name of person who owes money"
            />
          </div>
          <div>
            <Label htmlFor="recipientPhone">Phone Number</Label>
            <Input
              id="recipientPhone"
              value={formData.recipientPhone}
              onChange={(e) => updateField('recipientPhone', e.target.value)}
              placeholder="+91 9876543210"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="recipientAddress">Complete Address *</Label>
            <Textarea
              id="recipientAddress"
              required
              value={formData.recipientAddress}
              onChange={(e) => updateField('recipientAddress', e.target.value)}
              placeholder="Complete postal address"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="recipientEmail">Email Address</Label>
            <Input
              id="recipientEmail"
              type="email"
              value={formData.recipientEmail}
              onChange={(e) => updateField('recipientEmail', e.target.value)}
              placeholder="their@email.com"
            />
          </div>
        </div>
      </section>

      {/* Payment Details */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Payment Details</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="amountOwed">Amount Owed (₹) *</Label>
            <Input
              id="amountOwed"
              required
              type="number"
              value={formData.amountOwed}
              onChange={(e) => updateField('amountOwed', e.target.value)}
              placeholder="50000"
            />
          </div>
          <div>
            <Label htmlFor="transactionDate">Date of Transaction *</Label>
            <Input
              id="transactionDate"
              required
              type="date"
              value={formData.transactionDate}
              onChange={(e) => updateField('transactionDate', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="paymentMethod">Payment Method *</Label>
            <Input
              id="paymentMethod"
              required
              value={formData.paymentMethod}
              onChange={(e) => updateField('paymentMethod', e.target.value)}
              placeholder="Cash / Bank Transfer / Cheque / UPI"
            />
          </div>
          <div>
            <Label htmlFor="transactionReference">Reference Number</Label>
            <Input
              id="transactionReference"
              value={formData.transactionReference}
              onChange={(e) => updateField('transactionReference', e.target.value)}
              placeholder="Cheque No / UPI Ref / Transaction ID"
            />
          </div>
          <div>
            <Label htmlFor="paymentDueDate">Due Date for Return *</Label>
            <Input
              id="paymentDueDate"
              required
              type="date"
              value={formData.paymentDueDate}
              onChange={(e) => updateField('paymentDueDate', e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Context */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Context & Background</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="relationshipContext">Relationship *</Label>
            <Input
              id="relationshipContext"
              required
              value={formData.relationshipContext}
              onChange={(e) => updateField('relationshipContext', e.target.value)}
              placeholder="Friend / Contractor / Tenant / Freelancer / Business Partner"
            />
          </div>
          <div>
            <Label htmlFor="purposeOfPayment">Purpose of Payment *</Label>
            <Textarea
              id="purposeOfPayment"
              required
              value={formData.purposeOfPayment}
              onChange={(e) => updateField('purposeOfPayment', e.target.value)}
              placeholder="Personal loan / Service rendered / Work completed / Rent advance / etc."
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="agreementDetails">Agreement Type</Label>
            <Input
              id="agreementDetails"
              value={formData.agreementDetails}
              onChange={(e) => updateField('agreementDetails', e.target.value)}
              placeholder="Verbal agreement / Written contract / WhatsApp agreement / etc."
            />
          </div>
        </div>
      </section>

      {/* Follow-up Details */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Follow-up & Reminders</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="remindersSent">Number of Reminders Sent</Label>
            <Input
              id="remindersSent"
              type="number"
              value={formData.remindersSent}
              onChange={(e) => updateField('remindersSent', e.target.value)}
              placeholder="3"
            />
          </div>
          <div>
            <Label htmlFor="lastReminderDate">Last Reminder Date</Label>
            <Input
              id="lastReminderDate"
              type="date"
              value={formData.lastReminderDate}
              onChange={(e) => updateField('lastReminderDate', e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Demand */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Your Demand</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="paymentDeadline">Payment Deadline (days from notice) *</Label>
            <select
              id="paymentDeadline"
              required
              value={formData.paymentDeadline}
              onChange={(e) => updateField('paymentDeadline', e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="7">7 days</option>
              <option value="15">15 days</option>
              <option value="30">30 days</option>
            </select>
          </div>
          <div>
            <Label htmlFor="additionalDemands">Additional Demands (Optional)</Label>
            <Textarea
              id="additionalDemands"
              value={formData.additionalDemands}
              onChange={(e) => updateField('additionalDemands', e.target.value)}
              placeholder="Interest @ 12% p.a. / Compensation for delay / etc."
              rows={2}
            />
          </div>
        </div>
      </section>

      {/* Tone */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Notice Tone</h2>
        <div className="space-y-2">
          {(['polite', 'firm', 'strict'] as const).map((toneOption) => (
            <label key={toneOption} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="tone"
                value={toneOption}
                checked={formData.tone === toneOption}
                onChange={(e) => updateField('tone', e.target.value)}
                className="h-4 w-4 text-orange-500"
              />
              <span className="capitalize">{toneOption}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Submit */}
      <div className="flex justify-end gap-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-orange-500 hover:bg-orange-600 px-8"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Notice'
          )}
        </Button>
      </div>
    </form>
  );
}
