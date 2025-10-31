import React from "react";
import img1 from "../assests/uppic.jpg";
import img2 from "../assests/uppic.jpg2.jpg";
import img3 from "../assests/gujpic.jpg";
import img4 from "../assests/himpic.jpg";
import img5 from "../assests/mppic.jpg";
import img6 from "../assests/bg .jpg";

export default function Gallery() {
  const images = [
    { url: img1, title: 'A memorandum was given to the District Magistrate of Prayagraj by the Vishwaparker Mahasangh.' },
    { url: img2, title: 'A memorandum was given to the District Magistrate of Prayagraj by the Vishwaparker Mahasangh.' },
    { url: img3, title: 'Press Freedom Rally' },
    { url: img4, title: 'Member Networking Event in Himachal pradesh' },
    { url: img5, title: 'Awards Ceremony in Madhyapradesh' },
    { url: img6, title: 'Training Session in Himachal pradesh' },
  ];

  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Gallery</h1>
          <p className="text-xl text-gray-600">
            Capturing moments from our events and activities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow"
            >
              <img
                src={image.url}
                alt={image.title}
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <p className="text-white font-semibold p-4">{image.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
