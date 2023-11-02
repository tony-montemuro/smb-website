/* ===== IMPORTS ===== */
import { ProfileContext } from "../../utils/Contexts";
import { useContext } from "react";
import styles from "./User.module.css";
import Container from "../../components/Container/Container.jsx";
import DiscordLogo from "../../components/DiscordLogo/DiscordLogo.jsx";
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

      { /* Roles - Render all the user's roles */ }
      <Container title="Roles" largeTitle>
        { profile.administrator &&
          <>
            <h2>Site Administrator</h2>
            <p>This user is responsible for maintaining SMBElite.</p>
          </>
        }
        { profile.moderated_games.length > 0 &&
          <>
            <h2>Game Moderator</h2>
            <p>This user is responsible for moderating the charts of at least <strong>1</strong> game. To see the specific list of games, go to the <strong>Game Moderators</strong> section.</p>
          </>
        }
        <h2>Normal User</h2>
        <p>This user has all of the privileges granted to newly registered users: submitting scores/times, updating submissions, reporting submissions, & updating their personal profile.</p>
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

      {/* Featured video - Render the user's featured video, if there is one */}
      { profile.featured_video &&
        <Container title="Featured Video" largeTitle>
          <EmbededVideo url={ profile.featured_video } />
          { profile.video_description &&
            <p>{ profile.video_description }</p>
          }
        </Container>
      }

      { /* Recent submissions - Render the user's recent submissions */ }
      <Container title="Recent Submissions" href={ `/recent-submissions?profile_id=${ profile.id }` } largeTitle>
        <RecentSubmissionsTable searchParams={ searchParams } renderGame renderLevelContext />
      </Container>

    </div>
  );
};

/* ===== EXPORTS ===== */
export default User;