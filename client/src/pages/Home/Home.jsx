/* ===== IMPORTS ===== */
import { useEffect } from "react";
import styles from "./Home.module.css";
import Container from "../../components/Container/Container.jsx";
import GameSearch from "../../components/GameSearch/GameSearch.jsx";
import HomeLogic from "./Home.js";
import Items from "../../components/Items/Items.jsx";
import Loading from "../../components/Loading/Loading.jsx";
import NewsPost from "./NewsPost.jsx";
import RecentSubmissionsTable from "../../components/RecentSubmissionsTable/RecentSubmissionsTable.jsx";

function Home({ imageReducer }) {
  /* ===== STATES & FUNCTIONS ===== */

  // states and functions from the js file
  const { posts, getPosts, navigateToGame } = HomeLogic();

  /* ===== VARIABLES ===== */
  const GAMES_PER_PAGE = 5;
  const gameRowOptions = {
    useCard: false,
    onGameRowClick: navigateToGame
  };

  /* ===== EFFECTS ===== */

  // code that is executed when the home component mounts
  useEffect(() => {
    getPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ===== HOME COMPONENT ===== */
  return (
    <div className={ styles.home }>

      { /* Left - render a game search component, as well as a recent submissions table */ }
      <div className={ styles.left }>
        <Container title="Games" href="/games" largeTitle>
          <GameSearch gamesPerPage={ GAMES_PER_PAGE } imageReducer={ imageReducer } gameRowOptions={ gameRowOptions } />
        </Container>
        <Container title="Recent Submissions" href="/recent-submissions" largeTitle>
          <RecentSubmissionsTable />
        </Container>
      </div>

      {/* Right - render the 3 most recent news posts */}
      <div className={ styles.right }>
        <Container title="News" href="/news" largeTitle>
          { posts ?
            <Items items={ posts } emptyMessage={ "No posts have been created yet!" }>
              <div className={ styles.posts }>
                { posts.map(post => {
                  return <NewsPost post={ post } key={ post.id } />;
                })}
              </div>
            </Items>
          :
            <Loading />
          }
        </Container>
      </div>

    </div>
  );
};

/* ===== EXPORTS ===== */
export default Home;