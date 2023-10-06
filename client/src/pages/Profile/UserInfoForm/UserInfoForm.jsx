/* ===== IMPORTS ===== */
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useContext, useEffect } from "react";
import { UserContext } from "../../../utils/Contexts.js";
import dayjs from "dayjs";
import styles from "./UserInfoForm.module.css";
import Container from "../../../components/Container/Container.jsx";
import TextField from "@mui/material/TextField";
import UserInfoFormLogic from "./UserInfoForm.js";

function UserInfoForm({ countries }) {
  /* ===== VARIABLES ===== */
  const BIRTHDAY_MIN_DATE = "1900-01-01";
  const TEXT_AREA_LENGTH_MAX = 200;
  const DISCORD_LENGTH_MIN = 2;
  const DISCORD_LENGTH_MAX = 32;
  const TEXT_AREA_HEIGHT = 4;
  const TWITCH_LENGTH_MAX = 24;
  const TWITTER_LENGTH_MIN = 5;
  const TWITTER_LENGTH_MAX = 16;
  const USERNAME_LENGTH_MIN = 4;
  const USERNAME_LENGTH_MAX = 25;
  const YOUTUBE_LENGTH_MIN = 4;
  const YOUTUBE_LENGTH_MAX = 31;

  /* ===== CONTEXTS ===== */

  // user state from user context
  const { user } = useContext(UserContext);
  

  /* ===== STATES & FUNCTIONS ===== */

  // states and functions from the js file
  const { form, initForm, handleChange, handleBirthdayChange, uploadUserInfo } = UserInfoFormLogic();

  /* ===== EFFECTS ===== */

  // code that is executed when the component first mounts, OR when the user state is updated
  useEffect(() => {
    initForm(countries);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  /* ===== USER INFO FORM COMPONENT ===== */
  return form.user && form.countries &&
    <Container title={ `${ user.profile ? "Update " : "" }Profile Information` } isLargeHeader={ false }>
      <form className={ styles.form } onSubmit={ uploadUserInfo }>

        { /* Profile section - the general information describing a profile */ }
        <h3>Profile</h3>
        {/* <div className={ styles.input }>
          <label htmlFor="username">Username: </label>
          <input 
            id="username"
            type="text"
            placeholder="username"
            minLength={ USERNAME_LENGTH_MIN }
            maxLength={ USERNAME_LENGTH_MAX }
            value={ form.user.username }
            onChange={ handleChange }
            required={ true }
          />
          { form.error.username && <p>Error: { form.error.username }</p> }
        </div> */}
        <TextField 
          color={ form.error.username ? "error" : "primary" }
          error={ form.error.username ? true : false }
          fullWidth
          id="username"
          inputProps={ { minLength: USERNAME_LENGTH_MIN, maxLength: USERNAME_LENGTH_MAX } }
          helperText={ form.error.username }
          label="Username"
          placeholder="Between 4 and 20 characters..."
          onChange={ handleChange }
          required
          value={ form.user.username }
          variant="filled"
        />
        {/* <div className={ styles.input }>
          <label htmlFor="country">Country (optional): </label>
          <select id="country" value= { form.user.country } onChange={ handleChange }>
            <option key={ "null" } value={ "" }>--</option>
            { form.countries.map(country => (
              <option key={ country.iso2 } value={ country.iso2 }>{ country.name }</option>
            ))}
          </select>
        </div> */}
        <TextField
          fullWidth
          id="country"
          label="Country"
          select
          SelectProps={{ native: true }}
          onChange={ handleChange }
          value={ form.user.country }
          variant="filled"
        >
          <option key={ "null" } value={ "" }></option>
          { form.countries.map(country => {
            return (
              <option value={ country.iso2 } key={ country.iso2 }>{ country.name }</option>
            );
          })}
        </TextField>
        {/* <div className={ styles.input }>
          <label htmlFor="bio">About Me (optional): </label>
          <textarea
            id="bio"
            value={ form.user.bio }
            rows={ TEXT_AREA_HEIGHT }
            placeholder="Share a bit about yourself..."
            maxLength={ TEXT_AREA_LENGTH_MAX }
            onChange={ handleChange }
          >
          </textarea>
          { form.error.bio && <p>Error: { form.error.bio }</p> }
        </div> */}
        <TextField
          color={ form.error.bio ? "error" : "primary" }
          error={ form.error.bio ? true : false }
          fullWidth
          id="bio"
          inputProps={ { maxLength: TEXT_AREA_LENGTH_MAX } }
          helperText={ form.error.bio }
          label="About Me"
          multiline
          placeholder="Share a bit about yourself..."
          rows={ TEXT_AREA_HEIGHT }
          onChange={ handleChange }
          value={ form.user.bio }
          variant="filled"
        />
        <DatePicker 
          disableFuture
          label="Birthday"
          minDate={ dayjs(BIRTHDAY_MIN_DATE) }
          value={ dayjs(form.user.birthday) }
          onChange={ handleBirthdayChange }
          slotProps={{ 
            field: { clearable: true },
            textField: { variant: 'filled' }
          }}
        />
        {/* <div className={ styles.input }>
          <label htmlFor="birthday">Birthday (optional): </label>
          <input 
            id="birthday" 
            type="date" 
            min={ BIRTHDAY_MIN_DATE } 
            max={ dateB2F() }
            value={ form.user.birthday }
            onChange={ handleChange }
          />
        </div> */}

        <hr />

        { /* Socials section - any social media platforms the user might want to link to */ }
        <h3>Socials</h3>
        <TextField 
          color={ form.error.youtube_handle ? "error" : "primary" }
          error={ form.error.youtube_handle ? true : false }
          fullWidth
          id="youtube_handle"
          inputProps={ { minLength: YOUTUBE_LENGTH_MIN, maxLength: YOUTUBE_LENGTH_MAX } }
          helperText={ form.error.youtube_handle }
          label="YouTube Handle"
          placeholder="@username"
          onChange={ handleChange }
          value={ form.user.youtube_handle }
          variant="filled"
        />
        {/* <div className={ styles.input }>
          <label htmlFor="youtube_handle">YouTube Handle (optional): </label>
          <input
            id="youtube_handle"
            type="text"
            placeholder="@username"
            minLength={ YOUTUBE_LENGTH_MIN }
            maxLength={ YOUTUBE_LENGTH_MAX }
            value={ form.user.youtube_handle }
            onChange={ handleChange }
          />
        </div>
        { form.error.youtube_handle && <p>Error: { form.error.youtube_handle }</p> } */}
        <TextField 
          color={ form.error.twitch_username ? "error" : "primary" }
          error={ form.error.twitch_username ? true : false }
          fullWidth
          id="twitch_username"
          inputProps={ { maxLength: TWITCH_LENGTH_MAX } }
          helperText={ form.error.twitch_username }
          label="Twitch Handle"
          placeholder="username"
          onChange={ handleChange }
          value={ form.user.twitch_username }
          variant="filled"
        />
        {/* <div className={ styles.input }>
          <label htmlFor="twitch_username">Twitch Username (optional): </label>
          <input 
            id="twitch_username"
            type="text"
            placeholder="username"
            maxLength={ TWITCH_LENGTH_MAX }
            value={ form.user.twitch_username }
            onChange={ handleChange }
          />
        </div>
        { form.error.twitch_username && <p>Error: { form.error.twitch_username }</p> } */}
        <TextField 
          color={ form.error.twitter_handle ? "error" : "primary" }
          error={ form.error.twitter_handle ? true : false }
          fullWidth
          id="twitter_handle"
          inputProps={ { minLength: TWITTER_LENGTH_MIN, maxLength: TWITTER_LENGTH_MAX } }
          helperText={ form.error.twitter_handle }
          label="Twitter Handle"
          placeholder="@username"
          onChange={ handleChange }
          value={ form.user.twitter_handle }
          variant="filled"
        />
        {/* <div className={ styles.input }>
          <label htmlFor="twitter_handle">X (Twitter) Handle (optional): </label>
          <input
            id="twitter_handle"
            type="text"
            placeholder="@username"
            minLength={ TWITTER_LENGTH_MIN }
            maxLength={ TWITTER_LENGTH_MAX }
            value={ form.user.twitter_handle }
            onChange={ handleChange }
          />
        </div>
        { form.error.twitter_handle && <p>Error: { form.error.twitter_handle }</p> } */}
         <TextField 
          color={ form.error.discord ? "error" : "primary" }
          error={ form.error.discord ? true : false }
          fullWidth
          id="discord"
          inputProps={ { minLength: DISCORD_LENGTH_MIN, maxLength: DISCORD_LENGTH_MAX } }
          helperText={ form.error.discord }
          label="Discord Username"
          placeholder="username"
          onChange={ handleChange }
          value={ form.user.discord }
          variant="filled"
        />
        {/* <div className={ styles.input }>
          <label htmlFor="discord">Discord Username (optional): </label>
          <input 
            id="discord"
            type="text"
            placeholder="username"
            value={ form.user.discord }
            onChange={ handleChange }
          />
          { form.error.discord && <p>Error: { form.error.discord }</p> }
        </div> */}

        <hr />

        { /* Featured video section - allows user to enter a featured video to include on their profile */ }
        <h3>Featured Video</h3>
        <TextField 
          color={ form.error.featured_video ? "error" : "primary" }
          error={ form.error.featured_video ? true : false }
          fullWidth
          id="featured_video"
          helperText={ form.error.featured_video }
          label="Featured Video"
          placeholder="Any video you like"
          onChange={ handleChange }
          value={ form.user.featured_video }
          variant="filled"
        />
        {/* <div className={ styles.input }>
          <label htmlFor="featured_video">Featured Video URL (optional): </label>
          <input 
            id="featured_video"
            type="url"
            placeholder="Any video you like"
            value={ form.user.featured_video }
            onChange={ handleChange }
          />
        </div> */}
        <TextField
          color={ form.error.video_description ? "error" : "primary" }
          error={ form.error.video_description ? true : false }
          fullWidth
          id="video_description"
          inputProps={ { maxLength: TEXT_AREA_LENGTH_MAX } }
          helperText={ form.error.video_description }
          label="Video Description"
          multiline
          placeholder="Include a description of the video"
          rows={ TEXT_AREA_HEIGHT }
          onChange={ handleChange }
          value={ form.user.video_description }
          variant="filled"
        />
        {/* { form.error.featured_video && <p>Error: { form.error.featured_video }</p> }
        <div className={ styles.input }>
          <label htmlFor="video_description">Video Description (optional): </label>
          <textarea
            id="video_description"
            value={ form.user.video_description }
            rows={ TEXT_AREA_HEIGHT }
            placeholder="Include a description"
            onChange={ handleChange }
          >
          </textarea>
        </div>
        { form.error.video_description && <p>Error: { form.error.video_description }</p> } */}

        { /* Form button: button user uses to complete the form. Will disable while application processes form. */ }
        <button type="submit" disabled={ form.uploading }>{ user.profile ? "Update " : "Create " }Profile</button>

      </form>
    </Container>
};

/* ===== EXPORTS ===== */
export default UserInfoForm;