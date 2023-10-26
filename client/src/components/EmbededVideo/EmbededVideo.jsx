/* ===== IMPORTS ===== */
import "./EmbededVideo.css";
import { Tweet } from "react-tweet";
import EmbededVideoLogic from "./EmbededVideo.js";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import YouTube from "react-youtube";

function EmbededVideo({ url }) {
  /* ===== FUNCTIONS ===== */

  // functions from the js file
  const { getUrlType, getYoutubeVideoId, getYoutubeVideoOpts, getTwitchVodSource, getTwitchClipSource, getTweetId } = EmbededVideoLogic();

  /* ===== VARIABLES ===== */
  const urlType = getUrlType(url);

  /* ===== EMBEDED VIDEO COMPONENT ===== */
  switch (urlType) {

    // CASE 1: YouTube - render a youtube video player if the urlType is "youtube"
    case "youtube":
      return <YouTube 
        videoId={ getYoutubeVideoId(url) } 
        opts={ getYoutubeVideoOpts(url) }
        className="embeded-video-player"
      />;

    // CASE 2: Twitch VOD: render a twitch player if the urlType is "twitch-vod"
    case "twitch-vod":
      return <iframe
        title={ urlType }
        src={ getTwitchVodSource(url) }
        width="100%"
        height="100%"
        allowFullScreen
      >
      </iframe>;

    // CASE 3: Twitch Clip: render a twitch player if the urlType is "twitchClip"
    case "twitch-clip":
      return <iframe
        title={ urlType }
        src={ getTwitchClipSource(url) }
        width="100%"
        height="100%"
        allowFullScreen
      >
      </iframe>;

    // CASE 4: Twitter: render an embeded tweet if the urlType is "twitter"
    case "twitter":
      return <Tweet id={ getTweetId(url) } />;

    // DEFAULT CASE: render an error message if an embed is not supported (urlType is not youtube, twitch-vod, twitch-clip, or twitter)
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