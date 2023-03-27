/* ===== IMPORTS ===== */
import "./Profile.css";

function UserInfoForm({ form, handleChange, formSubmit }) {
  /* ===== USER INFO FORM COMPONENT ===== */
  return (
    <div className="profile-user-info">

      { /* Form header */ }
      <h2>Edit User Information</h2>

      { /* User form */ }
      <form className="profile-info-form" onSubmit={ formSubmit }>

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

        { /* About me field: an optional textarea field, with the only requirement being it remains under 200 characters. */ }
        <div className="profile-info-entry">
          <label htmlFor="bio">About Me (optional): </label>
          <textarea
            id="bio"
            rows={ 4 }
            cols={ 50 } 
            placeholder="About Me"
            value={ form.user.bio }
            onChange={ handleChange }
          />

          { /* If error.bio is defined, bio field had an issue. Render it here. */ }
          { form.error.bio && <p>{ form.error.bio }</p> }

        </div>

        { /* Country field: an optional dropdown of countries that the user can select from. */ }
        <div className="profile-info-entry">
          <label htmlFor="country">Country (optional): </label>
          <select 
            id="country"
            value= { form.user.country }
            onChange={ handleChange }
          >
            <option key={ "null" } value={ "" }>--</option>
            { form.countries.map(country => (
              <option key={ country.iso2 } value={ country.iso2 }>{ country.name }</option>
            ))}
          </select>
        </div>

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

        </div>

        { /* Form button: button user uses to complete the form. Will disable while application processes form. */ }
        <button disabled={ form.updating }>Update Profile</button>

      </form>
    </div>
  );
  
};

/* ===== EXPORTS ===== */
export default UserInfoForm;