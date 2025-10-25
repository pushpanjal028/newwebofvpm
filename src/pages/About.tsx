import { Heart, Target, Eye } from 'lucide-react';

export default function About() {
  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">About Us</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Vishwa Patrakar Mahasangh is a global organization dedicated to
            supporting journalists and promoting ethical journalism worldwide.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <Eye className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold mb-3">Our Vision</h3>
            <p className="text-gray-600">
              To create a world where journalism thrives as a pillar of democracy,
              truth, and social justice.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <Target className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold mb-3">Our Mission</h3>
            <p className="text-gray-600">
              Empower journalists with resources, training, and support to excel
              in their profession and uphold the highest ethical standards.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <Heart className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold mb-3">Our Values</h3>
            <p className="text-gray-600">
              Integrity, transparency, excellence, and commitment to press freedom
              and ethical journalism.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold mb-6">Our Story</h2>
          <div className="prose prose-lg max-w-none text-gray-600 space-y-4">
            <p>
              Founded with the vision of creating a unified global community of
              journalists, Vishwa Patrakar Mahasangh has grown to become a leading
              organization in the field of journalism and media.
            </p>
            <p>
              We believe in the power of journalism to shape society, hold power
              accountable, and give voice to the voiceless. Our organization provides
              a platform for journalists to connect, learn, and grow together.
            </p>
            <p>
              Through our programs, resources, and advocacy efforts, we continue to
              support journalists worldwide in their mission to deliver accurate,
              fair, and impactful news to their communities.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold mb-8 text-center">What We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-l-4 border-blue-600 pl-4">
              <h3 className="text-lg font-semibold mb-2">Training Programs</h3>
              <p className="text-gray-600">
                Comprehensive workshops and courses on modern journalism techniques,
                digital media, and investigative reporting.
              </p>
            </div>
            <div className="border-l-4 border-blue-600 pl-4">
              <h3 className="text-lg font-semibold mb-2">Networking Events</h3>
              <p className="text-gray-600">
                Regular conferences, seminars, and meetups to connect with fellow
                journalists and industry leaders.
              </p>
            </div>
            <div className="border-l-4 border-blue-600 pl-4">
              <h3 className="text-lg font-semibold mb-2">Legal Support</h3>
              <p className="text-gray-600">
                Guidance on media law, press freedom issues, and ethical dilemmas
                faced by journalists.
              </p>
            </div>
            <div className="border-l-4 border-blue-600 pl-4">
              <h3 className="text-lg font-semibold mb-2">Resource Library</h3>
              <p className="text-gray-600">
                Access to extensive resources including research papers, style guides,
                and industry reports.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
