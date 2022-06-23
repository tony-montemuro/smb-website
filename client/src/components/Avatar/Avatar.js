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

  const uploadAvatar = async (event) => {
    try {
        const validExtensions = ["png", "jpg", "jpeg"];
        setUploading(true);

        if (!event.target.files || event.target.files.length === 0) {
            throw new Error ("You must select an image to upload.");
        }

        const file = event.target.files[0];
        const fileExt = file.name.split(".").pop();
        const filePath = `${Math.random()}.${fileExt}`;
        const fileSize = file.size;

        if (!validExtensions.includes(fileExt)) {
            throw new Error ("Invalid file type! Avatar must be either a png or jpeg.");
        }

        if (fileSize > 1000000) {
            throw new Error ("File size too big! Please ensure avatar is less than 1MB.");
        }

        let { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(filePath, file);

        if (uploadError) {
            throw uploadError;
        }

        onUpload(filePath);
    } catch (error) {
        alert(error.message);
    } finally {
        setUploading(false);
    }
    
  }

  return (
    <div style={{ width: size }}>
        <img
            src={avatarUrl ? avatarUrl : `https://place-hold.it/${size}x${size}`}
            alt={avatarUrl ? 'Avatar' : 'No image'}
            style={{ height: size, width: size }}
        />
        {uploading ? "Uploading..." : (
            <>
                <label htmlFor="single">Upload an avatar</label>
                <VisuallyHidden>
                    <input 
                        type="file"
                        id="single"
                        accept="image/*"
                        onChange={uploadAvatar}
                        disabled={uploading}
                    />
                </VisuallyHidden>
            </>
        )}
    </div>
  );
}

export default Avatar;