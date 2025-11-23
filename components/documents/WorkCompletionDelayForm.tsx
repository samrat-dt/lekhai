'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export interface WorkCompletionDelayFormData {
  // Sender (Client) Details
  senderName: string;
  senderAddress: string;
  senderPhone: string;
  senderEmail: string;

  // Recipient (Contractor/Service Provider) Details
  recipientName: string;
  recipientBusinessName: string;
  recipientAddress: string;
  recipientPhone: string;
  recipientEmail: string;

  // Work/Contract Details
  workDescription: string;
  contractDate: string;
  agreedCompletionDate: string;
  contractValue: string;
  advancePaid: string;
  balanceAmount: string;

  // Delay Details
  currentStatus: string; // percentage complete, state of work
  delayDuration: string; // days/weeks delayed
  lastCommunicationDate: string;
  promisesMade: string; // promises/excuses given

  // Impact
  damagesIncurred: string; // financial loss, inconvenience
  alternativeArrangements: string; // had to make other arrangements

  // Demand
  completionDeadline: string; // days from notice
  compensationDemand: string; // penalty, damages
  tone: 'polite' | 'firm' | 'strict';
}

interface WorkCompletionDelayFormProps {
  onSubmit: (data: WorkCompletionDelayFormData) => void;
  isSubmitting: boolean;
}

export default function WorkCompletionDelayForm({ onSubmit, isSubmitting }: WorkCompletionDelayFormProps) {
  const [formData, setFormData] = useState<WorkCompletionDelayFormData>({
    senderName: '',
    senderAddress: '',
    senderPhone: '',
    senderEmail: '',
    recipientName: '',
    recipientBusinessName: '',
    recipientAddress: '',
    recipientPhone: '',
    recipientEmail: '',
    workDescription: '',
    contractDate: '',
    agreedCompletionDate: '',
    contractValue: '',
    advancePaid: '',
    balanceAmount: '',
    currentStatus: '',
    delayDuration: '',
    lastCommunicationDate: '',
    promisesMade: '',
    damagesIncurred: '',
    alternativeArrangements: '',
    completionDeadline: '15',
    compensationDemand: '',
    tone: 'firm',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateField = (field: keyof WorkCompletionDelayFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Your Details */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Your Details (Client)</h2>
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

      {/* Contractor Details */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Contractor/Service Provider Details</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="recipientName">Full Name *</Label>
            <Input
              id="recipientName"
              required
              value={formData.recipientName}
              onChange={(e) => updateField('recipientName', e.target.value)}
              placeholder="Contractor's name"
            />
          </div>
          <div>
            <Label htmlFor="recipientBusinessName">Business Name</Label>
            <Input
              id="recipientBusinessName"
              value={formData.recipientBusinessName}
              onChange={(e) => updateField('recipientBusinessName', e.target.value)}
              placeholder="Company/Shop name (if applicable)"
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
        </div>
      </section>

      {/* Work/Contract Details */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Work/Contract Details</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="workDescription">Description of Work *</Label>
            <Textarea
              id="workDescription"
              required
              value={formData.workDescription}
              onChange={(e) => updateField('workDescription', e.target.value)}
              placeholder="House painting, plumbing work, carpentry, renovation, etc."
              rows={3}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contractDate">Contract/Agreement Date *</Label>
              <Input
                id="contractDate"
                required
                type="date"
                value={formData.contractDate}
                onChange={(e) => updateField('contractDate', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="agreedCompletionDate">Agreed Completion Date *</Label>
              <Input
                id="agreedCompletionDate"
                required
                type="date"
                value={formData.agreedCompletionDate}
                onChange={(e) => updateField('agreedCompletionDate', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="contractValue">Total Contract Value (₹) *</Label>
              <Input
                id="contractValue"
                required
                type="number"
                value={formData.contractValue}
                onChange={(e) => updateField('contractValue', e.target.value)}
                placeholder="50000"
              />
            </div>
            <div>
              <Label htmlFor="advancePaid">Advance Paid (₹) *</Label>
              <Input
                id="advancePaid"
                required
                type="number"
                value={formData.advancePaid}
                onChange={(e) => updateField('advancePaid', e.target.value)}
                placeholder="25000"
              />
            </div>
            <div>
              <Label htmlFor="balanceAmount">Balance Amount (₹)</Label>
              <Input
                id="balanceAmount"
                type="number"
                value={formData.balanceAmount}
                onChange={(e) => updateField('balanceAmount', e.target.value)}
                placeholder="25000"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Delay Details */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Delay Details</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="currentStatus">Current Status of Work *</Label>
            <Textarea
              id="currentStatus"
              required
              value={formData.currentStatus}
              onChange={(e) => updateField('currentStatus', e.target.value)}
              placeholder="50% complete, only first coat done, work stopped mid-way, etc."
              rows={2}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="delayDuration">Duration of Delay *</Label>
              <Input
                id="delayDuration"
                required
                value={formData.delayDuration}
                onChange={(e) => updateField('delayDuration', e.target.value)}
                placeholder="3 weeks / 45 days / 2 months"
              />
            </div>
            <div>
              <Label htmlFor="lastCommunicationDate">Last Communication Date</Label>
              <Input
                id="lastCommunicationDate"
                type="date"
                value={formData.lastCommunicationDate}
                onChange={(e) => updateField('lastCommunicationDate', e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="promisesMade">Promises/Excuses Given</Label>
            <Textarea
              id="promisesMade"
              value={formData.promisesMade}
              onChange={(e) => updateField('promisesMade', e.target.value)}
              placeholder="Said will come tomorrow, blamed weather, promised to finish by last week, etc."
              rows={2}
            />
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Impact of Delay</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="damagesIncurred">Damages/Loss Incurred</Label>
            <Textarea
              id="damagesIncurred"
              value={formData.damagesIncurred}
              onChange={(e) => updateField('damagesIncurred', e.target.value)}
              placeholder="Unable to move in, paying extra rent, business loss, property damage, etc."
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="alternativeArrangements">Alternative Arrangements Made</Label>
            <Textarea
              id="alternativeArrangements"
              value={formData.alternativeArrangements}
              onChange={(e) => updateField('alternativeArrangements', e.target.value)}
              placeholder="Had to hire another contractor, rented temporary accommodation, etc."
              rows={2}
            />
          </div>
        </div>
      </section>

      {/* Demand */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Your Demand</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="completionDeadline">Completion Deadline (days from notice) *</Label>
            <select
              id="completionDeadline"
              required
              value={formData.completionDeadline}
              onChange={(e) => updateField('completionDeadline', e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="7">7 days</option>
              <option value="15">15 days</option>
              <option value="30">30 days</option>
            </select>
          </div>
          <div>
            <Label htmlFor="compensationDemand">Compensation/Penalty Demand (Optional)</Label>
            <Textarea
              id="compensationDemand"
              value={formData.compensationDemand}
              onChange={(e) => updateField('compensationDemand', e.target.value)}
              placeholder="₹500 per day delay / Refund of advance / Completion at contractor's cost / etc."
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
