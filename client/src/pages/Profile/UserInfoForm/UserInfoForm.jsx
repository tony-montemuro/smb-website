/* ===== IMPORTS ===== */
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useContext, useEffect } from "react";
import { UserContext } from "../../../utils/Contexts.js";
import dayjs from "dayjs";
import styles from "./UserInfoForm.module.css";
import Container from "../../../components/Container/Container.jsx";
import Loading from "../../../components/Loading/Loading.jsx";
import SectionTitle from "./SectionTitle.jsx";
import TextField from "@mui/material/TextField";
import UserInfoFormLogic from "./UserInfoForm.js";

function UserInfoForm({ countries }) {
  /* ===== VARIABLES ===== */
  const BIRTHDAY_MIN_DATE = "1900-01-01";
  const TEXT_AREA_LENGTH_MAX = 200;
  const DISCORD_LENGTH_MIN = 2;
  const DISCORD_LENGTH_MAX = 32;
  const TEXT_AREA_HEIGHT = 2;
  const TWITCH_LENGTH_MAX = 24;
  const TWITTER_LENGTH_MIN = 5;
  const TWITTER_LENGTH_MAX = 16;
  const USERNAME_LENGTH_MIN = 4;
  const USERNAME_LENGTH_MAX = 20;
  const YOUTUBE_LENGTH_MIN = 4;
  const YOUTUBE_LENGTH_MAX = 31;
  const FEATURED_VIDEO_LENGTH_MAX = 256;

  /* ===== CONTEXTS ===== */

  // user state from user context
  const { user } = useContext(UserContext);

  /* ===== STATES & FUNCTIONS ===== */

  // states and functions from the js file
  const { 
    form, 
    initForm, 
    handleChange, 
    handleBirthdayChange,
    hasChanged, 
    handleReset,
    uploadUserInfo 
  } = UserInfoFormLogic();

  /* ===== EFFECTS ===== */

  // code that is executed when the component first mounts OR when the countries state updates OR when the user state is updated
  useEffect(() => {
    if (countries) {
      initForm(countries);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countries, user]);

  /* ===== USER INFO FORM COMPONENT ===== */
  return (
    <Container title={ `${ user.profile ? "Update " : "" }Profile Information` }>
      { form.user && form.countries ?
        <form className={ styles.form } onSubmit={ uploadUserInfo }>

          { /* Profile section - the general information describing a profile */ }
          <SectionTitle title="profile" hasChanged={ hasChanged } onClick={ handleReset } />
          <TextField 
            autoComplete="username"
            color={ form.error.username ? "error" : "primary" }
            error={ form.error.username }
            fullWidth
            id="username"
            inputProps={ { minLength: USERNAME_LENGTH_MIN, maxLength: USERNAME_LENGTH_MAX } }
            helperText={ form.error.username ? form.error.username : `${ form.user.username.length }/${ USERNAME_LENGTH_MAX }` }
            label="Username"
            placeholder="Between 4 and 20 characters..."
            onChange={ handleChange }
            required
            value={ form.user.username }
            variant="filled"
          />
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
            <option key="null" value=""></option>
            { form.countries.map(country => {
              return (
                <option value={ country.iso2 } key={ country.iso2 }>{ country.name }</option>
              );
            })}
          </TextField>
          <TextField
            fullWidth
            helperText={ `${ form.user.bio.length }/${ TEXT_AREA_LENGTH_MAX }` }
            id="bio"
            inputProps={ { maxLength: TEXT_AREA_LENGTH_MAX } }
            label="About Me"
            multiline
            placeholder="Share a bit about yourself..."
            rows={ TEXT_AREA_HEIGHT }
            onChange={ handleChange }
            value={ form.user.bio }
            variant="filled"
          />
          <DatePicker 
            disableHighlightToday
            disableFuture
            label="Birthday"
            format="YYYY-MM-DD"
            minDate={ dayjs(BIRTHDAY_MIN_DATE) }
            value={ form.user.birthday ? dayjs(form.user.birthday) : form.user.birthday }
            onChange={ handleBirthdayChange }
            slotProps={{
              field: { clearable: true },
              textField: { variant: "filled" }
            }}
          />

          <hr />

          { /* Socials section - any social media platforms the user might want to link to */ }
          <SectionTitle title="socials" hasChanged={ hasChanged } onClick={ handleReset } />
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
          <TextField 
            color={ form.error.twitch_username ? "error" : "primary" }
            error={ form.error.twitch_username ? true : false }
            fullWidth
            id="twitch_username"
            inputProps={ { maxLength: TWITCH_LENGTH_MAX } }
            helperText={ form.error.twitch_username }
            label="Twitch Username"
            placeholder="username"
            onChange={ handleChange }
            value={ form.user.twitch_username }
            variant="filled"
          />
          <TextField 
            color={ form.error.twitter_handle ? "error" : "primary" }
            error={ form.error.twitter_handle ? true : false }
            fullWidth
            id="twitter_handle"
            inputProps={ { minLength: TWITTER_LENGTH_MIN, maxLength: TWITTER_LENGTH_MAX } }
            helperText={ form.error.twitter_handle }
            label="X (Twitter) Handle"
            placeholder="@username"
            onChange={ handleChange }
            value={ form.user.twitter_handle }
            variant="filled"
          />
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

          <hr />

          { /* Featured video section - allows user to enter a featured video to include on their profile */ }
          <SectionTitle title="featured_video" hasChanged={ hasChanged } onClick={ handleReset } />
          <TextField 
            color={ form.error.featured_video ? "error" : "primary" }
            error={ form.error.featured_video ? true : false }
            fullWidth
            id="featured_video"
            inputProps={ { maxLength: FEATURED_VIDEO_LENGTH_MAX } }
            helperText={ form.error.featured_video }
            label="Featured Video"
            placeholder="Any video you like"
            onChange={ handleChange }
            value={ form.user.featured_video }
            variant="filled"
          />
          <TextField
            color={ form.error.video_description ? "error" : "primary" }
            error={ form.error.video_description ? true : false }
            fullWidth
            id="video_description"
            inputProps={ { maxLength: TEXT_AREA_LENGTH_MAX } }
            helperText={ form.error.video_description ? form.error.video_description : `${ form.user.video_description.length }/${ TEXT_AREA_LENGTH_MAX }` }
            label="Video Description"
            multiline
            placeholder="Include a description of the video"
            rows={ TEXT_AREA_HEIGHT }
            onChange={ handleChange }
            value={ form.user.video_description }
            variant="filled"
          />

          { /* Form button: button user uses to complete the form. Will disable while application processes form. */ }
          <div className={ styles.btns }>
            { user.profile && <button type="button" className="cancel" disabled={ !hasChanged() || form.uploading } onClick={ handleReset }>Reset All</button> }
            <button type="submit" disabled={ form.uploading }>{ user.profile ? "Update " : "Create " }Profile</button>
          </div>

        </form>
      :
        <Loading />
      }
    </Container>
  );
};

/* ===== EXPORTS ===== */
export default UserInfoForm;