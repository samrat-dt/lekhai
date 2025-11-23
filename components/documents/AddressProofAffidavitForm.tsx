'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export interface AddressProofAffidavitFormData {
  // Deponent Details
  deponentName: string;
  fatherName: string;
  age: string;
  occupation: string;
  phone: string;
  email: string;

  // Address Details
  currentAddress: string;
  residingSince: string; // date or duration
  residenceType: string; // owned, rented, parents' house, etc.

  // For Rented Accommodation
  landlordName: string;
  landlordContact: string;

  // Supporting Documents Available
  supportingDocuments: string; // ration card, electricity bill, rent agreement, etc.

  // Purpose
  purposeOfAffidavit: string; // for bank account, SIM card, school admission, etc.

  // Place of Execution
  placeOfExecution: string;
}

interface AddressProofAffidavitFormProps {
  onSubmit: (data: AddressProofAffidavitFormData) => void;
  isSubmitting: boolean;
}

export default function AddressProofAffidavitForm({ onSubmit, isSubmitting }: AddressProofAffidavitFormProps) {
  const [formData, setFormData] = useState<AddressProofAffidavitFormData>({
    deponentName: '',
    fatherName: '',
    age: '',
    occupation: '',
    phone: '',
    email: '',
    currentAddress: '',
    residingSince: '',
    residenceType: '',
    landlordName: '',
    landlordContact: '',
    supportingDocuments: '',
    purposeOfAffidavit: '',
    placeOfExecution: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateField = (field: keyof AddressProofAffidavitFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Deponent Details */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Your Details (Deponent)</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="deponentName">Full Name *</Label>
            <Input
              id="deponentName"
              required
              value={formData.deponentName}
              onChange={(e) => updateField('deponentName', e.target.value)}
              placeholder="Your full name"
            />
          </div>
          <div>
            <Label htmlFor="fatherName">Father's/Husband's Name *</Label>
            <Input
              id="fatherName"
              required
              value={formData.fatherName}
              onChange={(e) => updateField('fatherName', e.target.value)}
              placeholder="Father's or husband's name"
            />
          </div>
          <div>
            <Label htmlFor="age">Age *</Label>
            <Input
              id="age"
              required
              type="number"
              value={formData.age}
              onChange={(e) => updateField('age', e.target.value)}
              placeholder="25"
            />
          </div>
          <div>
            <Label htmlFor="occupation">Occupation *</Label>
            <Input
              id="occupation"
              required
              value={formData.occupation}
              onChange={(e) => updateField('occupation', e.target.value)}
              placeholder="Software Engineer / Student / Business / etc."
            />
          </div>
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
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="your@email.com"
            />
          </div>
        </div>
      </section>

      {/* Address Details */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Address Details</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="currentAddress">Current Residential Address *</Label>
            <Textarea
              id="currentAddress"
              required
              value={formData.currentAddress}
              onChange={(e) => updateField('currentAddress', e.target.value)}
              placeholder="House/Flat No., Building, Street, Area, City, State, PIN"
              rows={3}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="residingSince">Residing Since *</Label>
              <Input
                id="residingSince"
                required
                value={formData.residingSince}
                onChange={(e) => updateField('residingSince', e.target.value)}
                placeholder="January 2020 / 3 years / 01/01/2020"
              />
            </div>
            <div>
              <Label htmlFor="residenceType">Residence Type *</Label>
              <Input
                id="residenceType"
                required
                value={formData.residenceType}
                onChange={(e) => updateField('residenceType', e.target.value)}
                placeholder="Owned / Rented / Parents' House / Company Accommodation / etc."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Landlord Details (if rented) */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Landlord Details (If Rented)</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="landlordName">Landlord Name</Label>
            <Input
              id="landlordName"
              value={formData.landlordName}
              onChange={(e) => updateField('landlordName', e.target.value)}
              placeholder="Property owner's name"
            />
          </div>
          <div>
            <Label htmlFor="landlordContact">Landlord Contact</Label>
            <Input
              id="landlordContact"
              value={formData.landlordContact}
              onChange={(e) => updateField('landlordContact', e.target.value)}
              placeholder="+91 9876543210"
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">Leave blank if not applicable</p>
      </section>

      {/* Supporting Documents */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Supporting Documents</h2>
        <div>
          <Label htmlFor="supportingDocuments">Documents Available</Label>
          <Textarea
            id="supportingDocuments"
            value={formData.supportingDocuments}
            onChange={(e) => updateField('supportingDocuments', e.target.value)}
            placeholder="Ration card, electricity bill, rent agreement, Aadhaar with current address, etc."
            rows={2}
          />
          <p className="text-xs text-gray-500 mt-1">List any documents that show this address</p>
        </div>
      </section>

      {/* Purpose */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Purpose of Affidavit</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="purposeOfAffidavit">Purpose *</Label>
            <Input
              id="purposeOfAffidavit"
              required
              value={formData.purposeOfAffidavit}
              onChange={(e) => updateField('purposeOfAffidavit', e.target.value)}
              placeholder="For bank account / SIM card / School admission / Passport application / etc."
            />
          </div>
          <div>
            <Label htmlFor="placeOfExecution">Place of Execution *</Label>
            <Input
              id="placeOfExecution"
              required
              value={formData.placeOfExecution}
              onChange={(e) => updateField('placeOfExecution', e.target.value)}
              placeholder="Mumbai / Delhi / Bangalore / etc."
            />
          </div>
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
            'Generate Affidavit'
          )}
        </Button>
      </div>
    </form>
  );
}
