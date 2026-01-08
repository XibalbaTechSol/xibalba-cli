import React, { useState, useEffect, useRef } from 'react';

interface PlaybackViewerProps {
  screenshotUrls: string[];
}

const PlaybackViewer: React.FC<PlaybackViewerProps> = ({ screenshotUrls }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [speed, setSpeed] = useState(1);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = window.setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % screenshotUrls.length);
      }, 1000 / speed);
    } else {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, speed, screenshotUrls.length]);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
  };

  const handleSpeedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSpeed(Number(event.target.value));
  };

  return (
    <div className="playback-viewer">
      <div>
        {screenshotUrls.length > 0 && (
          <img src={screenshotUrls[currentIndex]} alt={`Screenshot ${currentIndex + 1}`} />
        )}
      </div>
      <div>
        <button onClick={handlePlay} disabled={isPlaying}>Play</button>
        <button onClick={handlePause} disabled={!isPlaying}>Pause</button>
        <button onClick={handleStop}>Stop</button>
        <input
          type="range"
          min="0.5"
          max="5"
          step="0.5"
          value={speed}
          onChange={handleSpeedChange}
        />
        <span>{speed}x</span>
      </div>
    </div>
  );
};

export default PlaybackViewer;
