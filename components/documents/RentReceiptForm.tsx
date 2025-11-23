'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export interface RentReceiptFormData {
  // Landlord Details (Issuer)
  landlordName: string;
  landlordAddress: string;
  landlordPAN: string;
  landlordPhone: string;

  // Tenant Details (Receiver)
  tenantName: string;
  tenantAddress: string;
  tenantPAN: string;

  // Property Details
  propertyAddress: string;

  // Rent Details
  monthlyRent: string;
  rentPeriod: string; // April 2024, Q1 2024, etc.
  rentMonth: string; // for single month generation
  rentYear: string;

  // Payment Details
  amountPaid: string;
  paymentDate: string;
  paymentMode: string; // Cash, Cheque, Online Transfer, UPI
  transactionReference: string; // Cheque no, UPI ref, etc.

  // Receipt Details
  receiptNumber: string;
  receiptDate: string;

  // Bulk Generation (Optional)
  generateBulk: string; // yes/no
  bulkStartMonth: string;
  bulkEndMonth: string;

  // Additional Details
  additionalRemarks: string;
}

interface RentReceiptFormProps {
  onSubmit: (data: RentReceiptFormData) => void;
  isSubmitting: boolean;
}

export default function RentReceiptForm({ onSubmit, isSubmitting }: RentReceiptFormProps) {
  const [formData, setFormData] = useState<RentReceiptFormData>({
    landlordName: '',
    landlordAddress: '',
    landlordPAN: '',
    landlordPhone: '',
    tenantName: '',
    tenantAddress: '',
    tenantPAN: '',
    propertyAddress: '',
    monthlyRent: '',
    rentPeriod: '',
    rentMonth: '',
    rentYear: new Date().getFullYear().toString(),
    amountPaid: '',
    paymentDate: '',
    paymentMode: '',
    transactionReference: '',
    receiptNumber: '',
    receiptDate: new Date().toISOString().split('T')[0],
    generateBulk: 'no',
    bulkStartMonth: '',
    bulkEndMonth: '',
    additionalRemarks: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateField = (field: keyof RentReceiptFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Landlord Details */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Landlord Details (Issuer)</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="landlordName">Landlord Full Name *</Label>
            <Input
              id="landlordName"
              required
              value={formData.landlordName}
              onChange={(e) => updateField('landlordName', e.target.value)}
              placeholder="Property owner's name"
            />
          </div>
          <div>
            <Label htmlFor="landlordPAN">Landlord PAN Number</Label>
            <Input
              id="landlordPAN"
              value={formData.landlordPAN}
              onChange={(e) => updateField('landlordPAN', e.target.value)}
              placeholder="ABCDE1234F"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="landlordAddress">Landlord Address *</Label>
            <Textarea
              id="landlordAddress"
              required
              value={formData.landlordAddress}
              onChange={(e) => updateField('landlordAddress', e.target.value)}
              placeholder="Complete address"
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="landlordPhone">Landlord Phone</Label>
            <Input
              id="landlordPhone"
              value={formData.landlordPhone}
              onChange={(e) => updateField('landlordPhone', e.target.value)}
              placeholder="+91 9876543210"
            />
          </div>
        </div>
      </section>

      {/* Tenant Details */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Tenant Details (Receiver)</h2>
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
            <Label htmlFor="tenantPAN">Tenant PAN Number</Label>
            <Input
              id="tenantPAN"
              value={formData.tenantPAN}
              onChange={(e) => updateField('tenantPAN', e.target.value)}
              placeholder="ABCDE1234F"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="tenantAddress">Tenant Address</Label>
            <Textarea
              id="tenantAddress"
              value={formData.tenantAddress}
              onChange={(e) => updateField('tenantAddress', e.target.value)}
              placeholder="Current address"
              rows={2}
            />
          </div>
        </div>
      </section>

      {/* Property Details */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Rented Property Details</h2>
        <div>
          <Label htmlFor="propertyAddress">Property Address *</Label>
          <Textarea
            id="propertyAddress"
            required
            value={formData.propertyAddress}
            onChange={(e) => updateField('propertyAddress', e.target.value)}
            placeholder="Complete address of rented property"
            rows={3}
          />
        </div>
      </section>

      {/* Rent Details */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Rent Details</h2>
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
            <Label htmlFor="amountPaid">Amount Paid (₹) *</Label>
            <Input
              id="amountPaid"
              required
              type="number"
              value={formData.amountPaid}
              onChange={(e) => updateField('amountPaid', e.target.value)}
              placeholder="15000"
            />
          </div>
        </div>
      </section>

      {/* Period Selection */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Rent Period</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="generateBulk">Generate Multiple Receipts? *</Label>
            <select
              id="generateBulk"
              required
              value={formData.generateBulk}
              onChange={(e) => updateField('generateBulk', e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="no">Single Month Receipt</option>
              <option value="yes">Multiple Months (Bulk)</option>
            </select>
          </div>

          {formData.generateBulk === 'no' ? (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rentMonth">Rent Month *</Label>
                <select
                  id="rentMonth"
                  required={formData.generateBulk === 'no'}
                  value={formData.rentMonth}
                  onChange={(e) => updateField('rentMonth', e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="">Select month</option>
                  <option value="01">January</option>
                  <option value="02">February</option>
                  <option value="03">March</option>
                  <option value="04">April</option>
                  <option value="05">May</option>
                  <option value="06">June</option>
                  <option value="07">July</option>
                  <option value="08">August</option>
                  <option value="09">September</option>
                  <option value="10">October</option>
                  <option value="11">November</option>
                  <option value="12">December</option>
                </select>
              </div>
              <div>
                <Label htmlFor="rentYear">Rent Year *</Label>
                <Input
                  id="rentYear"
                  required={formData.generateBulk === 'no'}
                  type="number"
                  value={formData.rentYear}
                  onChange={(e) => updateField('rentYear', e.target.value)}
                  placeholder="2024"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bulkStartMonth">Start Month *</Label>
                  <Input
                    id="bulkStartMonth"
                    required={formData.generateBulk === 'yes'}
                    type="month"
                    value={formData.bulkStartMonth}
                    onChange={(e) => updateField('bulkStartMonth', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="bulkEndMonth">End Month *</Label>
                  <Input
                    id="bulkEndMonth"
                    required={formData.generateBulk === 'yes'}
                    type="month"
                    value={formData.bulkEndMonth}
                    onChange={(e) => updateField('bulkEndMonth', e.target.value)}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500">Multiple receipts will be generated, one for each month</p>
            </div>
          )}
        </div>
      </section>

      {/* Payment Details */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Payment Details</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="paymentDate">Payment Date *</Label>
            <Input
              id="paymentDate"
              required
              type="date"
              value={formData.paymentDate}
              onChange={(e) => updateField('paymentDate', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="paymentMode">Payment Mode *</Label>
            <select
              id="paymentMode"
              required
              value={formData.paymentMode}
              onChange={(e) => updateField('paymentMode', e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">Select mode</option>
              <option value="Cash">Cash</option>
              <option value="Cheque">Cheque</option>
              <option value="Online Transfer">Online Transfer / NEFT / RTGS</option>
              <option value="UPI">UPI</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="transactionReference">Transaction Reference</Label>
            <Input
              id="transactionReference"
              value={formData.transactionReference}
              onChange={(e) => updateField('transactionReference', e.target.value)}
              placeholder="Cheque No / UPI Ref / Transaction ID (if applicable)"
            />
          </div>
        </div>
      </section>

      {/* Receipt Details */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Receipt Details</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="receiptNumber">Receipt Number</Label>
            <Input
              id="receiptNumber"
              value={formData.receiptNumber}
              onChange={(e) => updateField('receiptNumber', e.target.value)}
              placeholder="Auto-generated if left blank"
            />
          </div>
          <div>
            <Label htmlFor="receiptDate">Receipt Date *</Label>
            <Input
              id="receiptDate"
              required
              type="date"
              value={formData.receiptDate}
              onChange={(e) => updateField('receiptDate', e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Additional Remarks */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Additional Details</h2>
        <div>
          <Label htmlFor="additionalRemarks">Additional Remarks</Label>
          <Textarea
            id="additionalRemarks"
            value={formData.additionalRemarks}
            onChange={(e) => updateField('additionalRemarks', e.target.value)}
            placeholder="Any additional notes (optional)"
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
            'Generate Receipt'
          )}
        </Button>
      </div>
    </form>
  );
}
