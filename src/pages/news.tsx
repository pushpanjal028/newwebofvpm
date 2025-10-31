import { useEffect, useState } from "react";

export default function News() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const API_KEY = "AIzaSyAO5r1ODAVgOGwHeiycZdggGbBasm42jOY";
  const CHANNEL_ID = "UCRqJl-zz5ms9ChNewecmrjw";
  const API_URL = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet&type=video&order=date&maxResults=6`;

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        if (data.items) {
          const formattedVideos = data.items.map((item: any) => ({
            id: item.id?.videoId || item.id,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.high.url,
            url: `https://www.youtube.com/watch?v=${item.id?.videoId || item.id}`,
          }));
          setVideos(formattedVideos);
        } else {
          console.error("No videos found:", data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching YouTube videos:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Latest News</h1>
          <p className="text-lg text-gray-600">
            Stay updated with our latest videos and updates from our YouTube channel
          </p>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Loading videos...</p>
        ) : videos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((video) => (
              <a
                key={video.id}
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow"
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="rounded-t-lg w-full h-52 object-cover"
                />
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {video.title}
                  </h2>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">
            No videos found. Please check your API key or channel ID.
          </p>
        )}
      </div>
    </div>
  );
}
