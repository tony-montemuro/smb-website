/* ===== IMPORTS ===== */
import "./Profile.css";
import { useContext, useEffect } from "react";
import UserInfoFormLogic from "./UserInfoForm.js";
import { UserContext } from "../../utils/Contexts";

function UserInfoForm() {
  /* ===== VARIABLES ===== */
  const BIO_WIDTH = 50;
  const BIO_HEIGHT = 4;

  /* ===== CONTEXTS ===== */

  // user state from user context
  const { user } = useContext(UserContext);

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
      <h2>{ user.profile && "Update " }Profile Information</h2>

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
          { form.error.username && <p>Error: { form.error.username }</p> }

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
            value={ form.user.bio }
            rows={ BIO_HEIGHT }
            cols={ BIO_WIDTH } 
            placeholder="About Me"
            onChange={ handleChange }
          >
          </textarea>

          { /* If error.bio is defined, bio field had an issue. Render it here. */ }
          { form.error.bio && <p>Error: { form.error.bio }</p> }

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

        { /* Youtube Handle field: an optional text field where the user can enter their youtube handle. */ }
        <div className="profile-info-entry">
          <label htmlFor="youtube_handle">YouTube Handle (optional): </label>
          <input
            id="youtube_handle"
            type="text"
            placeholder="@username"
            value={ form.user.youtube_handle }
            onChange={ handleChange }
            className="profile-url-text"
          />
        </div>

        { /* If error.youtube_handle is defined, youtube handle field had an issue. Render it here. */ }
        { form.error.youtube_handle && <p>Error: { form.error.youtube_handle }</p> }

        { /* Twitch Username field: an optional text field where the user can enter their twitch username. */ }
        <div className="profile-info-entry">
          <label htmlFor="twitch_username">Twitch Username (optional): </label>
          <input 
            id="twitch_username"
            type="text"
            placeholder="username"
            value={ form.user.twitch_username }
            onChange={ handleChange }
            className="profile-url-text"
          />
        </div>

        { /* If error.twitch_username is defined, twitch username field had an issue. Render it here. */ }
        { form.error.twitch_username && <p>Error: { form.error.twitch_username }</p> }

        { /* Twitter Username field: an optional text field where the user can enter their twitter handle. */ }
        <div className="profile-info-entry">
          <label htmlFor="twitter_handle">Twitter Handle (optional): </label>
          <input
            id="twitter_handle"
            type="text"
            placeholder="@username"
            value={ form.user.twitter_handle }
            onChange={ handleChange }
            className="profile-url-text"
          />
        </div>

        { /* If error.twitter_handle is defined, twitter handle field had an issue. Render it here. */ }
        { form.error.twitter_handle && <p>Error: { form.error.twitter_handle }</p> }

        { /* Discord field: an optional text field where the user can enter their discord username.
        If the user does choose to enter a discord username, it's form will be validated. */ }
        <div className="profile-info-entry">
          <label htmlFor="discord">Discord Username (optional): </label>
          <input 
            id="discord"
            type="text"
            placeholder="username"
            value={ form.user.discord }
            onChange={ handleChange }
          />

          { /* If error.discord is defined, discord field had an issue. Render it here. */ }
          { form.error.discord && <p>Error: { form.error.discord }</p> }

          <h3>Featured Video</h3>

          { /* Featured YouTube Video URL: an optional text field that allows the user to include a YouTube
          video of their choice on their page. */ }
          <div className="profile-info-entry">
            <label htmlFor="featured_video">Featured YouTube Video URL (optional): </label>
            <input 
              id="featured_video"
              type="url"
              placeholder="Any YouTube video you like!"
              value={ form.user.featured_video }
              onChange={ handleChange }
            />
          </div>

          { /* If error.featured_video is defined, featured video field had an issue. Render it here. */ }
          { form.error.featured_video && <p>Error: { form.error.featured_video }</p> }

          { /* Video Description: an optional textarea that allows the user to include a description with the
          featured video of their choice on their page. */ }
          <div className="profile-info-entry">
            <label htmlFor="video_description">Video Description (optional): </label>
            <textarea
              id="video_description"
              value={ form.user.video_description }
              rows={ BIO_HEIGHT }
              cols={ BIO_WIDTH } 
              placeholder="Include a description"
              onChange={ handleChange }
            >
            </textarea>
          </div>

          { /* If error.video_description is defined, video description field had an issue. Render it here. */ }
          { form.error.video_description && <p>Error: { form.error.video_description }</p> }

        </div>

        { /* Form button: button user uses to complete the form. Will disable while application processes form. */ }
        <button type="submit" disabled={ form.uploading }>{ user.profile ? "Update " : "Create " }Profile</button>

      </form>
    </div>
};

/* ===== EXPORTS ===== */
export default UserInfoForm;