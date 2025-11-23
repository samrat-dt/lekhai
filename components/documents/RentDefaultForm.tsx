'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export interface RentDefaultFormData {
  // Landlord Details
  landlordName: string;
  landlordAddress: string;
  landlordPhone: string;
  landlordEmail: string;

  // Tenant Details
  tenantName: string;
  tenantPhone: string;
  tenantEmail: string;

  // Property Details
  propertyAddress: string;
  propertyType: string; // flat, house, shop, office

  // Rental Agreement Details
  monthlyRent: string;
  securityDeposit: string;
  agreementStartDate: string;
  agreementDuration: string; // 11 months, 2 years, etc.

  // Default Details
  unpaidMonths: string; // which months
  totalUnpaidRent: string;
  lastPaidMonth: string;
  lastPaidDate: string;

  // Follow-up Details
  remindersSent: string;
  lastReminderDate: string;
  tenantResponse: string;

  // Additional Issues
  maintenanceIssues: string; // property damage, unauthorized modifications
  otherViolations: string; // subletting, illegal activities, noise complaints

  // Demand
  paymentDeadline: string;
  lateFeeOrPenalty: string;
  actionIfNotPaid: string; // eviction, legal action
  tone: 'polite' | 'firm' | 'strict';
}

interface RentDefaultFormProps {
  onSubmit: (data: RentDefaultFormData) => void;
  isSubmitting: boolean;
}

export default function RentDefaultForm({ onSubmit, isSubmitting }: RentDefaultFormProps) {
  const [formData, setFormData] = useState<RentDefaultFormData>({
    landlordName: '',
    landlordAddress: '',
    landlordPhone: '',
    landlordEmail: '',
    tenantName: '',
    tenantPhone: '',
    tenantEmail: '',
    propertyAddress: '',
    propertyType: '',
    monthlyRent: '',
    securityDeposit: '',
    agreementStartDate: '',
    agreementDuration: '',
    unpaidMonths: '',
    totalUnpaidRent: '',
    lastPaidMonth: '',
    lastPaidDate: '',
    remindersSent: '',
    lastReminderDate: '',
    tenantResponse: '',
    maintenanceIssues: '',
    otherViolations: '',
    paymentDeadline: '7',
    lateFeeOrPenalty: '',
    actionIfNotPaid: '',
    tone: 'firm',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateField = (field: keyof RentDefaultFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Landlord Details */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Your Details (Landlord)</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="landlordName">Full Name *</Label>
            <Input
              id="landlordName"
              required
              value={formData.landlordName}
              onChange={(e) => updateField('landlordName', e.target.value)}
              placeholder="Your full name"
            />
          </div>
          <div>
            <Label htmlFor="landlordPhone">Phone Number *</Label>
            <Input
              id="landlordPhone"
              required
              value={formData.landlordPhone}
              onChange={(e) => updateField('landlordPhone', e.target.value)}
              placeholder="+91 9876543210"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="landlordAddress">Your Address *</Label>
            <Textarea
              id="landlordAddress"
              required
              value={formData.landlordAddress}
              onChange={(e) => updateField('landlordAddress', e.target.value)}
              placeholder="Your residential address"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="landlordEmail">Email Address</Label>
            <Input
              id="landlordEmail"
              type="email"
              value={formData.landlordEmail}
              onChange={(e) => updateField('landlordEmail', e.target.value)}
              placeholder="your@email.com"
            />
          </div>
        </div>
      </section>

      {/* Tenant Details */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Tenant Details</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="tenantName">Tenant Full Name *</Label>
            <Input
              id="tenantName"
              required
              value={formData.tenantName}
              onChange={(e) => updateField('tenantName', e.target.value)}
              placeholder="Tenant's name"
            />
          </div>
          <div>
            <Label htmlFor="tenantPhone">Tenant Phone Number</Label>
            <Input
              id="tenantPhone"
              value={formData.tenantPhone}
              onChange={(e) => updateField('tenantPhone', e.target.value)}
              placeholder="+91 9876543210"
            />
          </div>
          <div>
            <Label htmlFor="tenantEmail">Tenant Email</Label>
            <Input
              id="tenantEmail"
              type="email"
              value={formData.tenantEmail}
              onChange={(e) => updateField('tenantEmail', e.target.value)}
              placeholder="tenant@email.com"
            />
          </div>
        </div>
      </section>

      {/* Property Details */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Property Details</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="propertyAddress">Property Address *</Label>
            <Textarea
              id="propertyAddress"
              required
              value={formData.propertyAddress}
              onChange={(e) => updateField('propertyAddress', e.target.value)}
              placeholder="Complete address of the rented property"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="propertyType">Property Type *</Label>
            <Input
              id="propertyType"
              required
              value={formData.propertyType}
              onChange={(e) => updateField('propertyType', e.target.value)}
              placeholder="Flat / House / Shop / Office / Commercial Space"
            />
          </div>
        </div>
      </section>

      {/* Rental Agreement Details */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Rental Agreement Details</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="monthlyRent">Monthly Rent (₹) *</Label>
            <Input
              id="monthlyRent"
              required
              type="number"
              value={formData.monthlyRent}
              onChange={(e) => updateField('monthlyRent', e.target.value)}
              placeholder="15000"
            />
          </div>
          <div>
            <Label htmlFor="securityDeposit">Security Deposit (₹)</Label>
            <Input
              id="securityDeposit"
              type="number"
              value={formData.securityDeposit}
              onChange={(e) => updateField('securityDeposit', e.target.value)}
              placeholder="45000"
            />
          </div>
          <div>
            <Label htmlFor="agreementStartDate">Agreement Start Date *</Label>
            <Input
              id="agreementStartDate"
              required
              type="date"
              value={formData.agreementStartDate}
              onChange={(e) => updateField('agreementStartDate', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="agreementDuration">Agreement Duration</Label>
            <Input
              id="agreementDuration"
              value={formData.agreementDuration}
              onChange={(e) => updateField('agreementDuration', e.target.value)}
              placeholder="11 months / 2 years / Month-to-month"
            />
          </div>
        </div>
      </section>

      {/* Default Details */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Rent Default Details</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="unpaidMonths">Unpaid Months *</Label>
            <Input
              id="unpaidMonths"
              required
              value={formData.unpaidMonths}
              onChange={(e) => updateField('unpaidMonths', e.target.value)}
              placeholder="January 2024, February 2024, March 2024"
            />
          </div>
          <div>
            <Label htmlFor="totalUnpaidRent">Total Unpaid Rent (₹) *</Label>
            <Input
              id="totalUnpaidRent"
              required
              type="number"
              value={formData.totalUnpaidRent}
              onChange={(e) => updateField('totalUnpaidRent', e.target.value)}
              placeholder="45000"
            />
          </div>
          <div>
            <Label htmlFor="lastPaidMonth">Last Paid Month</Label>
            <Input
              id="lastPaidMonth"
              value={formData.lastPaidMonth}
              onChange={(e) => updateField('lastPaidMonth', e.target.value)}
              placeholder="December 2023"
            />
          </div>
          <div>
            <Label htmlFor="lastPaidDate">Last Payment Date</Label>
            <Input
              id="lastPaidDate"
              type="date"
              value={formData.lastPaidDate}
              onChange={(e) => updateField('lastPaidDate', e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Follow-up Details */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Follow-up History</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="remindersSent">Number of Reminders Sent</Label>
            <Input
              id="remindersSent"
              value={formData.remindersSent}
              onChange={(e) => updateField('remindersSent', e.target.value)}
              placeholder="5 calls, 3 messages"
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
          <div className="md:col-span-2">
            <Label htmlFor="tenantResponse">Tenant's Response/Excuses</Label>
            <Textarea
              id="tenantResponse"
              value={formData.tenantResponse}
              onChange={(e) => updateField('tenantResponse', e.target.value)}
              placeholder="Will pay next week, job loss, medical emergency, avoiding calls, etc."
              rows={2}
            />
          </div>
        </div>
      </section>

      {/* Additional Issues */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Additional Issues (Optional)</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="maintenanceIssues">Property Damage/Maintenance Issues</Label>
            <Textarea
              id="maintenanceIssues"
              value={formData.maintenanceIssues}
              onChange={(e) => updateField('maintenanceIssues', e.target.value)}
              placeholder="Broken fixtures, wall damage, unauthorized modifications, etc."
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="otherViolations">Other Agreement Violations</Label>
            <Textarea
              id="otherViolations"
              value={formData.otherViolations}
              onChange={(e) => updateField('otherViolations', e.target.value)}
              placeholder="Subletting, unauthorized occupants, noise complaints, illegal activities, etc."
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
            <Label htmlFor="lateFeeOrPenalty">Late Fee/Penalty (Optional)</Label>
            <Input
              id="lateFeeOrPenalty"
              value={formData.lateFeeOrPenalty}
              onChange={(e) => updateField('lateFeeOrPenalty', e.target.value)}
              placeholder="₹500 per month / 10% interest / As per agreement"
            />
          </div>
          <div>
            <Label htmlFor="actionIfNotPaid">Action If Not Paid</Label>
            <Input
              id="actionIfNotPaid"
              value={formData.actionIfNotPaid}
              onChange={(e) => updateField('actionIfNotPaid', e.target.value)}
              placeholder="Eviction proceedings / Legal action / Forfeiture of security deposit"
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
