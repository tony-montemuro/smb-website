import "./notifications.css";
import { Link } from "react-router-dom";
import FrontendHelper from "../../helper/FrontendHelper";
import LevelboardHelper from "../../helper/LevelboardHelper";

function NotificationPopup({ notification, setNotification }) {
    // helper functions
    const { capitalize, cleanLevelName } = FrontendHelper();
    const { dateB2F } = LevelboardHelper();

    // basic info component - this is information that is included in all types of notifications
    function NotificationBasicInfo({ notification }) {
        return <>
            <li>
                Game: <Link to={`/games/${ notification.level.mode.game.abb }`}>{ notification.level.mode.game.name }</Link> 
            </li>
            <li>
                Chart: <Link to={`/games/${ notification.level.mode.game.abb }/${ notification.level.misc ? "misc" : "main" }/${ notification.type }/${ notification.level.name }`}>
                    { cleanLevelName(notification.level.name) } ({ capitalize(notification.type) })
                </Link>
            </li>
        </>
    };

    // proof component - simple component used to display the proof of a notification to the user
    function NotificationProof({ proof }) {
        return proof ? 
            <a href={ notification.proof } target="_blank" rel="noopener noreferrer">Link</a>
        : 
            <i>None</i>
    };

    // message component - simple component used to display the message from a moderator
    function NotificationMessage({ message }) {
        return message ? 
            <>
                <h2>
                    <Link to={`/user/${ notification.moderator.id }`}>{ notification.moderator.username }</Link> also left a message:
                </h2>
                <p>"{ notification.message }"</p>
            </> 
        :
            null
    };

    console.log(notification);
    if (notification) {
        switch (notification.notif_type) {
            case "approve":
                return (
                    <div className="notifications-popup">
                        <div className="notifications-popup-inner">
                            <button onClick={ () => setNotification(null) }>Close</button>
                            <h2>
                                <Link to={`/user/${ notification.moderator.id }`}>{ notification.moderator.username }</Link> has approved the following submission: 
                            </h2>
                            <div className="notification-details">
                                <ul>
                                    <NotificationBasicInfo notification={ notification } />
                                    <li>{ capitalize(notification.type) }: { notification.record }</li>
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
                            <button onClick={ () => setNotification(null) }>Close</button>
                            <h2>
                                <Link to={`/user/${ notification.moderator.id }`}>{ notification.moderator.username }</Link> has submitted the following submission on your behalf: 
                            </h2>
                            <div className="notification-details">
                                <ul>
                                    <NotificationBasicInfo notification={ notification } />
                                    <li>{ capitalize(notification.type) }: { notification.record }</li>
                                    <li>Date: { dateB2F(notification.submitted_at) }</li>
                                    <li>Region: { notification.region.region_name }</li>
                                    <li>Monkey: { notification.monkey.monkey_name }</li>
                                    <li>Proof: <NotificationProof proof={ notification.proof } /></li>
                                </ul>
                            </div>
                            <NotificationMessage message={ notification.message } />
                        </div>
                    </div>
                );
            case "update":
                return (
                    <div className="notifications-popup">
                        <div className="notifications-popup-inner">
                            <button onClick={ () => setNotification(null) }>Close</button>
                            <h2>
                                <Link to={`/user/${ notification.moderator.id }`}>{ notification.moderator.username }</Link> has made the following updates to your submission: 
                            </h2>
                            <div className="notification-details">
                                <ul>
                                    <NotificationBasicInfo notification={ notification } />
                                    { notification.old_record ? 
                                        <li><span className="notifications-updated">{ capitalize(notification.type) }: { notification.old_record } → { notification.record }</span></li>
                                    :
                                        <li>{ capitalize(notification.type) }: { notification.record }</li>
                                    }
                                    { notification.old_submitted_at ? 
                                        <li><span className="notifications-updated">Date: { dateB2F(notification.old_submitted_at) } → { dateB2F(notification.submitted_at) }</span></li>
                                    :
                                        <li>Date: { dateB2F(notification.submitted_at) }</li>
                                    }
                                    { notification.old_monkey ?
                                        <li><span className="notifications-updated">Monkey: { notification.old_monkey.monkey_name } → { notification.monkey.monkey_name }</span></li>
                                    :
                                        <li>Monkey: { notification.monkey.monkey_name }</li>
                                    }
                                    { notification.old_proof ?
                                        <li>
                                            <span className="notifications-updated">
                                                Proof: <NotificationProof proof={ notification.old_proof } /> → <NotificationProof proof={ notification.proof } />
                                            </span>
                                        </li>
                                    :
                                        <li>Proof: <NotificationProof proof={ notification.proof } /></li>
                                    }
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
                            <button onClick={ () => setNotification(null) }>Close</button>
                            <h2>
                                <Link to={`/user/${ notification.moderator.id }`}>{ notification.moderator.username }</Link> has removed the following submission: 
                            </h2>
                            <div className="notification-details">
                                <ul>
                                    <NotificationBasicInfo notification={ notification } />
                                    <li>{ capitalize(notification.type) }: { notification.record }</li>
                                    <li>Deletion Date: { dateB2F(notification.notif_date) }</li>
                                </ul>
                            </div>
                            <NotificationMessage message={ notification.message } />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    } else {
        return null;
    }
};

export default NotificationPopup;