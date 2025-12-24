
import { Heart, Target, Eye, Divide } from "lucide-react";
import { useState } from "react";

export default function About() {
  const [openCard, setOpenCard] = useState<string | null>(null);

  const toggleCard = (card: string) => {
    setOpenCard(openCard === card ? null : card);
  };

  return (
    <div className="py-16">
      {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> */}
        {/* <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">About Us</h1>
          <div className="max-w-3xl text-gray-600 text-lg space-y-4 leading-relaxed">

            <p>
              The <strong>Vishwapatrkar Mahasangh</strong> was founded with a complete and unwavering
              commitment to organize, regulate, discipline, unite, educate, and train the
              information sector of India—recognized as the <strong>Fourth Pillar of Democracy</strong>—
              along with all information professionals and the entire media ecosystem.
            </p>

            <p>
              The Mahasangh is dedicated to the <strong>welfare of journalists</strong>, their
              <strong> health and economic empowerment</strong>, the
              <strong> protection of journalists’ fundamental rights</strong>, the
              <strong> freedom of the press</strong>, and the
              <strong> physical safety, dignity, and social justice</strong> of journalists in every respect.
            </p>

            <p>
              The Vishwapatrkar Mahasangh was established in the year <strong>2006</strong> on the sacred land
              of <strong>Tirthraj Prayagraj (India)</strong>—the world-renowned confluence of the holy rivers
              <strong> Ganga, Yamuna, and Saraswati</strong>. From this spiritually significant birthplace,
              the organization emerged with a global vision. The
              <strong> working jurisdiction of the Vishwapatrkar Mahasangh extends across the entire world</strong>.
            </p>

            <p>
              The Vishwapatrkar Mahasangh stands as the <strong>powerful voice of information professionals
                of all nations</strong>. The federation is registered under the Indian Constitution and the
              Trust Act and may be referred to as the
              <strong> “Vishwapatrkar Mahasangh Trust of India.”</strong>
            </p>

            <p>
              To strengthen journalist welfare and organizational effectiveness, the Vishwapatrkar
              Mahasangh operates through various committees and forums:
            </p>

            <ul className="list-disc list-inside space-y-1 pl-4">
              <li>Vishwapatrkar Mahasangh Trust of India – Central Executive Assembly</li>
              <li>State Executive Assemblies</li>
              <li>Senior Journalists’ Forum</li>
              <li>Awarded and Disciplinary Journalists’ Cell</li>
              <li>Youth Journalists’ Front</li>
              <li>Women Journalists’ Front</li>
              <li>National Urdu Media Organization</li>
              <li>International Media Organization</li>
              <li>Legal Advisory Committee</li>
              <li>Senior Citizens Advisory Committee</li>
              <li>Civil Rights Forum</li>
              <li>International Press Club</li>
            </ul>

          </div> */}
          <div className="mb-20 px-4">
  {/* Heading */}
  <div className="text-center mb-10">
    <h1 className="text-4xl font-bold text-gray-900">About Us</h1>
    <p className="mt-3 text-gray-600 text-lg">
      World Federation of Journalists – Vishwapatrkar Mahasangh
    </p>
  </div>

  {/* Content Box */}
  <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-md p-8 md:p-12">
    <div className="text-gray-700 text-base md:text-lg leading-relaxed space-y-5 text-left">

      <p>
        <strong>Vishwapatrkar Mahasangh</strong>, was founded to
        organize, unite, educate, and strengthen the information sector of India—
        recognized as the <strong>Fourth Pillar of Democracy</strong>—along with
        media professionals across the globe.
      </p>

      <p>
        The Mahasangh is committed to the
        <strong> welfare, safety, and dignity of journalists</strong>, ensuring
        their <strong>health, economic empowerment</strong>, protection of
        <strong> fundamental rights</strong>, and the preservation of
        <strong> press freedom and social justice</strong>.
      </p>

      <p>
        Established in <strong>2006</strong> at the sacred land of
        <strong> Tirthraj Prayagraj (India)</strong>—the confluence of the holy
        rivers <strong>Ganga, Yamuna, and Saraswati</strong>—the Mahasangh was born
        with a <strong>global vision</strong>. Today, its working jurisdiction
        extends <strong>across the world</strong>.
      </p>

      <p>
        Registered under the <strong>Indian Constitution and Trust Act</strong>,
        the federation stands as a <strong>powerful global voice</strong> for
        journalists and may be formally known as the
        <strong> Vishwapatrkar Mahasangh Trust of India</strong>.
      </p>

      {/* Divider */}
      <hr className="my-6 border-gray-200" />

      <p className="font-semibold text-gray-900">
        Key Committees & Forums
      </p>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 list-disc list-inside text-gray-700">
        <li>Central Executive Assembly</li>
        <li>State Executive Assemblies</li>
        <li>Senior Journalists’ Forum</li>
        <li>Awarded & Disciplinary Journalists’ Cell</li>
        <li>Youth Journalists’ Front</li>
        <li>Women Journalists’ Front</li>
        <li>National Urdu Media Organization</li>
        <li>International Media Organization</li>
        <li>Legal Advisory Committee</li>
        <li>Senior Citizens Advisory Committee</li>
        <li>Civil Rights Forum</li>
        <li>International Press Club</li>
      </ul>

    </div>
  </div>
</div>



          {/* Vision / Mission / Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Vision */}
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <Eye className="h-12 w-12 text-blue-600 mb-4" />

              <h3
                onClick={() => toggleCard("vision")}
                className="text-xl font-bold mb-3 cursor-pointer flex justify-between items-center"
              >
                Our Goal
                <span className="text-sm text-blue-600">
                  {openCard === "vision" ? "Show Less ▲" : "Read More ▼"}
                </span>
              </h3>

              <p className="text-gray-600">
                To create a world where journalism thrives as a pillar of democracy,
                truth, and social justice.
              </p>

              {openCard === "vision" && (
                <p className="text-gray-600 mt-4">
                  To create a just, independent, and secure global journalism ecosystem where journalists are respected, protected,
                  and empowered to uphold truth, justice, and human rights, contributing to an informed and injustice-free world society.
                </p>
              )}
            </div>

            {/* Mission */}
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <Target className="h-12 w-12 text-blue-600 mb-4" />

              <h3
                onClick={() => toggleCard("mission")}
                className="text-xl font-bold mb-3 cursor-pointer flex justify-between items-center"
              >
                Our Mission
                <span className="text-sm text-blue-600">
                  {openCard === "mission" ? "Show Less ▲" : "Read More ▼"}
                </span>
              </h3>

              <p className="text-gray-600">
                Empower journalists with resources, training, and support to excel
                in their profession.
              </p>

              {openCard === "mission" && (
                <p className="text-gray-600 mt-4">
                  <li>  To unite journalists worldwide under a strong, inclusive federation and provide official recognition and identity.</li>

                  <li>  To protect the safety, rights, and welfare of journalists and their families through legal, social, and administrative support.</li>

                  <li>   To strengthen ethical relationships between journalists and media organizations in the national and global interest.</li>

                  <li> To preserve and promote the core values of journalism through education, research, documentation, and awareness initiatives.</li>

                  <li> To support journalists in the fight against injustice, oppression, and human rights violations by providing legal assistance and advocacy.</li>

                  <li> To establish educational, welfare, and development institutions such as schools, research centers, libraries, press clubs, and welfare centers.</li>

                  <li> To promote public awareness and social responsibility through publications, programs, and outreach activities.</li>

                  <li> To build a strong organizational structure at local, national, and international levels to effectively represent journalists everywhere.</li>
                </p>
              )}
            </div>

            {/* Values */}
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <Heart className="h-12 w-12 text-blue-600 mb-4" />

              <h3
                onClick={() => toggleCard("values")}
                className="text-xl font-bold mb-3 cursor-pointer flex justify-between items-center"
              >
                Our Values
                <span className="text-sm text-blue-600">
                  {openCard === "values" ? "Show Less ▲" : "Read More ▼"}
                </span>
              </h3>

              <p className="text-gray-600">
                Integrity, transparency, excellence, and commitment to press freedom.
              </p>

              {openCard === "values" && (
                <p className="text-gray-600 mt-4">
                  <li> Truth & Integrity
                    We are committed to truthful, ethical, and responsible journalism without fear or bias.</li>

                  <li> Justice & Human Rights
                    We stand firmly against oppression and work actively to protect human rights and freedom of expression.</li>

                  <li>  Unity & Solidarity
                    We believe in collective strength by uniting journalists across regions, cultures, and media platforms.</li>

                  <li> Independence
                    We uphold the autonomy of journalism and support recognition free from political or commercial pressure.</li>

                  <li> Safety & Dignity
                    We prioritize the physical, legal, and social security of journalists and their families.</li>

                  <li> Education & Knowledge
                    We promote continuous learning, research, and preservation of journalistic heritage.</li>

                  <li>Social Responsibility
                    We recognize journalism as a service to society and commit to national and global development.</li>
                </p>
              )}
            </div>
          </div>

          {/* Our Story */}
          <div className="bg-gray-50 rounded-lg p-8 mb-16">
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <div className="prose prose-lg max-w-none text-gray-600 space-y-4">
              <p>
                Vishwapatrkar Mahasangh,was founded with a deep
                understanding that journalism is the foundation of democracy and that journalists across
                the world often work under risk, pressure, and injustice while serving society with truth.
              </p>
              <p>
                Across countries and cultures, journalists—whether from print, electronic, or digital
                media—have faced challenges such as lack of security, recognition, legal protection,
                and unity. Vishwapatrkar Mahasangh was established to bring all journalists onto a
                single global platform, giving them identity, strength, and a collective voice.
              </p>
              <p>
                The Mahasangh began by organizing journalists worldwide, enrolling them into the
                federation and providing official identification and recognition. It expanded to
                include media owners, editors, publishers, printers, photographers, writers, and
                media representatives, strengthening the federation and making it a truly inclusive organization.
              </p>

              <p>
                Understanding the importance of harmony in the media ecosystem, Vishwapatrkar Mahasangh works
                to build strong and ethical relationships between journalists and media management,
                always keeping the national and global interest at the center.
              </p>
              <p>
                A core pillar of the Mahasangh is the safety and welfare of journalists. The federation actively
                struggles for journalist security, legal support, insurance, education for families,
                and dignified living conditions. Whenever journalists face oppression, injustice, or human
                rights violations, Vishwapatrkar Mahasangh stands with them—offering legal assistance, advocacy, and support in High Courts and the Supreme Court.
              </p>
              <p>

              </p>
            </div>
          </div>

          {/* What We Offer */}
          <div>
            <h2 className="text-3xl font-bold mb-8 text-center">What We Offer</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="text-lg font-semibold mb-2">Training Programs</h3>
                <p className="text-gray-600">
                  Workshops and courses on modern journalism and digital media.
                </p>
              </div>
              <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="text-lg font-semibold mb-2">Networking Events</h3>
                <p className="text-gray-600">
                  Conferences and meetups with journalists and leaders.
                </p>
              </div>
              <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="text-lg font-semibold mb-2">Legal Support</h3>
                <p className="text-gray-600">
                  Guidance on media law and press freedom issues.
                </p>
              </div>
              <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="text-lg font-semibold mb-2">Resource Library</h3>
                <p className="text-gray-600">
                  Research papers, style guides, and reports.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
}
