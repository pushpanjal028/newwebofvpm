import { Link } from 'react-router-dom';
import { XCircle, Home, ArrowLeft } from 'lucide-react';

export default function Cancel() {
  return (
    <div className="py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <XCircle className="h-24 w-24 text-red-500 mx-auto mb-6" />
        <h1 className="text-4xl font-bold mb-4">Payment Cancelled</h1>
        <p className="text-xl text-gray-600 mb-8">
          Your registration was not completed. No charges have been made to your account.
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-gray-800 mb-2">What Happened?</h3>
          <p className="text-gray-700 text-sm mb-4">
            You cancelled the payment process or there was an issue completing your transaction.
            Your registration information has been saved but not activated.
          </p>
          <p className="text-gray-700 text-sm">
            If you encountered any issues or have questions, please contact our support team
            at <a href="mailto:support@vishwapatrakar.org" className="text-blue-600 hover:underline">
              support@vishwapatrakar.org
            </a>
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-gray-800 mb-3">Need Help?</h3>
          <ul className="text-sm text-gray-700 space-y-2 text-left max-w-md mx-auto">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Check if your payment method is valid and has sufficient funds</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Ensure your internet connection is stable</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Try using a different browser or device</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Contact your bank if the problem persists</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/registration"
            className="inline-flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Try Again
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            <Home className="h-5 w-5 mr-2" />
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
