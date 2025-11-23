'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export interface NameCorrectionAffidavitFormData {
  // Deponent Details
  deponentName: string;
  fatherName: string;
  age: string;
  occupation: string;
  currentAddress: string;
  phone: string;
  email: string;

  // Name Details
  incorrectName: string;
  correctName: string;
  reasonForCorrection: string; // spelling error, typo, wrong surname, etc.

  // Document Where Error Exists
  documentType: string; // Aadhaar, PAN, Passport, Bank Account, School Certificate, etc.
  documentNumber: string;
  issuingAuthority: string;

  // Supporting Evidence
  supportingDocuments: string; // Birth certificate, school records, etc.

  // Purpose
  purposeOfAffidavit: string; // for correction in Aadhaar, for bank records, etc.

  // Place of Execution
  placeOfExecution: string;
}

interface NameCorrectionAffidavitFormProps {
  onSubmit: (data: NameCorrectionAffidavitFormData) => void;
  isSubmitting: boolean;
}

export default function NameCorrectionAffidavitForm({ onSubmit, isSubmitting }: NameCorrectionAffidavitFormProps) {
  const [formData, setFormData] = useState<NameCorrectionAffidavitFormData>({
    deponentName: '',
    fatherName: '',
    age: '',
    occupation: '',
    currentAddress: '',
    phone: '',
    email: '',
    incorrectName: '',
    correctName: '',
    reasonForCorrection: '',
    documentType: '',
    documentNumber: '',
    issuingAuthority: '',
    supportingDocuments: '',
    purposeOfAffidavit: '',
    placeOfExecution: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateField = (field: keyof NameCorrectionAffidavitFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Deponent Details */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Your Details (Deponent)</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="deponentName">Full Name (Correct) *</Label>
            <Input
              id="deponentName"
              required
              value={formData.deponentName}
              onChange={(e) => updateField('deponentName', e.target.value)}
              placeholder="Your correct full name"
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
          <div className="md:col-span-2">
            <Label htmlFor="currentAddress">Current Address *</Label>
            <Textarea
              id="currentAddress"
              required
              value={formData.currentAddress}
              onChange={(e) => updateField('currentAddress', e.target.value)}
              placeholder="House/Flat No., Building, Street, Area, City, State, PIN"
              rows={3}
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

      {/* Name Details */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Name Correction Details</h2>
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="incorrectName">Incorrect Name (As Written) *</Label>
              <Input
                id="incorrectName"
                required
                value={formData.incorrectName}
                onChange={(e) => updateField('incorrectName', e.target.value)}
                placeholder="Rahul Kuamr / Priya Shrama / etc."
              />
            </div>
            <div>
              <Label htmlFor="correctName">Correct Name (Should Be) *</Label>
              <Input
                id="correctName"
                required
                value={formData.correctName}
                onChange={(e) => updateField('correctName', e.target.value)}
                placeholder="Rahul Kumar / Priya Sharma / etc."
              />
            </div>
          </div>
          <div>
            <Label htmlFor="reasonForCorrection">Reason for Correction *</Label>
            <Textarea
              id="reasonForCorrection"
              required
              value={formData.reasonForCorrection}
              onChange={(e) => updateField('reasonForCorrection', e.target.value)}
              placeholder="Spelling error / Typo mistake / Wrong surname / Name shortened / etc."
              rows={2}
            />
          </div>
        </div>
      </section>

      {/* Document Details */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Document Where Error Exists</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="documentType">Document Type *</Label>
            <Input
              id="documentType"
              required
              value={formData.documentType}
              onChange={(e) => updateField('documentType', e.target.value)}
              placeholder="Aadhaar / PAN Card / Passport / Bank Account / School Certificate / etc."
            />
          </div>
          <div>
            <Label htmlFor="documentNumber">Document Number</Label>
            <Input
              id="documentNumber"
              value={formData.documentNumber}
              onChange={(e) => updateField('documentNumber', e.target.value)}
              placeholder="1234 5678 9012 / ABCDE1234F / etc."
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="issuingAuthority">Issuing Authority</Label>
            <Input
              id="issuingAuthority"
              value={formData.issuingAuthority}
              onChange={(e) => updateField('issuingAuthority', e.target.value)}
              placeholder="UIDAI / Income Tax Dept / State Board / Bank Name / etc."
            />
          </div>
        </div>
      </section>

      {/* Supporting Evidence */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Supporting Evidence</h2>
        <div>
          <Label htmlFor="supportingDocuments">Supporting Documents Available</Label>
          <Textarea
            id="supportingDocuments"
            value={formData.supportingDocuments}
            onChange={(e) => updateField('supportingDocuments', e.target.value)}
            placeholder="Birth certificate, school leaving certificate, passport, other ID with correct name, etc."
            rows={2}
          />
          <p className="text-xs text-gray-500 mt-1">List documents that show your correct name</p>
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
              placeholder="For Aadhaar name correction / For bank records / For passport correction / etc."
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
