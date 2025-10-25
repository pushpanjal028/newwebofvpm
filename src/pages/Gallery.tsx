export default function Gallery() {
  const images = [
    {
      url: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',
      title: 'Annual Conference 2023',
    },
    {
      url: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg',
      title: 'Workshop on Digital Journalism',
    },
    {
      url: 'https://images.pexels.com/photos/7130560/pexels-photo-7130560.jpeg',
      title: 'Press Freedom Rally',
    },
    {
      url: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg',
      title: 'Member Networking Event',
    },
    {
      url: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg',
      title: 'Awards Ceremony',
    },
    {
      url: 'https://images.pexels.com/photos/3183183/pexels-photo-3183183.jpeg',
      title: 'Training Session',
    },
    {
      url: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg',
      title: 'Panel Discussion',
    },
    {
      url: 'https://images.pexels.com/photos/3183153/pexels-photo-3183153.jpeg',
      title: 'International Media Summit',
    },
    {
      url: 'https://images.pexels.com/photos/3184639/pexels-photo-3184639.jpeg',
      title: 'Community Outreach',
    },
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
