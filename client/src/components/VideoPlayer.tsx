import { useEffect, useRef } from 'react';

interface VideoPlayerProps {
  src: string;
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
}

export default function VideoPlayer({
  src,
  className = '',
  autoPlay = true,
  loop = true,
  muted = true,
  controls = false
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Ensure video plays automatically and continuously
    const video = videoRef.current;
    if (video) {
      const playPromise = video.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Video play error:", error);
          
          // Add event listener for user interaction to play video later
          const playVideo = () => {
            video.play();
            document.removeEventListener('click', playVideo);
            document.removeEventListener('touchstart', playVideo);
          };
          
          document.addEventListener('click', playVideo);
          document.addEventListener('touchstart', playVideo);
        });
      }
    }
  }, []);

  return (
    <video
      ref={videoRef}
      className={className}
      autoPlay={autoPlay}
      loop={loop}
      muted={muted}
      playsInline
      controls={controls}
    >
      <source src={src} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
}