'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export interface BankRequestLetterFormData {
  // Account Holder Details
  accountHolderName: string;
  accountNumber: string;
  accountType: string; // Savings, Current, etc.
  ifscCode: string;
  branchName: string;
  customerID: string;

  // Contact Details
  phone: string;
  email: string;
  registeredAddress: string;

  // Request Type
  requestType: string; // account_closure, address_change, cheque_book, statement, etc.

  // Request-Specific Fields
  // For Account Closure
  closureReason: string;
  balanceTransferMode: string; // cheque, transfer to another account, cash
  transferAccountNumber: string;
  transferIFSC: string;

  // For Address Change
  newAddress: string;
  addressProof: string; // type of document being submitted

  // For Cheque Book
  chequeBookType: string; // 10 leaves, 25 leaves, 50 leaves
  deliveryMode: string; // branch pickup, registered address

  // For Statement Request
  statementPeriod: string; // last 3 months, 6 months, 1 year, custom
  statementFromDate: string;
  statementToDate: string;
  statementFormat: string; // email, physical copy

  // Additional Details
  additionalRemarks: string;
}

interface BankRequestLetterFormProps {
  onSubmit: (data: BankRequestLetterFormData) => void;
  isSubmitting: boolean;
}

export default function BankRequestLetterForm({ onSubmit, isSubmitting }: BankRequestLetterFormProps) {
  const [formData, setFormData] = useState<BankRequestLetterFormData>({
    accountHolderName: '',
    accountNumber: '',
    accountType: '',
    ifscCode: '',
    branchName: '',
    customerID: '',
    phone: '',
    email: '',
    registeredAddress: '',
    requestType: '',
    closureReason: '',
    balanceTransferMode: '',
    transferAccountNumber: '',
    transferIFSC: '',
    newAddress: '',
    addressProof: '',
    chequeBookType: '',
    deliveryMode: '',
    statementPeriod: '',
    statementFromDate: '',
    statementToDate: '',
    statementFormat: '',
    additionalRemarks: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateField = (field: keyof BankRequestLetterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Account Details */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Account Details</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="accountHolderName">Account Holder Name *</Label>
            <Input
              id="accountHolderName"
              required
              value={formData.accountHolderName}
              onChange={(e) => updateField('accountHolderName', e.target.value)}
              placeholder="Your full name as per bank records"
            />
          </div>
          <div>
            <Label htmlFor="accountNumber">Account Number *</Label>
            <Input
              id="accountNumber"
              required
              value={formData.accountNumber}
              onChange={(e) => updateField('accountNumber', e.target.value)}
              placeholder="1234567890123456"
            />
          </div>
          <div>
            <Label htmlFor="accountType">Account Type</Label>
            <Input
              id="accountType"
              value={formData.accountType}
              onChange={(e) => updateField('accountType', e.target.value)}
              placeholder="Savings / Current / Salary / etc."
            />
          </div>
          <div>
            <Label htmlFor="ifscCode">IFSC Code</Label>
            <Input
              id="ifscCode"
              value={formData.ifscCode}
              onChange={(e) => updateField('ifscCode', e.target.value)}
              placeholder="HDFC0001234"
            />
          </div>
          <div>
            <Label htmlFor="branchName">Branch Name *</Label>
            <Input
              id="branchName"
              required
              value={formData.branchName}
              onChange={(e) => updateField('branchName', e.target.value)}
              placeholder="Koramangala Branch"
            />
          </div>
          <div>
            <Label htmlFor="customerID">Customer ID</Label>
            <Input
              id="customerID"
              value={formData.customerID}
              onChange={(e) => updateField('customerID', e.target.value)}
              placeholder="CIF/Customer ID"
            />
          </div>
        </div>
      </section>

      {/* Contact Details */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Contact Details</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              required
              value={formData.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder="+91 9876543210"
            />
          </div>
          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="your@email.com"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="registeredAddress">Registered Address</Label>
            <Textarea
              id="registeredAddress"
              value={formData.registeredAddress}
              onChange={(e) => updateField('registeredAddress', e.target.value)}
              placeholder="Address as per bank records"
              rows={2}
            />
          </div>
        </div>
      </section>

      {/* Request Type */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Request Type</h2>
        <div>
          <Label htmlFor="requestType">Type of Request *</Label>
          <select
            id="requestType"
            required
            value={formData.requestType}
            onChange={(e) => updateField('requestType', e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">Select request type</option>
            <option value="account_closure">Account Closure</option>
            <option value="address_change">Address Change</option>
            <option value="cheque_book">Cheque Book Request</option>
            <option value="statement">Account Statement Request</option>
            <option value="other">Other Request</option>
          </select>
        </div>
      </section>

      {/* Account Closure Fields */}
      {formData.requestType === 'account_closure' && (
        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Account Closure Details</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="closureReason">Reason for Closure</Label>
              <Textarea
                id="closureReason"
                value={formData.closureReason}
                onChange={(e) => updateField('closureReason', e.target.value)}
                placeholder="Shifting to another city, switching to another bank, etc."
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="balanceTransferMode">Balance Transfer Mode *</Label>
              <Input
                id="balanceTransferMode"
                required={formData.requestType === 'account_closure'}
                value={formData.balanceTransferMode}
                onChange={(e) => updateField('balanceTransferMode', e.target.value)}
                placeholder="Cheque / Transfer to another account / Cash"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="transferAccountNumber">Transfer to Account (if applicable)</Label>
                <Input
                  id="transferAccountNumber"
                  value={formData.transferAccountNumber}
                  onChange={(e) => updateField('transferAccountNumber', e.target.value)}
                  placeholder="Account number"
                />
              </div>
              <div>
                <Label htmlFor="transferIFSC">Transfer Account IFSC</Label>
                <Input
                  id="transferIFSC"
                  value={formData.transferIFSC}
                  onChange={(e) => updateField('transferIFSC', e.target.value)}
                  placeholder="IFSC code"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Address Change Fields */}
      {formData.requestType === 'address_change' && (
        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Address Change Details</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newAddress">New Address *</Label>
              <Textarea
                id="newAddress"
                required={formData.requestType === 'address_change'}
                value={formData.newAddress}
                onChange={(e) => updateField('newAddress', e.target.value)}
                placeholder="Complete new address"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="addressProof">Address Proof Submitted *</Label>
              <Input
                id="addressProof"
                required={formData.requestType === 'address_change'}
                value={formData.addressProof}
                onChange={(e) => updateField('addressProof', e.target.value)}
                placeholder="Aadhaar / Passport / Utility Bill / Rent Agreement / etc."
              />
            </div>
          </div>
        </section>
      )}

      {/* Cheque Book Fields */}
      {formData.requestType === 'cheque_book' && (
        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Cheque Book Details</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="chequeBookType">Cheque Book Type *</Label>
              <select
                id="chequeBookType"
                required={formData.requestType === 'cheque_book'}
                value={formData.chequeBookType}
                onChange={(e) => updateField('chequeBookType', e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">Select type</option>
                <option value="10">10 Leaves</option>
                <option value="25">25 Leaves</option>
                <option value="50">50 Leaves</option>
              </select>
            </div>
            <div>
              <Label htmlFor="deliveryMode">Delivery Mode *</Label>
              <select
                id="deliveryMode"
                required={formData.requestType === 'cheque_book'}
                value={formData.deliveryMode}
                onChange={(e) => updateField('deliveryMode', e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">Select mode</option>
                <option value="branch">Branch Pickup</option>
                <option value="registered_address">Registered Address</option>
              </select>
            </div>
          </div>
        </section>
      )}

      {/* Statement Request Fields */}
      {formData.requestType === 'statement' && (
        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Statement Request Details</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="statementPeriod">Statement Period *</Label>
              <select
                id="statementPeriod"
                required={formData.requestType === 'statement'}
                value={formData.statementPeriod}
                onChange={(e) => updateField('statementPeriod', e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">Select period</option>
                <option value="3_months">Last 3 Months</option>
                <option value="6_months">Last 6 Months</option>
                <option value="1_year">Last 1 Year</option>
                <option value="custom">Custom Period</option>
              </select>
            </div>
            {formData.statementPeriod === 'custom' && (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="statementFromDate">From Date *</Label>
                  <Input
                    id="statementFromDate"
                    type="date"
                    required={formData.statementPeriod === 'custom'}
                    value={formData.statementFromDate}
                    onChange={(e) => updateField('statementFromDate', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="statementToDate">To Date *</Label>
                  <Input
                    id="statementToDate"
                    type="date"
                    required={formData.statementPeriod === 'custom'}
                    value={formData.statementToDate}
                    onChange={(e) => updateField('statementToDate', e.target.value)}
                  />
                </div>
              </div>
            )}
            <div>
              <Label htmlFor="statementFormat">Statement Format *</Label>
              <select
                id="statementFormat"
                required={formData.requestType === 'statement'}
                value={formData.statementFormat}
                onChange={(e) => updateField('statementFormat', e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">Select format</option>
                <option value="email">Email (PDF)</option>
                <option value="physical">Physical Copy</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>
        </section>
      )}

      {/* Additional Remarks */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Additional Details</h2>
        <div>
          <Label htmlFor="additionalRemarks">Additional Remarks</Label>
          <Textarea
            id="additionalRemarks"
            value={formData.additionalRemarks}
            onChange={(e) => updateField('additionalRemarks', e.target.value)}
            placeholder="Any additional information or special requests"
            rows={2}
          />
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
            'Generate Letter'
          )}
        </Button>
      </div>
    </form>
  );
}
