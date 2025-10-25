import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CreditCard, Shield, CheckCircle } from 'lucide-react';

export default function Payment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const memberId = searchParams.get('memberId');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!memberId) {
      navigate('/registration');
    }
  }, [memberId, navigate]);

  const handlePayment = async () => {
    setProcessing(true);

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    setTimeout(async () => {
      try {
        const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/complete-payment`;

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            memberId,
            sessionId,
          }),
        });

        if (response.ok) {
          navigate(`/success?sessionId=${sessionId}`);
        } else {
          navigate('/cancel');
        }
      } catch (error) {
        console.error('Payment error:', error);
        navigate('/cancel');
      }
    }, 2000);
  };

  const handleCancel = () => {
    navigate('/cancel');
  };

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <CreditCard className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Complete Your Payment</h1>
            <p className="text-gray-600">
              Secure payment processing for your membership
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Membership Fee (Annual)</span>
                <span className="font-semibold">₹500.00</span>
              </div>
              <div className="border-t pt-2 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>₹500.00</span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <Shield className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
              <div>
                <p className="text-sm text-gray-700 font-medium mb-1">
                  Demo Payment Mode
                </p>
                <p className="text-xs text-gray-600">
                  This is a simulated payment. Click "Complete Payment" to proceed.
                  In production, this will redirect to a real Stripe checkout page.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
              <span>Secure payment processing</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
              <span>Email confirmation sent after payment</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
              <span>Instant membership activation</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handlePayment}
              disabled={processing}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing Payment...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5 mr-2" />
                  Complete Payment
                </>
              )}
            </button>
            <button
              onClick={handleCancel}
              disabled={processing}
              className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
