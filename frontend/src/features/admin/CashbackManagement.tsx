import React, { useState, useEffect } from 'react';
import { getCashbacks, updateCashbackStatus } from '../../api';
import { getUploadUrl } from '../../api/client';
import toast from 'react-hot-toast';

export const CashbackManagement = () => {
  const [cashbacks, setCashbacks] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCashback, setSelectedCashback] = useState<Record<string, unknown> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Form State
  const [status, setStatus] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchCashbacks();
  }, []);

  const fetchCashbacks = async () => {
    try {
      const data = await getCashbacks();
      setCashbacks(data);
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to fetch cashbacks');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (cashback: Record<string, unknown>) => {
    setSelectedCashback(cashback);
    setStatus(cashback.status);
    setRejectionReason(cashback.rejectionReason || '');
    setPaymentMethod(cashback.paymentMethod || '');
    setTransactionId(cashback.transactionId || '');
    setAdminNotes(cashback.adminNotes || '');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCashback(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCashback) return;
    setActionLoading(true);
    try {
      await updateCashbackStatus(selectedCashback._id, {
        status,
        rejectionReason: status === 'rejected' ? rejectionReason : undefined,
        paymentMethod: status === 'paid' ? paymentMethod : undefined,
        transactionId: status === 'paid' ? transactionId : undefined,
        adminNotes,
        paidAmount: status === 'paid' ? selectedCashback.netAmount : undefined,
      });
      toast.success('Cashback status updated successfully');
      fetchCashbacks();
      handleCloseModal();
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to update cashback status');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="animate-pulse h-64 bg-gray-100 rounded-xl"></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Cashback Management</h2>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
            {cashbacks.filter(c => c.status === 'eligible').length} Pending Review
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Coordinator</th>
                <th className="p-4">Amount (Net)</th>
                <th className="p-4">Threshold</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date Generated</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cashbacks.map((cashback: Record<string, unknown>) => (
                <tr key={cashback._id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-slate-800">{cashback.coordinatorId?.name || 'Unknown'}</div>
                    <div className="text-xs text-slate-500">{cashback.coordinatorId?.phone || ''}</div>
                  </td>
                  <td className="p-4 font-bold text-green-600">₹{cashback.netAmount}</td>
                  <td className="p-4">
                    <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-medium">
                      {cashback.threshold} Referrals
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      cashback.status === 'paid' ? 'bg-green-100 text-green-700' :
                      cashback.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {cashback.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-600">
                    {new Date(cashback.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleOpenModal(cashback)}
                      className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-bold rounded-lg transition-colors"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
              {cashbacks.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No cashbacks found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Management Modal */}
      {isModalOpen && selectedCashback && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Process Cashback</h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-grow">
              <div className="mb-6 bg-slate-50 rounded-xl p-4 border border-slate-100 text-sm">
                <div className="grid grid-cols-2 gap-y-2">
                  <div className="text-slate-500">Coordinator:</div>
                  <div className="font-medium text-right">{selectedCashback.coordinatorId?.name}</div>
                  
                  <div className="text-slate-500">Gross Amount:</div>
                  <div className="font-medium text-right">₹{selectedCashback.grossAmount}</div>
                  
                  <div className="text-slate-500">Processing Fee:</div>
                  <div className="font-medium text-red-500 text-right">-₹{selectedCashback.processingFee}</div>
                  
                  <div className="text-slate-500 font-bold border-t pt-2 mt-1">Net Payout:</div>
                  <div className="font-bold text-green-600 text-right border-t pt-2 mt-1">₹{selectedCashback.netAmount}</div>
                </div>
              </div>

              {selectedCashback.paymentDetails ? (
                <div className="mb-6 bg-amber-50 rounded-xl p-4 border border-amber-100 text-sm">
                  <h4 className="font-bold text-amber-800 mb-3 border-b border-amber-200 pb-2">Payment Details</h4>
                  <div className="grid grid-cols-2 gap-y-2">
                    <div className="text-amber-700">Account Holder:</div>
                    <div className="font-medium text-right text-amber-900">{selectedCashback.paymentDetails.accountHolderName || '-'}</div>
                    
                    <div className="text-amber-700">Bank Name:</div>
                    <div className="font-medium text-right text-amber-900">{selectedCashback.paymentDetails.bankName || '-'}</div>
                    
                    <div className="text-amber-700">Account Number:</div>
                    <div className="font-medium text-right text-amber-900">{selectedCashback.paymentDetails.accountNumber || '-'}</div>
                    
                    <div className="text-amber-700">IFSC Code:</div>
                    <div className="font-medium text-right text-amber-900">{selectedCashback.paymentDetails.IFSC || '-'}</div>

                    <div className="text-amber-700">UPI ID:</div>
                    <div className="font-medium text-right text-amber-900">{selectedCashback.paymentDetails.UPI || '-'}</div>
                  </div>
                  
                  {selectedCashback.paymentDetails.qrCodeReference && (
                    <div className="mt-4">
                      <div className="text-amber-700 mb-2">QR Code:</div>
                      <img 
                        src={getUploadUrl(selectedCashback.paymentDetails.qrCodeReference)} 
                        alt="QR Code" 
                        className="w-full max-w-[200px] h-auto border border-amber-200 rounded-lg bg-white"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="mb-6 bg-red-50 rounded-xl p-4 border border-red-100 text-sm text-red-700">
                  <p className="font-bold flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    Payment Details Missing
                  </p>
                  <p className="mt-1 opacity-80">This coordinator has not added their payment details yet. Please contact them before processing the payout.</p>
                </div>
              )}

              {selectedCashback.referredMembers && selectedCashback.referredMembers.length > 0 && (
                <div className="mb-6 bg-blue-50 rounded-xl p-4 border border-blue-100 text-sm">
                  <h4 className="font-bold text-blue-800 mb-3 border-b border-blue-200 pb-2">
                    Referred Members ({selectedCashback.referredMembers.length})
                  </h4>
                  <ul className="space-y-2">
                    {selectedCashback.referredMembers.map((member: Record<string, unknown>, idx: number) => (
                      <li key={idx} className="bg-white p-2 rounded border border-blue-100 flex justify-between">
                        <div>
                          <p className="font-medium text-slate-800">{String(member.name || 'Unknown')}</p>
                          <p className="text-xs text-slate-500">{String(member.membershipId || 'Pending')}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-green-600">Eligible</p>
                          <p className="text-xs text-slate-500">{new Date(String(member.date)).toLocaleDateString()}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <form id="cashback-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select 
                    value={status} 
                    onChange={e => setStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="eligible">Eligible (Ready to Pay)</option>
                    <option value="paid">Paid</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {status === 'paid' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Bank Transfer, UPI, Cash"
                        value={paymentMethod} 
                        onChange={e => setPaymentMethod(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Transaction ID / Ref No.</label>
                      <input 
                        type="text" 
                        required
                        value={transactionId} 
                        onChange={e => setTransactionId(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                  </>
                )}

                {status === 'rejected' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Rejection Reason</label>
                    <textarea 
                      required
                      value={rejectionReason} 
                      onChange={e => setRejectionReason(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                      rows={2}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Admin Internal Notes</label>
                  <textarea 
                    value={adminNotes} 
                    onChange={e => setAdminNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                    rows={2}
                  />
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={handleCloseModal}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="cashback-form"
                disabled={actionLoading || status === selectedCashback.status && status !== 'paid'}
                className="px-4 py-2 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Saving...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
