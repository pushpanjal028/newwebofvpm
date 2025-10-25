import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Mail, Home, Users } from 'lucide-react';

export default function Success() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');

  return (
    <div className="py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <CheckCircle className="h-24 w-24 text-green-500 mx-auto mb-6" />
        <h1 className="text-4xl font-bold mb-4">Registration Successful!</h1>
        <p className="text-xl text-gray-600 mb-8">
          Thank you for joining Vishwa Patrakar Mahasangh. Your payment has been
          processed successfully.
        </p>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-start justify-center mb-4">
            <Mail className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
            <div className="text-left">
              <p className="text-gray-700 font-medium mb-1">
                Confirmation Email Sent
              </p>
              <p className="text-sm text-gray-600">
                A confirmation email has been sent to your registered email address
                with your membership details.
              </p>
            </div>
          </div>
          {sessionId && (
            <p className="text-xs text-gray-500 mt-2">
              Transaction ID: {sessionId}
            </p>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-gray-800 mb-3">What's Next?</h3>
          <ul className="text-sm text-gray-700 space-y-2 text-left max-w-md mx-auto">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Check your email for membership confirmation and next steps</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Access exclusive member resources and training materials</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Connect with fellow journalists in our community</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Stay updated on upcoming events and workshops</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            <Home className="h-5 w-5 mr-2" />
            Go to Homepage
          </Link>
          <Link
            to="/members"
            className="inline-flex items-center justify-center bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            <Users className="h-5 w-5 mr-2" />
            View Members
          </Link>
        </div>
      </div>
    </div>
  );
}
