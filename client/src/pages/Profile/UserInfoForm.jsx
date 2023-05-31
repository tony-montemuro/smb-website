/* ===== IMPORTS ===== */
import "./Profile.css";
import { useEffect } from "react";
import UserInfoFormLogic from "./UserInfoForm.js";

function UserInfoForm() {
  /* ===== VARIABLES ===== */
  const BIO_WIDTH = 50;
  const BIO_HEIGHT = 4;

  /* ===== STATES & FUNCTIONS ===== */

  // states and functions from the js file
  const { form, initForm, handleChange, uploadUserInfo } = UserInfoFormLogic();

  /* ===== EFFECTS ===== */

  // code that is executed when the component first mounts
  useEffect(() => {
    initForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ===== USER INFO FORM COMPONENT ===== */
  return form.user && form.countries &&
    <div className="profile-user-info">

      { /* Form header */ }
      <h2>Edit User Information</h2>

      { /* User form */ }
      <form className="profile-info-form" onSubmit={ uploadUserInfo }>

        <h3>Profile</h3>

        { /* Username field: a required text field that every user must have filled before submitting */ }
        <div className="profile-info-entry">
          <label htmlFor="username">Username: </label>
          <input 
            id="username"
            type="text"
            placeholder="username"
            value={ form.user.username }
            onChange={ handleChange }
          />

          { /* If error.username is defined, username field had an issue. Render it here. */ }
          { form.error.username && <p>{ form.error.username }</p> }

        </div>

        { /* Country field: an optional dropdown of countries that the user can select from. */ }
        <div className="profile-info-entry">
          <label htmlFor="country">Country (optional): </label>
          <select id="country" value= { form.user.country } onChange={ handleChange }>
            <option key={ "null" } value={ "" }>--</option>
            { form.countries.map(country => (
              <option key={ country.iso2 } value={ country.iso2 }>{ country.name }</option>
            ))}
          </select>
        </div>

        { /* About me field: an optional textarea field, with the only requirement being it remains under 200 characters. */ }
        <div className="profile-info-entry">
          <label htmlFor="bio">About Me (optional): </label>
          <textarea
            id="bio"
            rows={ BIO_HEIGHT }
            cols={ BIO_WIDTH } 
            placeholder="About Me"
            value={ form.user.bio }
            onChange={ handleChange }
          />

          { /* If error.bio is defined, bio field had an issue. Render it here. */ }
          { form.error.bio && <p>{ form.error.bio }</p> }

        </div>

        <div className="profile-info-entry">
          <label htmlFor="birthday">Birthday (optional): </label>
          <input 
            id="birthday" 
            type="date" 
            min="1900-01-01" 
            value={ form.user.birthday }
            onChange={ handleChange }
          />
        </div>

        <h3>Socials</h3>

        { /* Youtube URL field: an optional text field where the user can enter their youtube URL. */ }
        <div className="profile-info-entry">
          <label htmlFor="youtube_url">YouTube URL (optional): </label>
          <input
            id="youtube_url"
            type="url"
            placeholder="https://www.youtube.com/ChannelUrl"
            value={ form.user.youtube_url }
            onChange={ handleChange }
            className="profile-url-text"
          />
        </div>

        { /* Twitch URL field: an optional text field where the user can enter their twitch URL. */ }
        <div className="profile-info-entry">
          <label htmlFor="twitch_url">Twitch URL (optional): </label>
          <input 
            id="twitch_url"
            type="url"
            placeholder="https://www.twitch.tv/Username"
            value={ form.user.twitch_url }
            onChange={ handleChange }
            className="profile-url-text"
          />
        </div>

        { /* Discord URL field: an optional text field where the user can enter their discord username.
        If the user does choose to enter a discord username, it's form will be validated. */ }
        <div className="profile-info-entry">
          <label htmlFor="discord">Discord Username (optional): </label>
          <input 
            id="discord"
            type="text"
            placeholder="Username#0000"
            value={ form.user.discord }
            onChange={ handleChange }
          />

          { /* If error.discord is defined, discord field had an issue. Render it here. */ }
          { form.error.discord && <p>{ form.error.discord }</p> }

          <h3>Featured Video</h3>

          { /* Featured YouTube Video URL: an optional text field that allows the user to include a YouTube
          video of their choice on their page. */ }
          <div className="profile-info-entry">
            <label htmlFor="featured_video">Featured YouTube Video URL (optional): </label>
            <input 
              id="featured_video"
              type="text"
              placeholder="Any YouTube video you like!"
              value={ form.user.featured_video }
              onChange={ handleChange }
            />
          </div>

          { /* If error.featured_video is defined, featured video field had an issue. Render it here. */ }
          { form.error.featured_video && <p>{ form.error.featured_video }</p> }

          { /* Video Description: an optional text field that allows the user to include a description with the
          featured video of their choice on their page. */ }
          <div className="profile-info-entry">
            <label htmlFor="video_description">Video Description (optional): </label>
            <textarea
              id="video_description"
              rows={ BIO_HEIGHT }
              cols={ BIO_WIDTH } 
              placeholder="Include a description"
              value={ form.user.video_description }
              onChange={ handleChange }
            />
          </div>

          { /* If error.video_description is defined, video description field had an issue. Render it here. */ }
          { form.error.video_description && <p>{ form.error.video_description }</p> }

        </div>

        { /* Form button: button user uses to complete the form. Will disable while application processes form. */ }
        <button disabled={ form.uploading }>Update Profile</button>

      </form>
    </div>
};

/* ===== EXPORTS ===== */
export default UserInfoForm;