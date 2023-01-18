import { useEffect } from "react";
import SimpleAvatarInit from "./SimpleAvatarInit";

function SimpleAvatar( { url, size } ) {
    // states and functions from the init file
    const { avatarUrl, fetchAvatar } = SimpleAvatarInit();

    // code that is executed upon page load
    useEffect(() => {
        fetchAvatar(url);
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

    // simple avatar component
    return (
        <img
            src={ avatarUrl ? avatarUrl : `https://place-hold.it/${ size }x${ size }` }
            alt={ avatarUrl ? 'Avatar' : 'No image' }
            style={ { height: '100%', width: '100%' } }> 
        </img>
    )
}

export default SimpleAvatar;