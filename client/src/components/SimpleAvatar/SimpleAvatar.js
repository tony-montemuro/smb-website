import { useEffect, useState } from "react";
import { supabase } from "../SupabaseClient/SupabaseClient";

function SimpleAvatar( { url, size } ) {
    const [avatarUrl, setAvatarUrl] = useState(null);

    useEffect(() => {
        downloadImage(url);
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);
    
      const downloadImage = async (path) => {
        try {
            const { data, error } = await supabase.storage.from('avatars').download(path);
            if (error) {
                throw error;
            }
            const url = URL.createObjectURL(data);
            setAvatarUrl(url);
        } catch (error) {
            alert("Error downloading image: ", error.message);
        }
      }

    return (
        <img
            src={avatarUrl ? avatarUrl : `https://place-hold.it/${size}x${size}`}
            alt={avatarUrl ? 'Avatar' : 'No image'}
            style={ { height: '100%', width: '100%' } }> 
        </img>
    )
}

export default SimpleAvatar;