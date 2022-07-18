import "./avatar.css"
import { useEffect, useState } from "react";
import { supabase } from "../SupabaseClient/SupabaseClient"
import { VisuallyHidden } from "@reach/visually-hidden";

function Avatar({ url, size, onUpload }) {
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  useEffect(() => {
    if (url) {
        downloadImage(url);
    }
  }, [url]);

  const downloadImage = async (path) => {
    try {
        // query the supabase storage bucket for the avatar
        const { data, error } = await supabase.storage.from('avatars').download(path);

        // if there was some error, throw it
        if (error) {
            throw error;
        }

        // create the url object, and update state
        const url = URL.createObjectURL(data);
        setAvatarUrl(url);
    } catch (error) {
        console.log("Error downloading image: ", error.message);
    }
  }

  // function that will upload the avatar of user's choice
  const uploadAvatar = async (e) => {
    try {
        // initialize variables and set states
        const validExtensions = ["png", "jpg", "jpeg"];
        setUploading(true);

        // furst, check if the user selected an image at all
        if (!e.target.files || e.target.files.length === 0) {
            throw new Error ("You must select an image to upload.");
        }

        // now, define path variables
        const file = e.target.files[0];
        const fileExt = file.name.split(".").pop();
        const filePath = `${Math.random()}.${fileExt}`;
        const fileSize = file.size;

        // if the file selected is not a valid type, throw an error
        if (!validExtensions.includes(fileExt)) {
            throw new Error ("Invalid file type! Avatar must be either a png or jpeg.");
        }

        // if the file selected is greater than 1mb, throw an error
        if (fileSize > 1000000) {
            throw new Error ("File size too big! Please ensure avatar is less than 1MB.");
        }

        // upload the image to the supabase storage bucket
        let { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(filePath, file);

        // if there was some error, throw it
        if (uploadError) {
            throw uploadError;
        }

        // finally, call the onUpload function, which updates the avatar_url state back on the profile page
        onUpload(filePath);
    } catch (error) {
        alert(error.message);
    } finally {
        setUploading(false);
    }
    
  }

  return (
    <div className="avatar" style={{ width: size }}>
        <p>Avatar (optional):</p>
        <p><b>Note:</b> Avatars cannot be greater than 1 MB!</p>
        <img
            src={avatarUrl ? avatarUrl : `https://place-hold.it/${size}x${size}`}
            alt={avatarUrl ? 'Avatar' : 'No image'}
            style={{ height: size, width: size }}
        />
        {uploading ? "Uploading..." : (
            <div className="image-form">
                <label className="avatar-label" htmlFor="single">Upload an image</label>
                <VisuallyHidden>
                    <input 
                        type="file"
                        id="single"
                        accept="image/*"
                        onChange={uploadAvatar}
                        disabled={uploading}
                    />
                </VisuallyHidden>
            </div>
        )}
    </div>
  );
}

export default Avatar;