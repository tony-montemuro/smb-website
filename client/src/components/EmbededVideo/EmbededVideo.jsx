/* ===== IMPORTS ===== */
import "./EmbededVideo.css";
import EmbededVideoLogic from "./EmbededVideo.js";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import YouTube from "react-youtube";

function EmbededVideo({ url }) {
  /* ===== FUNCTIONS ===== */

  // functions from the js file
  const { getUrlType, getYoutubeVideoId, getYoutubeVideoOpts, getTwitchVodSource, getTwitchClipSource } = EmbededVideoLogic();

  /* ===== VARIABLES ===== */
  const urlType = getUrlType(url);

  /* ===== EMBEDED VIDEO COMPONENT ===== */
  switch (urlType) {
    case "youtube":
      return <YouTube 
        videoId={ getYoutubeVideoId(url) } 
        opts={ getYoutubeVideoOpts(url) }
        className="embeded-video-player"
      />;
    case "twitch-vod":
      return <iframe
        title="twitch-vod"
        src={ getTwitchVodSource(url) }
        width="100%"
        height="100%"
        allowFullScreen
      >
      </iframe>;
    case "twitch-clip":
      return <iframe
        title="twitch-clip"
        src={ getTwitchClipSource(url) }
        width="100%"
        height="100%"
        allowFullScreen
      >
      </iframe>;
    default:
      return (
        <div className="embeded-video-player">
          <h3>Embeded video is not supported for this proof:</h3>
          <a href={ url } target="_blank" rel="noopener noreferrer">
            <div className="embeded-video-link">
              <OpenInNewIcon fontSize="small" />{ url }
            </div>
          </a>
        </div>
      );
  }
};

/* ===== EXPORTS ===== */
export default EmbededVideo;