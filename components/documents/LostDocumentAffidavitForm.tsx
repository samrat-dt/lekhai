'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export interface LostDocumentAffidavitFormData {
  // Deponent Details (Person making the affidavit)
  deponentName: string;
  fatherName: string;
  age: string;
  occupation: string;
  currentAddress: string;
  permanentAddress: string;
  phone: string;
  email: string;

  // Document Details
  documentType: string; // PAN Card, Aadhaar, Passport, Driving License, etc.
  documentNumber: string;
  issuingAuthority: string;
  dateOfIssue: string;

  // Loss Details
  lostDate: string;
  lostLocation: string;
  circumstancesOfLoss: string;

  // FIR Details
  firLodged: string; // yes/no
  firNumber: string;
  policeStation: string;
  firDate: string;

  // Purpose
  purposeOfAffidavit: string; // for duplicate, for records, for bank, etc.

  // Place of Execution
  placeOfExecution: string; // city name
}

interface LostDocumentAffidavitFormProps {
  onSubmit: (data: LostDocumentAffidavitFormData) => void;
  isSubmitting: boolean;
}

export default function LostDocumentAffidavitForm({ onSubmit, isSubmitting }: LostDocumentAffidavitFormProps) {
  const [formData, setFormData] = useState<LostDocumentAffidavitFormData>({
    deponentName: '',
    fatherName: '',
    age: '',
    occupation: '',
    currentAddress: '',
    permanentAddress: '',
    phone: '',
    email: '',
    documentType: '',
    documentNumber: '',
    issuingAuthority: '',
    dateOfIssue: '',
    lostDate: '',
    lostLocation: '',
    circumstancesOfLoss: '',
    firLodged: 'no',
    firNumber: '',
    policeStation: '',
    firDate: '',
    purposeOfAffidavit: '',
    placeOfExecution: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateField = (field: keyof LostDocumentAffidavitFormData, value: string) => {
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
              placeholder="Your full name as per ID"
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
          <div className="md:col-span-2">
            <Label htmlFor="permanentAddress">Permanent Address</Label>
            <Textarea
              id="permanentAddress"
              value={formData.permanentAddress}
              onChange={(e) => updateField('permanentAddress', e.target.value)}
              placeholder="Leave blank if same as current address"
              rows={2}
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

      {/* Lost Document Details */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Lost Document Details</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="documentType">Type of Document *</Label>
            <Input
              id="documentType"
              required
              value={formData.documentType}
              onChange={(e) => updateField('documentType', e.target.value)}
              placeholder="PAN Card / Aadhaar / Passport / Driving License / Marksheet / etc."
            />
          </div>
          <div>
            <Label htmlFor="documentNumber">Document Number</Label>
            <Input
              id="documentNumber"
              value={formData.documentNumber}
              onChange={(e) => updateField('documentNumber', e.target.value)}
              placeholder="ABCDE1234F / 1234 5678 9012 / etc."
            />
          </div>
          <div>
            <Label htmlFor="issuingAuthority">Issuing Authority</Label>
            <Input
              id="issuingAuthority"
              value={formData.issuingAuthority}
              onChange={(e) => updateField('issuingAuthority', e.target.value)}
              placeholder="Income Tax Dept / UIDAI / Passport Office / RTO / University / etc."
            />
          </div>
          <div>
            <Label htmlFor="dateOfIssue">Date of Issue</Label>
            <Input
              id="dateOfIssue"
              type="date"
              value={formData.dateOfIssue}
              onChange={(e) => updateField('dateOfIssue', e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Loss Details */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Loss Details</h2>
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lostDate">Date of Loss (Approximate) *</Label>
              <Input
                id="lostDate"
                required
                type="date"
                value={formData.lostDate}
                onChange={(e) => updateField('lostDate', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="lostLocation">Place of Loss *</Label>
              <Input
                id="lostLocation"
                required
                value={formData.lostLocation}
                onChange={(e) => updateField('lostLocation', e.target.value)}
                placeholder="Mumbai / Delhi Metro / Home / Office / etc."
              />
            </div>
          </div>
          <div>
            <Label htmlFor="circumstancesOfLoss">Circumstances of Loss *</Label>
            <Textarea
              id="circumstancesOfLoss"
              required
              value={formData.circumstancesOfLoss}
              onChange={(e) => updateField('circumstancesOfLoss', e.target.value)}
              placeholder="Describe how the document was lost (e.g., misplaced during travel, stolen from bag, lost in transit, etc.)"
              rows={3}
            />
          </div>
        </div>
      </section>

      {/* FIR Details */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Police Complaint (FIR/NCR)</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="firLodged">FIR/NCR Lodged? *</Label>
            <select
              id="firLodged"
              required
              value={formData.firLodged}
              onChange={(e) => updateField('firLodged', e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>
          {formData.firLodged === 'yes' && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firNumber">FIR/NCR Number</Label>
                <Input
                  id="firNumber"
                  value={formData.firNumber}
                  onChange={(e) => updateField('firNumber', e.target.value)}
                  placeholder="123456/2024"
                />
              </div>
              <div>
                <Label htmlFor="policeStation">Police Station</Label>
                <Input
                  id="policeStation"
                  value={formData.policeStation}
                  onChange={(e) => updateField('policeStation', e.target.value)}
                  placeholder="Koramangala Police Station"
                />
              </div>
              <div>
                <Label htmlFor="firDate">FIR Date</Label>
                <Input
                  id="firDate"
                  type="date"
                  value={formData.firDate}
                  onChange={(e) => updateField('firDate', e.target.value)}
                />
              </div>
            </div>
          )}
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
              placeholder="For obtaining duplicate / For bank records / For passport application / etc."
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
