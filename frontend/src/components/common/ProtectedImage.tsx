import React, { useState, useEffect } from "react";
import { fetchSecureDocumentUrl } from "../../api";

interface ProtectedImageProps {
  fileKey: string;
  alt: string;
  className?: string;
}

const ProtectedImage: React.FC<ProtectedImageProps> = ({ fileKey, alt, className = "" }) => {
  const [url, setUrl] = useState<string>("");
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    if (!fileKey) return;
    
    fetchSecureDocumentUrl(fileKey)
      .then(signedUrl => {
        if (active) setUrl(signedUrl);
      })
      .catch(err => {
        console.error("Failed to load secure image", err);
        if (active) setError(true);
      });
      
    return () => { active = false; };
  }, [fileKey]);

  if (error) {
    return (
      <div className={`bg-slate-200 flex items-center justify-center text-red-500 text-[10px] text-center p-1 ${className}`}>
        Load Error
      </div>
    );
  }
  if (!url) {
    return <div className={`bg-slate-200 animate-pulse ${className}`} />;
  }
  return <img src={url} alt={alt} className={className} />;
};

export default ProtectedImage;
