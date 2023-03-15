/* ===== IMPORTS ===== */
import "./notifications.css";
import { Link } from "react-router-dom";
import { useContext } from "react";
import FrontendHelper from "../../helper/FrontendHelper";
import { UserContext } from "../../App";

function NotificationPopup({ hook }) {
    /* ===== CONTEXTS ===== */

    // user state from user context
    const { user } = useContext(UserContext);

    /* ===== VARIABLES ===== */
    const notification = hook.state.current;

    /* ===== FUNCTIONS ===== */

    // helper functions
    const { capitalize, cleanLevelName, dateB2F, recordB2F } = FrontendHelper();

    /* ===== COMPONENTS ===== */

    // basic info component - this is information that is included in all types of notifications
    function NotificationBasicInfo({ notification }) {
        return <>
            <li>
                Game: <Link to={`/games/${ notification.level.mode.game.abb }`}>{ notification.level.mode.game.name }</Link> 
            </li>
            <li>
                Chart: <Link to={`/games/${ notification.level.mode.game.abb }/${ notification.level.misc ? "misc" : "main" }/${ notification.score ? "score" : "time" }/${ notification.level.name }`}>
                    { cleanLevelName(notification.level.name) } ({ capitalize(notification.score ? "score" : "time") })
                </Link>
            </li>
        </>
    };

    // proof component - simple component used to display the proof of a notification to the user
    function NotificationProof({ proof }) {
        return proof ? 
            <a href={ proof } target="_blank" rel="noopener noreferrer">Link</a>
        : 
            <i>None</i>
    };

    // message component - simple component used to display the message from notification sender
    function NotificationMessage({ message }) {
        return message ? 
            <>
                <h2>
                    <Link to={`/user/${ notification.creator.id }`}>{ notification.creator.username }</Link> also left a message:
                </h2>
                <p>"{ notification.message }"</p>
            </> 
        :
            null
    };

    if (notification) {
        switch (notification.notif_type) {
            case "approve":
                return (
                    <div className="notifications-popup">
                        <div className="notifications-popup-inner">
                            <button onClick={ () => hook.setState({ ...hook.state, current: null }) }>Close</button>
                            <h2>
                                <Link to={`/user/${ notification.creator.id }`}>{ notification.creator.username }</Link> has approved the following submission: 
                            </h2>
                            <div className="notification-details">
                                <ul>
                                    <NotificationBasicInfo notification={ notification } />
                                    <li>{ capitalize(notification.score ? "score" : "time") }: { recordB2F(notification.record, notification.score ? "score" : "time") }</li>
                                    <li>Approval Date: { dateB2F(notification.notif_date) }</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                );
            case "insert":
                return (
                    <div className="notifications-popup">
                        <div className="notifications-popup-inner">
                            <button onClick={ () => hook.setState({ ...hook.state, current: null }) }>Close</button>
                            <h2>
                                <Link to={`/user/${ notification.creator.id }`}>{ notification.creator.username }</Link> has submitted the following submission on your behalf: 
                            </h2>
                           <div className="notification-details">
                                <ul>
                                    <NotificationBasicInfo notification={ notification } />
                                    <li>{ capitalize(notification.score ? "score" : "time") }: { recordB2F(notification.record, notification.score ? "score" : "time") }</li>
                                    <li>Date: { dateB2F(notification.submission.submitted_at) }</li>
                                    <li>Region: { notification.submission.region.region_name }</li>
                                    <li>Monkey: { notification.submission.monkey.monkey_name }</li>
                                    <li>Proof: <NotificationProof proof={ notification.submission.proof } /></li>
                                    <li>Live: { notification.submission.live ? "Yes" : "No" }</li>
                                </ul>
                            </div>
                            <NotificationMessage message={ notification.message } />
                        </div>
                    </div>
                );
            case "delete":
                return (
                    <div className="notifications-popup">
                        <div className="notifications-popup-inner">
                            <button onClick={ () => hook.setState({ ...hook.state, current: null }) }>Close</button>
                            <h2>
                                <Link to={`/user/${ notification.creator.id }`}>{ notification.creator.username }</Link> has removed the following submission: 
                            </h2>
                            <div className="notification-details">
                                <ul>
                                    <NotificationBasicInfo notification={ notification } />
                                    <li>{ capitalize(notification.score ? "score" : "time") }: { recordB2F(notification.record, notification.score ? "score" : "time") }</li>
                                    <li>Deletion Date: { dateB2F(notification.notif_date) }</li>
                                </ul>
                            </div>
                            <NotificationMessage message={ notification.message } />
                        </div>
                    </div>
                );
            case "report":
                return (
                    <div className="notifications-popup">
                        <div className="notifications-popup-inner">
                            <button onClick={ () => hook.setState({ ...hook.state, current: null }) }>Close</button>
                            <h2>
                                <Link to={ `/user/${ notification.creator.id }` }>{ notification.creator.username }</Link> has reported { user.id === notification.submission.user.id ? "your" : "the following" } submission:
                            </h2>
                            <div className="notification-details">
                                <ul>
                                    { user.id !== notification.submission.user.id ? 
                                        <li>User: <Link to={ `/user/${ notification.submission.user.id }`}>{ notification.submission.user.username }</Link></li>
                                    :
                                        null
                                    } 
                                    <NotificationBasicInfo notification={ notification } />
                                    <li>{ capitalize(notification.score ? "score" : "time") }: { recordB2F(notification.record, notification.score ? "score" : "time") }</li>
                                    <li>Date: { dateB2F(notification.submission.submitted_at) }</li>
                                    <li>Region: { notification.submission.region.region_name }</li>
                                    <li>Monkey: { notification.submission.monkey.monkey_name }</li>
                                    <li>Proof: <NotificationProof proof={ notification.submission.proof } /></li>
                                    <li>Live: { notification.submission.live ? "Yes" : "No" }</li>
                                </ul>
                            </div>
                            <NotificationMessage message={ notification.message } />
                            { user.id === notification.submission.user.id ? 
                                <>
                                    <p><b>Note: </b><i>It is suggested that you ensure all properties of your submission are valid. If you are confident
                                    your submission is fine, do not worry. If not, a moderator may be forced to delete your submission!</i></p>
                                    <p><i>If a moderator falsely deletes any of your submissions, please contact the moderation team.</i></p>
                                </>
                            :
                                null
                            } 
                        </div>
                    </div>
                )
            default:
                return null;
        }
    } else {
        return null;
    }
};

export default NotificationPopup;