import { useState } from "react";
import { supabase } from "../../components/SupabaseClient/SupabaseClient";
import { useNavigate } from "react-router-dom";

const ProfileInit = () => {
    // states
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [countryList, setCountryList] = useState([]);
    const [username, setUsername] = useState(null);
    const [country, setCountry] = useState(0);
    const [youtube_url, setYoutubeUrl] = useState(null);
    const [twitch_url, setTwitchUrl] = useState(null);
    const [avatar_url, setAvatarUrl] = useState(null);
    const [usernameError, setUsernameError] = useState("initState");
    const [isSubmit, setIsSubmit] = useState(false);
    const [isUpdated, setIsUpdated] = useState(false);

    // navigate used for redirecting
    const navigate = useNavigate();

    // function that checks if a user is signed in. if not, redirect to home.
    const checkForUser = () => {
        if (supabase.auth.user() === null) {
            navigate("/");
            return false;
        }
        return true;
    }

    // function that grabs data from the country database
    const getCountries = async () => {
        try {
            // read the entire countries table
            let { data: countries, error, status } = await supabase
                .from("countries")
                .select("*")
                .order("name");

            if (error && status !== 406) {
                throw error;
            }

            // update countryList hook
            setCountryList(countries);

        } catch (error) {
            alert(error.message);
        } finally {
            // finally, we can update the loading hook, since we have finished api calls
            setLoading(false);
        }
    }

    // function that grabs user data from the database
    const getProfile = async () => {
        try {
            // first, ensure that the user is signed in. if not, page will redirect to home
            if (await checkForUser()) {
                // initalize variables
                const user = supabase.auth.user();

                // now, query profiles table to get user profile information
                let { data, error, status } = await supabase
                    .from("profiles")
                    .select("username, country, youtube_url, twitch_url, avatar_url")
                    .eq("id", user.id)
                    .single()

                if (error && status !== 406) {
                    throw error;
                }

                // if query returned user data successfully, update hooks
                if (data) {
                    setUsername(data.username);
                    setCountry(data.country);
                    setYoutubeUrl(data.youtube_url);
                    setTwitchUrl(data.twitch_url)
                    setAvatarUrl(data.avatar_url);
                }

                // once we have finished, query the countries
                getCountries();
            }
        } catch(error) {
            alert(error.message);
        }
    }

    // function that activates when user tries to submit profile changes. will move on to
    // updateProfile function if inputs are validated.
    const handleSubmit = (e) => {
        e.preventDefault();
        setUsernameError(validate(username));
        setIsSubmit(true);
    }

    // function that will push new user data into the profiles table
    const updateProfile = async (e) => {
        // initialize variables
        const countryId = country === "null" ? null : country;
        console.log("Country ID: " + countryId);

        try {
            // begin updating
            setUpdating(true);

            // initialize variables
            const user = supabase.auth.user();
            let avatarUrl = avatar_url;
            console.log(avatar_url);
            if (!avatar_url) {
                setAvatarUrl("default.png");
                avatarUrl = "default.png";
            }

            // create updates object
            const updates = {
                id: user.id,
                username,
                country: countryId,
                youtube_url,
                twitch_url,
                avatar_url: avatarUrl
            }

            // perform update on profiles table
            let { error } = await supabase.from('profiles').upsert(updates, {
                returning: "minimal", // Don't return the value after inserting
            });

            if (error) {
                throw error;
            }
            // update isUpdated flag (this is for the front-end)
            setIsUpdated(true);

        } catch(error) {
            if (error.code === "23505") {
                setUsernameError("Error: Username already taken.");
            } else {
                console.log(error);
            }
        } finally {
            // end updating
            setUpdating(false);
        }
    }


    // function used to check for valid inputs
    const validate = (username) => {
        // initialize variables
        let error = "";
        const regex = new RegExp('^[A-Za-z0-9_]*$');

        // perform various tests on username input
        if (!username) {
            error = "Error: Username is required to create a profile!";
        }

        if (username.length < 5 || username.length > 25) {
            error = "Error: Username must be between 5 and 25 characters long.";
        }

        if (!regex.test(username)) {
            error = "Error: Username must consist only of letters, numbers, and/or underscores.";
        }

        // return error
        return error;
    }

    // function that will navigate to the 'user' page, which is similar to the profile page,
    // but is view only. this page is viewable to all users.
    const navToProfile = () => {
        const userId = supabase.auth.user().id;
        navigate(`/user/${userId}`);
    }

    // function that will sign the user out, and navigate them back to the home screen.
    const signOut = async (e) => {
        supabase.auth.signOut();
        navigate("/");
        window.location.reload();
    }

    // CountrySelect component
    const CountrySelect = () => {
        return (
            <select 
                id="countryId"
                value={country}
                onChange={(e) => {setCountry(e.target.value); console.log(e.target.value);}}
            >
                <option key={"null"} value={"null"}>--</option>
                {countryList.map((country) => (
                    <option key={country.iso2} value={country.iso2}>{country.name}</option>
                ))}
            </select>
        )
      }

    return { loading,
            updating,
            username, 
            youtube_url,
            twitch_url,
            avatar_url,
            usernameError,
            isSubmit,
            isUpdated,
            setUsername,
            setYoutubeUrl,
            setTwitchUrl,
            setAvatarUrl, 
            getProfile, 
            handleSubmit,
            updateProfile,
            navToProfile,
            signOut,
            CountrySelect
    };
}

export default ProfileInit;