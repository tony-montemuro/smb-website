/* ===== IMPORTS ===== */
import { supabase } from "../SupabaseClient";

const CountriesRead = () => {
    /* ===== FUNCTIONS ===== */
    
    // FUNCTION 1: queryCountries - async function that makes a call to supabase to get an array of all the countries
    // PRECONDTIONS: NONE
    // POSTCONDTIONS (2 possible outcomes):
    // if the query is successful, the list of countries is simply returned
    // otherwise, this function throws an error, which should be handled by caller function
    const queryCountries = async () => {
        try {
            const { data: countries, error, status } = await supabase
                .from("countries")
                .select("*")
                .order("name");

            // error handling
            if (error && status !== 406) {
                throw error;
            }

            // return data
            return countries;

        } catch(error) {
            // throw error to be handled by caller
            throw error;
        }
    };

    return { queryCountries };
};

/* ===== EXPORTS ===== */
export default CountriesRead;