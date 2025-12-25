import { useState, useEffect } from "react";
import { Users } from "lucide-react";

interface Member {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  createdAt: string;
}

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await fetch("https://vpmh.org/api/members"); // 👈 call your backend
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch members");
      }

      setMembers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading members...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 text-center">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={fetchMembers}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Users className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Our Members</h1>
          <p className="text-xl text-gray-600">
            Meet our community of dedicated journalists
          </p>
        </div>

        {members.length === 0 ? (
          <div className="text-center">
            <div className="bg-gray-50 rounded-lg p-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No registered members yet.</p>
              <p className="text-gray-400 mt-2">
                Be the first to join our community!
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 text-center">
              <p className="text-gray-600">
                <strong>{members.length}</strong> registered{" "}
                {members.length === 1 ? "member" : "members"}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {members.map((member) => (
                <div
                  key={member._id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-600">
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-center mb-2">
                    {member.name}
                  </h3>
                  {member.organization && (
                    <p className="text-sm text-gray-600 text-center mb-2">
                      {member.organization}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 text-center">
                    Member since{" "}
                    {new Date(member.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}



// import { useEffect, useState } from "react";

// interface Member {
//   _id: string;
//   name: string;
//   photo: string;
//   organization: string;
// }

// export default function Members() {
//   const [members, setMembers] = useState<Member[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetch("https://vpmh.org/api/members")
//       .then((res) => res.json())
//       .then((data) => {
//         setMembers(data);
//         setLoading(false);
//       })
//       .catch(() => setLoading(false));
//   }, []);

//   if (loading) {
//     return <p className="text-center mt-10">Loading members...</p>;
//   }

//   return (
//     <div className="py-16 bg-gray-50">
//       <div className="max-w-7xl mx-auto px-4">
//         <h1 className="text-3xl font-bold text-center mb-10">
//           Our Members
//         </h1>

//         {members.length === 0 ? (
//           <p className="text-center text-gray-600">
//             No members available.
//           </p>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//             {members.map((member) => (
//               <div
//                 key={member._id}
//                 className="bg-white rounded-lg shadow p-6 text-center"
//               >
//                 <img
//                   src={member.photo}
//                   alt={member.name}
//                   className="w-24 h-24 mx-auto rounded-full object-cover mb-4"
//                 />
//                 <h3 className="font-semibold text-lg">
//                   {member.name}
//                 </h3>
//                 <p className="text-sm text-gray-500">
//                   {member.organization || "Member"}
//                 </p>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
