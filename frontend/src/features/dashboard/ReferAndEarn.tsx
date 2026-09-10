import React, { useState, useEffect } from 'react';
import { getCoordinatorDashboard } from '../../api';
import toast from 'react-hot-toast';

export const ReferAndEarn = () => {
  const [dashboard, setDashboard] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const data = await getCoordinatorDashboard();
      setDashboard(data);
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to load referral dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (dashboard?.coordinatorCode) {
      navigator.clipboard.writeText(dashboard.coordinatorCode);
      toast.success('Referral code copied to clipboard!');
    }
  };

  const handleShare = async () => {
    if (!dashboard?.coordinatorCode) return;
    const shareUrl = `${window.location.origin}/register?ref=${dashboard.coordinatorCode}`;
    const shareText = `Join VPMH using my referral code: ${dashboard.coordinatorCode}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join VPMH',
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.error('Share failed', err);
      }
    } else {
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      toast.success('Share link copied to clipboard!');
    }
  };

  if (loading) return <div className="animate-pulse h-64 bg-gray-100 rounded-xl"></div>;
  if (!dashboard) return null;

  return (
    <div className="space-y-6">
      {/* 🎁 Refer & Earn Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
            <span className="text-3xl">🎁</span> Refer & Earn
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Your Referral Code</p>
              <div className="flex items-center gap-3">
                <code className="px-4 py-2 bg-slate-100 text-amber-600 font-bold rounded-lg text-lg border border-slate-200">
                  {dashboard.coordinatorCode}
                </code>
                <button onClick={handleCopyCode} className="p-2 text-slate-500 hover:text-amber-600 transition-colors" title="Copy Code">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </button>
                <button onClick={handleShare} className="px-4 py-2 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors shadow-sm">
                  Share Referral
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Successful Referrals</p>
                  <p className="text-3xl font-bold text-slate-800">{dashboard.eligibleReferrals}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 font-medium">Next Reward</p>
                  <p className="text-sm font-bold text-amber-600">{dashboard.threshold} Referrals → ₹{dashboard.cashbackAmount || 200} Cashback</p>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
                  <span>Progress</span>
                  <span>{dashboard.eligibleReferrals % dashboard.threshold} / {dashboard.threshold}</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${dashboard.progress}%` }}
                  ></div>
                </div>
                {dashboard.eligibleReferrals % dashboard.threshold > 0 && dashboard.eligibleReferrals % dashboard.threshold < dashboard.threshold && (
                  <p className="text-xs text-slate-500 mt-2">
                    Refer {dashboard.threshold - (dashboard.eligibleReferrals % dashboard.threshold)} more eligible members to unlock ₹{dashboard.cashbackAmount || 200} cashback.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rewards & History Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Rewards */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-4">My Rewards</h3>
          {dashboard.cashbacks && dashboard.cashbacks.length > 0 ? (
            <div className="space-y-4">
              {dashboard.cashbacks.map((cashback: Record<string, unknown>) => (
                <div key={cashback._id} className="border border-slate-100 rounded-xl p-4 bg-slate-50 relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-slate-800 flex items-center gap-2">
                        🎉 Referral Reward <span className="text-xs font-medium px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">{cashback.threshold} Referrals</span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">{new Date(cashback.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                      cashback.status === 'paid' ? 'bg-green-100 text-green-700' : 
                      cashback.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {cashback.status === 'eligible' || cashback.status === 'pending' ? 'Pending Approval' : cashback.status}
                    </span>
                  </div>
                  
                  <div className="bg-white rounded-lg p-3 border border-slate-100 mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-500">Gross Cashback:</span>
                      <span className="font-medium">₹{cashback.grossAmount}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2 text-red-500">
                      <span>Processing Fee:</span>
                      <span>-₹{cashback.processingFee}</span>
                    </div>
                    <div className="w-full h-px bg-slate-100 my-2"></div>
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>Net Cashback:</span>
                      <span className="text-green-600">₹{cashback.netAmount}</span>
                    </div>
                  </div>

                  {cashback.status === 'paid' && (
                    <div className="text-xs text-slate-500 bg-green-50/50 p-2 rounded border border-green-100">
                      <p><span className="font-medium text-slate-700">Paid On:</span> {new Date(cashback.paidAt).toLocaleDateString()}</p>
                      <p><span className="font-medium text-slate-700">Method:</span> {cashback.paymentMethod}</p>
                      <p className="truncate"><span className="font-medium text-slate-700">Ref ID:</span> {cashback.transactionId}</p>
                    </div>
                  )}
                  {cashback.status === 'rejected' && cashback.rejectionReason && (
                    <p className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100 mt-2">
                      <span className="font-bold">Reason:</span> {cashback.rejectionReason}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
              <span className="text-4xl mb-2 block">🎁</span>
              <p>No rewards yet.</p>
              <p className="text-sm mt-1">Complete {dashboard.threshold} eligible referrals to earn ₹{dashboard.cashbackAmount || 200}!</p>
            </div>
          )}
        </div>

        {/* My Referrals */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full max-h-[600px]">
          <h3 className="text-xl font-bold text-slate-800 mb-4">My Referrals</h3>
          <div className="overflow-y-auto pr-2 -mr-2 flex-grow">
            {dashboard.history && dashboard.history.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="pb-3 pt-2">Member</th>
                    <th className="pb-3 pt-2">Date</th>
                    <th className="pb-3 pt-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dashboard.history.map((ref: Record<string, unknown>, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 text-sm font-medium text-slate-800">{ref.memberName}</td>
                      <td className="py-3 text-sm text-slate-500">{new Date(ref.date).toLocaleDateString()}</td>
                      <td className="py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          ref.status === 'eligible' || ref.status === 'successful' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {ref.status === 'eligible' ? 'Successful' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl border border-slate-100 border-dashed h-full flex flex-col items-center justify-center">
                <p>No referrals yet.</p>
                <p className="text-sm mt-1">Share your code to start earning.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
