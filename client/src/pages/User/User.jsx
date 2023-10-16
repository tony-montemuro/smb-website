/* ===== IMPORTS ===== */
import { ProfileContext } from "../../utils/Contexts";
import { useContext } from "react";
import styles from "./User.module.css";
import Container from "../../components/Container/Container.jsx";
import DiscordLogo from "../../components/DiscordLogo/DiscordLogo.jsx";
import EmbedHelper from "../../helper/EmbedHelper";
import EmbededVideo from "../../components/EmbededVideo/EmbededVideo.jsx";
import GameRow from "../../components/GameRow/GameRow.jsx";
import Items from "../../components/Items/Items.jsx";
import RecentSubmissionsTable from "../../components/RecentSubmissionsTable/RecentSubmissionsTable.jsx";
import SocialLink from "../../components/SocialLink/SocialLink.jsx";
import UserLogic from "./User.js";

function User({ imageReducer }) {
  /* ===== CONTEXTS ===== */

  // profile state from profile context
  const { profile } = useContext(ProfileContext);

  /* ===== VARIABLES ===== */
  const SOCIAL_SIZE = 50;

  /* ===== MEMOS & FUNCTIONS ===== */
  
  // memos & functions from the js file
  const { searchParams, socials, details, onGameRowClick } = UserLogic(); 

  // helper functions
  const { getUrlType } = EmbedHelper();

  /* ===== USER COMPONENT ===== */
  return (
    <div className={ styles.user }>

      { /* User information: render general information about the user */ }
      <Container title="User Information" largeTitle>

        { /* Contact - Render the user's social media information. */ }
        <h2>Socials</h2>
        <Items items={ socials } emptyMessage="This user has no socials.">
          <div className={ styles.socials }>
            <SocialLink name="youtube" username={ profile.youtube_handle } size={ SOCIAL_SIZE } />
            <SocialLink name="twitch" username={ profile.twitch_username } size={ SOCIAL_SIZE } />
            <SocialLink name="twitter" username={ profile.twitter_handle } size={ SOCIAL_SIZE } />
            <DiscordLogo discord={ profile.discord } size={ SOCIAL_SIZE } />
          </div>
        </Items>

        <hr />

        { /* Details - Render the user's details. */ }
        <h2>Details</h2>
        <Items items={ details } emptyMessage="This user has no details.">
          { profile.bio &&
            <p><b>About Me:</b> { profile.bio }</p>
          }
          { profile.birthday &&
            <p><b>Birthday:</b> { profile.birthday }</p>
          }
        </Items>

      </Container>

      {/* Featured video - Render the user's featured video, if there is one */}
      { profile.featured_video &&
        <Container title="Featured Video" largeTitle>
          <div className={ getUrlType(profile.featured_video) !== "twitter" ? styles.video : styles.twitter }>
            <EmbededVideo url={ profile.featured_video } />
          </div>
          { profile.video_description &&
            <p>{ profile.video_description }</p>
          }
        </Container>
      }

      { /* Recent submissions - Render the user's recent submissions */ }
      <Container title="Recent Submissions" href={ `/recent-submissions?profile_id=${ profile.id }` } largeTitle>
        <RecentSubmissionsTable searchParams={ searchParams } />
      </Container>

      { /* Games moderated - Render each game the user moderators, if at least one exists */ }
      { profile.moderated_games.length > 0 &&
        <Container title="Games Moderated" largeTitle>
          { profile.moderated_games.map((game, index) => {
            return (
              <GameRow 
                game={ game } 
                imageReducer={ imageReducer } 
                index={ index }
                onClick={ onGameRowClick } 
                key={ game.abb } 
              />
            );
          })}
        </Container>
      }

    </div>
  );
};

/* ===== EXPORTS ===== */
export default User;