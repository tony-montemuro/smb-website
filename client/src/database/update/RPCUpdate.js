/* ===== IMPORTS ===== */
import { supabase } from "../SupabaseClient";

const RPCUpdate = () => {
    /* ===== FUNCTIONS ===== */
    
    // FUNCTION 1: addGame - code that is called by administrators to add a new game to the system
    // PRECONDITIONS (3 parameters):
    // 1.) metadata: the "meta" information of the game - really, this is a game object
    // 2.) entities: an object containing all the entities, where we map key (name) => value (list of entities)
    // 3.) structure: an object containing the modes and levels we need to add
    // POSTCONDITIONS (2 possible outcomes):
    // if all data is successfully added to the DB, this function simply returns
    // if there is some error, we throw an exception, which should be handled by the caller function
    const addGame = async (metadata, entities, structure) => {
        const { mode, level } = structure;
        const { game_monkey, game_platform, game_profile, game_region, game_rule } = entities;

        try {
            const { error } = await supabase.rpc("add_game", { 
                game: metadata,
                modes: mode,
                levels: level,
                game_monkeys: game_monkey,
                game_platforms: game_platform,
                game_profiles: game_profile,
                game_regions: game_region,
                game_rules: game_rule
            });

            // error handling
            if (error) {
                throw error;
            }
            
        } catch (error) {
            // error should be handled by the caller function
            throw error;
        }
    };

    // FUNCTION 2: addVersions - code that is called by administrators to add new versions to the system
    // PRECONDITIONS (1 parameter):
    // 1.) versions: an array of version objects; must have at least one version, and must be sorted by the `sequence` field
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, this function simply returns
    // if the query is unsuccessful, this function will throw an error, which should be handled by the caller function
    const addVersions = async versions => {
        try {
            const { error } = await supabase.rpc("add_versions", { versions });

            // error handling
            if (error) {
                throw error;
            }

        } catch (error) {
            // error should be handled by the caller function
            throw error;
        }
    };

    return { addGame, addVersions };
};

/* ===== EXPORTS ===== */
export default RPCUpdate;