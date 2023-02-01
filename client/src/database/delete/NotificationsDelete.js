import { supabase } from "../SupabaseClient";

const NotificationsDelete = () => {
    // function that makes a delete call to the notification table in the database based on the id
    const remove = async (id) => {
        try {
            const { error } = await supabase
                .from("notification")
                .delete()
                .match({ id: id });

            // error handling
            if (error) {
                throw error;
            }

        } catch (error) {
            console.log(error);
            alert(error.message);
        }
    };

    return { remove };
};

export default NotificationsDelete;