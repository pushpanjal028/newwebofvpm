import React, { useState, useEffect } from 'react';
import { getPaymentDetails, updatePaymentDetails } from '../../api';
import toast from 'react-hot-toast';
import { getUploadUrl } from '../../api/client';

export const PaymentDetailsForm = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [details, setDetails] = useState<Record<string, unknown> | null>(null);

  const [formData, setFormData] = useState({
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    IFSC: '',
    UPI: '',
  });

  const [qrCodeFile, setQrCodeFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchDetails();
  }, []);

  const fetchDetails = async () => {
    try {
      const data = await getPaymentDetails();
      setDetails(data);
      if (data) {
        setFormData({
          accountHolderName: data.accountHolderName || '',
          bankName: data.bankName || '',
          accountNumber: data.accountNumber || '',
          confirmAccountNumber: data.accountNumber || '',
          IFSC: data.IFSC || '',
          UPI: data.UPI || '',
        });
        if (data.qrCodeReference) {
          setQrPreview(getUploadUrl(data.qrCodeReference));
        }
      }
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to load payment details');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB');
        return;
      }
      setQrCodeFile(file);
      setQrPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveQr = () => {
    setQrCodeFile(null);
    setQrPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.accountNumber !== formData.confirmAccountNumber) {
      toast.error('Account numbers do not match');
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'confirmAccountNumber') {
          fd.append(key, value);
        }
      });
      if (qrCodeFile) {
        fd.append('qrCode', qrCodeFile);
      } else if (!qrPreview && details?.qrCodeReference) {
        // Handle explicit removal if needed by API
        fd.append('removeQr', 'true');
      }

      await updatePaymentDetails(fd);
      toast.success('Payment details updated successfully');
      fetchDetails(); // refresh status
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to update payment details');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="animate-pulse h-96 bg-gray-100 rounded-xl"></div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 max-w-3xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Payment Details</h2>
          <p className="text-slate-500 mt-1">Provide your bank or UPI details to receive cashback rewards.</p>
        </div>
        {details?.verificationStatus && (
          <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
            details.verificationStatus === 'verified' ? 'bg-green-100 text-green-700' :
            details.verificationStatus === 'needs_update' ? 'bg-amber-100 text-amber-700' :
            'bg-slate-100 text-slate-600'
          }`}>
            {details.verificationStatus.replace('_', ' ')}
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Bank Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Bank Account</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Account Holder Name</label>
              <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                value={formData.accountHolderName} onChange={e => setFormData({...formData, accountHolderName: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Bank Name</label>
              <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Account Number</label>
              <input type="password" placeholder="••••••••" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                value={formData.accountNumber} onChange={e => setFormData({...formData, accountNumber: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Account Number</label>
              <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                value={formData.confirmAccountNumber} onChange={e => setFormData({...formData, confirmAccountNumber: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">IFSC Code</label>
              <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 uppercase"
                value={formData.IFSC} onChange={e => setFormData({...formData, IFSC: e.target.value.toUpperCase()})} />
            </div>
          </div>
        </div>

        {/* UPI Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">UPI (Optional)</h3>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">UPI ID</label>
            <input type="text" placeholder="example@upi" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
              value={formData.UPI} onChange={e => setFormData({...formData, UPI: e.target.value})} />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">QR Code</label>
            {qrPreview ? (
              <div className="relative inline-block border rounded-lg p-2 bg-slate-50">
                <img src={qrPreview} alt="UPI QR Code" className="w-48 h-48 object-contain rounded" />
                <button type="button" onClick={handleRemoveQr} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ) : (
              <label className="flex justify-center items-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-amber-500 focus:outline-none">
                <span className="flex items-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="font-medium text-gray-600">Drop files to Attach, or browse</span>
                </span>
                <input type="file" name="file_upload" className="hidden" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} />
              </label>
            )}
            <p className="text-xs text-slate-500 mt-2">Supported formats: PNG, JPG, WEBP. Max size: 2MB.</p>
          </div>
        </div>

        <div className="pt-4 border-t">
          <button type="submit" disabled={submitting} className="w-full sm:w-auto px-6 py-3 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-70 flex justify-center items-center">
            {submitting ? (
              <><span className="animate-spin mr-2 border-2 border-white border-t-transparent rounded-full w-4 h-4"></span> Saving...</>
            ) : "Save Payment Details"}
          </button>
          <p className="text-xs text-amber-600 mt-3 flex items-center gap-1 bg-amber-50 p-2 rounded border border-amber-100">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Changing verified payment details will reset your verification status and require admin review before next payout.
          </p>
        </div>
      </form>
    </div>
  );
};
