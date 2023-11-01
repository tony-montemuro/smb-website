/* ===== IMPORTS ===== */
import "./EmbededVideo.css";
import { Tweet } from "react-tweet";
import styles from "./EmbededVideo.module.css";
import EmbededVideoLogic from "./EmbededVideo.js";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import YouTube from "react-youtube";

function EmbededVideo({ url }) {
  /* ===== VARIABLES ===== */
  const standardPlayers = ["youtube", "twitch-vod", "twitch-clip"];

  /* ===== FUNCTIONS ===== */

  // functions from the js file
  const { getUrlType, getYoutubeVideoId, getYoutubeVideoOpts, getTwitchVodSource, getTwitchClipSource, getTweetId } = EmbededVideoLogic();

  // FUNCTION 1: getStandardPlayer - code that returns the JSX for a video player depending on the urlType
  // PRECONDITIONS (1 parameter):
  // 1.) urlType: a string corresponding to one of the standard players
  // POSTCONDITIONS (1 possible outcome):
  // the player that matches the `urlType` parameter is returned
  const getStandardPlayer = urlType => {
    switch (urlType) {
      case "youtube":
        return (
          <YouTube 
            videoId={ getYoutubeVideoId(url) } 
            opts={ getYoutubeVideoOpts(url) }
            className={ styles.player }
          />
        );
      case "twitch-vod":
        return (
          <iframe
            title={ urlType }
            src={ getTwitchVodSource(url) }
            width="100%"
            height="100%"
            allowFullScreen
            className={ styles.player }
          >
          </iframe>
        );
      case "twitch-clip":
        return (
          <iframe
            title={ urlType }
            src={ getTwitchClipSource(url) }
            width="100%"
            height="100%"
            allowFullScreen
            className={ styles.player }
          >
          </iframe>
        );
      default: return null;
    };
  };

  /* ===== VARIABLES ===== */
  const urlType = getUrlType(url);

  /* ===== EMBEDED VIDEO COMPONENT ===== */

  // CASE 1: url is not defined. this case should only ever apply in the case where a *proof* is missing, so return
  // a message regarding that
  if (!url) {
    return (
      <h3>This submission has no proof.</h3>
    );
  }

  // CASE 2: URL type creates a standard player - return the player wrapped in an embeded video container
  if (standardPlayers.includes(urlType)) {
    return (
      <div className={ styles.embededVideo }>
        { getStandardPlayer(urlType) }
      </div>
    );
  }

  // CASE 3: URL is a twitter type - return the player wrapped in a embeded tweet container
  if (urlType === "twitter") {
    return (
      <div className={ styles.embededTweet }>
        <Tweet id={ getTweetId(url) } />
      </div>
    );
  }

  // CASE 4: render an error message if an embed is not supported (urlType is not standard / twitter)
  return (
    <div className={ styles.missing }>
      <h3>Embeded video is not supported for this link:&nbsp;</h3>
      <a href={ url } target="_blank" rel="noopener noreferrer">
        <div className={ styles.url }>
          <OpenInNewIcon className={ styles.test } fontSize="small" />
          { url }
        </div>
      </a>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default EmbededVideo;