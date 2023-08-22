const ResourcesLayout = () => {
    /* ===== VARIABLES ===== */
    const pages = [
        { 
            name: "overview", 
            headers: ["general", "types", "score_calculation", "pausing_rule", "proof_requirements", "NTSC_and_PAL", "replay_errors", "emulators"]
        },
        {
            name: "getting_started",
            headers: ["capture_cards", "OBS"]
        }
    ];

    return { pages };
};

/* ===== EXPORTS ===== */
export default ResourcesLayout;