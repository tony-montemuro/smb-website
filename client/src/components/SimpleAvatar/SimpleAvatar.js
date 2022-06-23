import { React, useEffect, useState } from "react";
import { supabase } from "../SupabaseClient/SupabaseClient";

function SimpleAvatar( { url, size } ) {
    const [avatarUrl, setAvatarUrl] = useState(null);

    useEffect(() => {
        if (url) {
            downloadImage(url);
        }
      }, [url]);
    
      const downloadImage = async (path) => {
        try {
            const { data, error } = await supabase.storage.from('avatars').download(path);
            if (error) {
                throw error;
            }
            const url = URL.createObjectURL(data);
            setAvatarUrl(url);
        } catch (error) {
            console.log("Error downloading image: ", error.message);
        }
      }

    return (
        <div className="simple-avatar">
            <img
            src={avatarUrl ? avatarUrl : `https://place-hold.it/${size}x${size}`}
            alt={avatarUrl ? 'Avatar' : 'No image'}
            style={{ height: size, width: size }}
            />
        </div>
    )
}

export default SimpleAvatar;