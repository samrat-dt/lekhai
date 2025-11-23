'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export interface FnfNotPaidFormData {
  // Your Details (Ex-Employee)
  senderName: string;
  senderAddress: string;
  senderPhone: string;
  senderEmail: string;

  // Company Details
  companyName: string;
  companyAddress: string;
  hrContactPerson: string;
  hrEmail: string;
  hrPhone: string;

  // Employment Details
  designation: string;
  employeeId: string;
  joiningDate: string;
  resignationDate: string;
  lastWorkingDay: string;
  noticePeriodServed: string; // yes/no/partial

  // FnF Details
  lastSalaryMonth: string;
  unpaidSalary: string;
  leaveEncashment: string;
  gratuityAmount: string;
  otherDues: string;
  totalFnfAmount: string;
  fnfDueDate: string; // as per company policy or offer letter

  // Follow-up Details
  followUpsMade: string; // number of emails/calls
  lastFollowUpDate: string;
  responsesReceived: string; // excuses given by HR

  // Additional Context
  documentsSubmitted: string; // resignation letter, exit formalities, etc.
  assetsClearedDate: string; // laptop, ID card returned on

  // Demand
  paymentDeadline: string; // days from notice
  additionalDemands: string; // interest, compensation for delay
  tone: 'polite' | 'firm' | 'strict';
}

interface FnfNotPaidFormProps {
  onSubmit: (data: FnfNotPaidFormData) => void;
  isSubmitting: boolean;
}

export default function FnfNotPaidForm({ onSubmit, isSubmitting }: FnfNotPaidFormProps) {
  const [formData, setFormData] = useState<FnfNotPaidFormData>({
    senderName: '',
    senderAddress: '',
    senderPhone: '',
    senderEmail: '',
    companyName: '',
    companyAddress: '',
    hrContactPerson: '',
    hrEmail: '',
    hrPhone: '',
    designation: '',
    employeeId: '',
    joiningDate: '',
    resignationDate: '',
    lastWorkingDay: '',
    noticePeriodServed: '',
    lastSalaryMonth: '',
    unpaidSalary: '',
    leaveEncashment: '',
    gratuityAmount: '',
    otherDues: '',
    totalFnfAmount: '',
    fnfDueDate: '',
    followUpsMade: '',
    lastFollowUpDate: '',
    responsesReceived: '',
    documentsSubmitted: '',
    assetsClearedDate: '',
    paymentDeadline: '15',
    additionalDemands: '',
    tone: 'firm',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateField = (field: keyof FnfNotPaidFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Your Details */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Your Details (Ex-Employee)</h2>
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
            <Label htmlFor="senderEmail">Email Address *</Label>
            <Input
              id="senderEmail"
              type="email"
              required
              value={formData.senderEmail}
              onChange={(e) => updateField('senderEmail', e.target.value)}
              placeholder="your@email.com"
            />
          </div>
        </div>
      </section>

      {/* Company Details */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Company Details</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="companyName">Company Name *</Label>
            <Input
              id="companyName"
              required
              value={formData.companyName}
              onChange={(e) => updateField('companyName', e.target.value)}
              placeholder="Full legal name of the company"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="companyAddress">Company Address *</Label>
            <Textarea
              id="companyAddress"
              required
              value={formData.companyAddress}
              onChange={(e) => updateField('companyAddress', e.target.value)}
              placeholder="Registered office address"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="hrContactPerson">HR Contact Person</Label>
            <Input
              id="hrContactPerson"
              value={formData.hrContactPerson}
              onChange={(e) => updateField('hrContactPerson', e.target.value)}
              placeholder="HR Manager name"
            />
          </div>
          <div>
            <Label htmlFor="hrEmail">HR Email</Label>
            <Input
              id="hrEmail"
              type="email"
              value={formData.hrEmail}
              onChange={(e) => updateField('hrEmail', e.target.value)}
              placeholder="hr@company.com"
            />
          </div>
          <div>
            <Label htmlFor="hrPhone">HR Phone Number</Label>
            <Input
              id="hrPhone"
              value={formData.hrPhone}
              onChange={(e) => updateField('hrPhone', e.target.value)}
              placeholder="+91 9876543210"
            />
          </div>
        </div>
      </section>

      {/* Employment Details */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Employment Details</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="designation">Designation *</Label>
            <Input
              id="designation"
              required
              value={formData.designation}
              onChange={(e) => updateField('designation', e.target.value)}
              placeholder="Your job title"
            />
          </div>
          <div>
            <Label htmlFor="employeeId">Employee ID</Label>
            <Input
              id="employeeId"
              value={formData.employeeId}
              onChange={(e) => updateField('employeeId', e.target.value)}
              placeholder="EMP12345"
            />
          </div>
          <div>
            <Label htmlFor="joiningDate">Date of Joining *</Label>
            <Input
              id="joiningDate"
              required
              type="date"
              value={formData.joiningDate}
              onChange={(e) => updateField('joiningDate', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="resignationDate">Resignation Date *</Label>
            <Input
              id="resignationDate"
              required
              type="date"
              value={formData.resignationDate}
              onChange={(e) => updateField('resignationDate', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="lastWorkingDay">Last Working Day *</Label>
            <Input
              id="lastWorkingDay"
              required
              type="date"
              value={formData.lastWorkingDay}
              onChange={(e) => updateField('lastWorkingDay', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="noticePeriodServed">Notice Period Served *</Label>
            <Input
              id="noticePeriodServed"
              required
              value={formData.noticePeriodServed}
              onChange={(e) => updateField('noticePeriodServed', e.target.value)}
              placeholder="Yes / No / Partial / Bought out"
            />
          </div>
        </div>
      </section>

      {/* FnF Details */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Full & Final Settlement Details</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="lastSalaryMonth">Last Salary Month</Label>
            <Input
              id="lastSalaryMonth"
              value={formData.lastSalaryMonth}
              onChange={(e) => updateField('lastSalaryMonth', e.target.value)}
              placeholder="March 2024"
            />
          </div>
          <div>
            <Label htmlFor="fnfDueDate">FnF Due Date (as per policy)</Label>
            <Input
              id="fnfDueDate"
              type="date"
              value={formData.fnfDueDate}
              onChange={(e) => updateField('fnfDueDate', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="unpaidSalary">Unpaid Salary (₹)</Label>
            <Input
              id="unpaidSalary"
              type="number"
              value={formData.unpaidSalary}
              onChange={(e) => updateField('unpaidSalary', e.target.value)}
              placeholder="50000"
            />
          </div>
          <div>
            <Label htmlFor="leaveEncashment">Leave Encashment (₹)</Label>
            <Input
              id="leaveEncashment"
              type="number"
              value={formData.leaveEncashment}
              onChange={(e) => updateField('leaveEncashment', e.target.value)}
              placeholder="15000"
            />
          </div>
          <div>
            <Label htmlFor="gratuityAmount">Gratuity (₹)</Label>
            <Input
              id="gratuityAmount"
              type="number"
              value={formData.gratuityAmount}
              onChange={(e) => updateField('gratuityAmount', e.target.value)}
              placeholder="75000"
            />
          </div>
          <div>
            <Label htmlFor="otherDues">Other Dues (₹)</Label>
            <Input
              id="otherDues"
              type="number"
              value={formData.otherDues}
              onChange={(e) => updateField('otherDues', e.target.value)}
              placeholder="Performance bonus, reimbursements, etc."
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="totalFnfAmount">Total FnF Amount (₹) *</Label>
            <Input
              id="totalFnfAmount"
              required
              type="number"
              value={formData.totalFnfAmount}
              onChange={(e) => updateField('totalFnfAmount', e.target.value)}
              placeholder="140000"
            />
          </div>
        </div>
      </section>

      {/* Follow-up Details */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Follow-up History</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="followUpsMade">Number of Follow-ups Made</Label>
            <Input
              id="followUpsMade"
              value={formData.followUpsMade}
              onChange={(e) => updateField('followUpsMade', e.target.value)}
              placeholder="5 emails, 3 calls"
            />
          </div>
          <div>
            <Label htmlFor="lastFollowUpDate">Last Follow-up Date</Label>
            <Input
              id="lastFollowUpDate"
              type="date"
              value={formData.lastFollowUpDate}
              onChange={(e) => updateField('lastFollowUpDate', e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="responsesReceived">Responses/Excuses Received</Label>
            <Textarea
              id="responsesReceived"
              value={formData.responsesReceived}
              onChange={(e) => updateField('responsesReceived', e.target.value)}
              placeholder="Processing, will be done next month, accounts team is working on it, etc."
              rows={2}
            />
          </div>
        </div>
      </section>

      {/* Additional Context */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Exit Formalities</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="documentsSubmitted">Documents Submitted</Label>
            <Textarea
              id="documentsSubmitted"
              value={formData.documentsSubmitted}
              onChange={(e) => updateField('documentsSubmitted', e.target.value)}
              placeholder="Resignation letter, handover notes, no-dues certificate, etc."
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="assetsClearedDate">Assets Cleared On</Label>
            <Input
              id="assetsClearedDate"
              type="date"
              value={formData.assetsClearedDate}
              onChange={(e) => updateField('assetsClearedDate', e.target.value)}
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
              placeholder="Interest on delayed payment, compensation for harassment, experience letter, relieving letter, etc."
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
