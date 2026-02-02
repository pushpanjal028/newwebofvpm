import { Link } from 'react-router-dom';
import { Users, Award, Globe, ArrowRight } from 'lucide-react';
import bg from '../assests/bg .jpg';
import chairmanImg from "../assests/leadership/chairman.jpeg";
import trusteeImg from "../assests/leadership/geeta.png";
import { useState } from "react";
import meetingImg from "../assests/activity/meeting.jpeg";
import trainingImg from "../assests/activity/training.jpeg";
import pressmeetImg from "../assests/activity/pressmeet.jpeg";
import fieldworkImg from "../assests/activity/fieldwork.jpeg";
import Contact from "../pages/contact";
import OurActivities from "../pages/OurActivity";




export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <div>
      {/* <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Welcome to <br />Vishwa Patrakar Mahasangh
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Nationally registered organization of journalists
            </p>
            <Link
              to="/registration"
              className="inline-flex items-center bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Join Us Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section> */}
      {/* /////////////////////////////////////////////// */}
      <section
        className="relative text-white py-20 bg-cover bg-[position:center_30%]"
        style={{
          backgroundImage: `url(${bg})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Welcome to <br />Vishwa Patrakar Mahasangh
          </h1>
          <p className="text-xl mb-8 text-blue-100">
            Nationally registered organization of journalists
          </p>
          <Link
            to="/registration"
            className="inline-flex items-center bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Join Us Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow">
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Global Network</h3>
              <p className="text-gray-600">
                Connect with journalists from around the world
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow">
              <Award className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Professional Growth</h3>
              <p className="text-gray-600">
                Access resources and training opportunities
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow">
              <Globe className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Global Impact</h3>
              <p className="text-gray-600">
                Make a difference through quality journalism
              </p>
            </div>
          </div>
        </div>
      </section> */}
      {/* ================= Leadership / Trustees ================= */}
      <section className="py-20 bg-[#f8f9fb] border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <h2 className="text-3xl font-bold text-center mb-4 tracking-wide">
            Organizational Leadership
          </h2>
          <p className="text-center text-gray-600 mb-14 max-w-2xl mx-auto">
            The guiding pillars of Vishwa Patrakar Mahasangh, ensuring
            transparency, integrity, and ethical journalism.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">

            {/* Chairman */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition p-8 text-center">
              <img
                src={chairmanImg}
                alt="Chairman"
                className="w-32 h-32 mx-auto rounded-md object-cover border-2 border-gray-300 mb-6"
              />

              <h3 className="text-xl font-semibold uppercase tracking-wide">
                Mr. Sanjay kumar shukla
              </h3>
              <p className="text-gray-700 font-medium mt-1">
                Chairman
              </p>

              <div className="w-16 h-[2px] bg-blue-700 mx-auto my-4"></div>

              <p className="text-gray-600 text-sm leading-relaxed">
                Provides strategic leadership and vision to the organization,
                representing journalists at national and international forums
                while upholding democratic values and press freedom.
              </p>
            </div>

            {/* Managing Trustee */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition p-8 text-center">
              <img
                src={trusteeImg}
                alt="Managing Trustee"
                className="w-32 h-32 mx-auto rounded-md object-cover border-2 border-gray-300 mb-6"
              />

              <h3 className="text-xl font-semibold uppercase tracking-wide">
                Mrs. geeta shukla
              </h3>
              <p className="text-gray-700 font-medium mt-1">
                Managing Trustee
              </p>

              <div className="w-16 h-[2px] bg-blue-700 mx-auto my-4"></div>

              <p className="text-gray-600 text-sm leading-relaxed">
                Oversees organizational operations, member welfare,
                and governance to ensure accountability, unity,
                and long-term institutional growth.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ================= Glimpse of Activities ================= */}
      <section className="py-20 bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <h2 className="text-3xl font-bold text-center mb-4">
            Glimpse of Our Activities
          </h2>

          <p className="text-center text-gray-600 max-w-3xl mx-auto mb-14">
            A snapshot of initiatives and engagements undertaken by
            Vishwa Patrakar Mahasangh to strengthen journalism,
            protect journalists’ rights, and promote ethical media practices.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

            {/* Activity 1 */}
            <div className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
              <img
                src={meetingImg}
                alt="Organizational Meeting"
                onClick={() => setSelectedImage(meetingImg)}
                className="h-48 w-full object-cover cursor-pointer hover:opacity-90"
              />
              <div className="p-4">
                <h3 className="font-semibold mb-2">
                  Organizational Meetings
                </h3>
                <p className="text-sm text-gray-600">
                  Discussions on journalist welfare, policy matters,
                  and organizational planning.
                </p>
              </div>
            </div>

            {/* Activity 2 */}
            <div className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
              <img
                src={trainingImg}
                alt="Training Program"
                onClick={() => setSelectedImage(trainingImg)}
                className="h-48 w-full object-cover cursor-pointer hover:opacity-90"
              />
              <div className="p-4">
                <h3 className="font-semibold mb-2">
                  Training & Workshops
                </h3>
                <p className="text-sm text-gray-600">
                  Skill development programs to promote
                  responsible and modern journalism.
                </p>
              </div>
            </div>

            {/* Activity 3 */}
            <div className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
              <img
                src={pressmeetImg}
                alt="Press Meet"
                onClick={() => setSelectedImage(pressmeetImg)}
                className="h-48 w-full object-cover cursor-pointer hover:opacity-90"
              />
              <div className="p-4">
                <h3 className="font-semibold mb-2">
                  Press & Media Engagements
                </h3>
                <p className="text-sm text-gray-600">
                  Press conferences and media interactions
                  on key journalism issues.
                </p>
              </div>
            </div>

            {/* Activity 4 */}
            <div className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
              <img
                src={fieldworkImg}
                alt="Field Activity"
                onClick={() => setSelectedImage(fieldworkImg)}
                className="h-48 w-full object-cover cursor-pointer hover:opacity-90"
              />
              <div className="p-4">
                <h3 className="font-semibold mb-2">
                  Ground-Level Activities
                </h3>
                <p className="text-sm text-gray-600">
                  On-field coordination and support for
                  journalists and media professionals.
                </p>
              </div>
            </div>

          </div>
        </div>


        {/* ============ IMAGE ZOOM MODAL ============ */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
            onClick={() => setSelectedImage(null)}
          >
            <img
              src={selectedImage}
              alt="Zoomed Activity"
              className="max-w-[90%] max-h-[90%] rounded-lg shadow-lg"
            />
          </div>
        )}
      </section>

      <OurActivities/>

      {/* ================= Impact Statistics ================= */}
      <section className="py-16 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 text-center">

          <h2 className="text-3xl font-bold mb-4">
            Our Growing Impact
          </h2>

          <p className="text-gray-600 mb-12">
            Strengthening journalism through unity, recognition, and ethical practices
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">

            <div>
              <p className="text-4xl font-bold text-blue-700">5,000+</p>
              <p className="text-gray-600 mt-2">Journalists Connected</p>
            </div>

            <div>
              <p className="text-4xl font-bold text-blue-700">20+</p>
              <p className="text-gray-600 mt-2">States Covered</p>
            </div>

            <div>
              <p className="text-4xl font-bold text-blue-700">100+</p>
              <p className="text-gray-600 mt-2">Programs & Meetings</p>
            </div>

            <div>
              <p className="text-4xl font-bold text-blue-700">Since 2006</p>
              <p className="text-gray-600 mt-2">Serving Journalists</p>
            </div>

          </div>
        </div>
      </section>

      {/* ================= Latest Updates ================= */}
      <section className="py-20 bg-white border-t">
        <div className="max-w-6xl mx-auto px-4">

          <h2 className="text-3xl font-bold text-center mb-12">
            Latest Announcements
          </h2>

          <div className="space-y-6">

            <div className="border-l-4 border-blue-700 bg-gray-50 p-4">
              <p className="font-semibold">
                Membership Registration Open
              </p>
              <p className="text-sm text-gray-600">
                Journalists across the world are invited to register and become
                part of Vishwa Patrakar Mahasangh.
              </p>
            </div>

            <div className="border-l-4 border-blue-700 bg-gray-50 p-4">
              <p className="font-semibold">
                Upcoming National Meeting
              </p>
              <p className="text-sm text-gray-600">
                A national-level meeting will be announced soon. Members
                will be informed through official channels.
              </p>
            </div>

            <div className="border-l-4 border-blue-700 bg-gray-50 p-4">
              <p className="font-semibold">
                Journalist Welfare Initiatives
              </p>
              <p className="text-sm text-gray-600">
                New initiatives focused on journalist safety and welfare
                are under development.
              </p>
            </div>

          </div>
        </div>
      </section>
      {/* ================= Call To Action ================= */}
      <section className="py-20 bg-blue-700 text-white">
        <div className="max-w-5xl mx-auto px-4 text-center">

          <h2 className="text-3xl font-bold mb-4">
            Become a Recognized Voice in Journalism
          </h2>

          <p className="text-blue-100 mb-8">
            Join Vishwa Patrakar Mahasangh and stand united for
            ethical, fearless, and responsible journalism.
          </p>

          <Link
            to="/registration"
            className="inline-block bg-white text-blue-700 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            Register as a Member
          </Link>

        </div>
      </section>

      {/* ================= Contact Us ================= */}
<Contact />

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Join Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                To unite journalists worldwide under a strong, inclusive federation and provide official recognition and identity.

              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Member Benefits</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  Access to exclusive resources and training
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  Networking opportunities with global journalists
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  Professional certification programs
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  Legal and ethical guidance support
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
    );
}


