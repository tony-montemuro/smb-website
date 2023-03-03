import "./profile.css";
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import ProfileInit from "./ProfileInit";
import SimpleAvatar from "../../components/SimpleAvatar/SimpleAvatar";

function Profile({ cache }) {
    // states and functions from the init file
    const { 
        loading,
        userForm,
        avatarForm,
        avatarRef,
        initForms,
        handleChange,
        updateUserInfo,
        avatarSubmit,
        signOut
    } = ProfileInit();

    // code that is executed when the page is first loaded, or when the cache fields are updated
    useEffect(() => {
        if (cache.profiles && cache.countries) {
            initForms(cache.profiles, cache.countries);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cache.profiles, cache.countries]);

  return (
    <>
        <div className="profile-header">
            <h1>Edit Your Profile</h1>
        </div>
        { loading ? (
            "Loading..."
         ) : 
         <>
            <div className="profile-body">
                <div className="profile-user-info">
                    <h2>Edit User Information</h2>
                    <form className="profile-info-form" onSubmit={ (e) => updateUserInfo(e, cache.profiles) }>
                        <div className="profile-info-entry">
                            <label htmlFor="username">Username: </label>
                            <input 
                                id="username"
                                type="text"
                                placeholder="username"
                                value={ userForm.user.username }
                                onChange={ handleChange }
                            />
                            { userForm.error.username ? <p>{ userForm.error.username }</p> : null }
                        </div>
                        <div className="profile-info-entry">
                            <label htmlFor="bio">About Me (optional): </label>
                            <textarea
                                id="bio"
                                rows={ 4 }
                                cols={ 50 } 
                                placeholder="About Me"
                                value={ userForm.user.bio }
                                onChange={ handleChange }
                            />
                            { userForm.error.bio ? <p>{ userForm.error.bio }</p> : null }
                        </div>
                        <div className="profile-info-entry">
                            <label htmlFor="country">Country (optional): </label>
                            <select 
                                id="country"
                                value= { userForm.user.country }
                                onChange={ handleChange }
                            >
                                <option key={ "null" } value={ "" }>--</option>
                                { userForm.countries.map(country => (
                                    <option key={ country.iso2 } value={ country.iso2 }>{ country.name }</option>
                                ))}
                            </select>
                        </div>
                        <div className="profile-info-entry">
                            <label htmlFor="youtube_url">YouTube URL (optional): </label>
                            <input
                                id="youtube_url"
                                type="url"
                                placeholder="https://www.youtube.com/ChannelUrl"
                                value={ userForm.user.youtube_url }
                                onChange={ handleChange }
                                className="profile-url-text"
                            />
                        </div>
                        <div className="profile-info-entry">
                            <label htmlFor="twitch_url">Twitch URL (optional): </label>
                            <input 
                                id="twitch_url"
                                type="url"
                                placeholder="https://www.twitch.tv/Username"
                                value={ userForm.user.twitch_url }
                                onChange={ handleChange }
                                className="profile-url-text"
                            />
                        </div>
                        <div className="profile-info-entry">
                            <label htmlFor="discord">Discord Username (optional): </label>
                            <input 
                                id="discord"
                                type="text"
                                placeholder="Username#0000"
                                value={ userForm.user.discord }
                                onChange={ handleChange }
                            />
                            { userForm.error.discord ? <p>{ userForm.error.discord }</p> : null }
                        </div>
                        <button disabled={ userForm.updating }>Update Profile</button>
                    </form>
                </div>
                <div className="profile-avatar-info">
                    <h2>Update Avatar</h2>
                    <p><b>Note:</b> Must be JPEG or PNG, and cannot exceed 5 MB. If your avatar does not update immediately, give it some time.</p>
                    <form className="profile-avatar-form" onSubmit={ avatarSubmit }>
                        <div className="profile-avatar"><SimpleAvatar url={ avatarForm.avatar_url } size={ 150 } imageReducer={ cache.imageReducer } /></div>
                        <label htmlFor="avatar-update"></label>
                        <input
                            type="file"
                            id="avatar-update"
                            accept=".jpg,.jpeg,.png"
                            ref={ avatarRef }
                        />
                        <button disabled={ avatarForm.updating }>Save</button>
                        { avatarForm.error ? 
                            <p> { avatarForm.error }</p>    
                        :
                            null
                        }
                    </form>
                </div>
            </div>
            <div className="profile-footer">
                <h2>Options</h2>
                <Link to={ `/user/${userForm.user.id}` }>
                    <button>View Profile</button>
                </Link>
                <button onClick={ signOut }> Sign Out</button>
            </div>
         </>
        }
    </>
  );
};

export default Profile;