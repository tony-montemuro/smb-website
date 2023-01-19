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
         <div className="profile-body">
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
                    <label htmlFor="country">Country (optional): </label>
                    <select 
                        id="country"
                        value= { userForm.user.country }
                        onChange={ handleChange }
                    >
                        <option key={ "null" } value={ "" }>--</option>
                        { userForm.countryList.map(country => (
                            <option key={ country.iso2 } value={ country.iso2 }>{ country.name }</option>
                        ))}
                    </select>
                </div>
                <div className="profile-info-entry">
                    <label htmlFor="youtube_url">YouTube URL (optional): </label>
                    <input
                        id="youtube_url"
                        type="url"
                        placeholder="https://www.youtube.com/yourChannelUrl"
                        value={ userForm.user.youtube_url }
                        onChange={ handleChange }
                    />
                </div>
                <div className="profile-info-entry">
                    <label htmlFor="twitch_url">Twitch URL (optional): </label>
                    <input 
                        id="twitch_url"
                        type="url"
                        placeholder="https://www.twitch.tv/yourTwitch"
                        value={ userForm.user.twitch_url }
                        onChange={ handleChange }
                    />
                </div>
                <button disabled={ userForm.updating }>Update Profile</button>
                { userForm.updated ? 
                    <p className="profile-info-update">Your profile has been updated.</p>
                :   
                    null
                }
            </form>
            <h2>Update Avatar</h2>
            <form className="profile-avatar-form" onSubmit={ avatarSubmit }>
            <p><b>Note:</b> Must be JPEG or PNG, and cannot exceed 5 MB. If your avatar does not update immediately, give it some time.</p>
                <div className="profiles-avatar"><SimpleAvatar url={ avatarForm.avatar_url } size={ 150 } imageReducer={ cache.imageReducer } /></div>
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
            <h2>Options</h2>
            <div className="profile-btns">
                <Link to={ `/user/${userForm.user.id}` }>
                    <button>View Profile</button>
                </Link>
                <button onClick={ signOut }> Sign Out</button>
            </div>   
         </div>
        }
    </>
  );
};

export default Profile;