import React from 'react';

function VideoComponent() {
    return (
        <div className="video-container with-background">
            <iframe
                title="Embedded YouTube Video"
                width="560"
                height="315"
                src="https://www.youtube.com/embed/CawrPp1y8ow?autoplay=0"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            ></iframe>
        </div>
    );
}

export default VideoComponent;
