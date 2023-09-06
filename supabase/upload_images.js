/* ===== IMPORTS ===== */
import fs from "fs";
import { createClient } from "@supabase/supabase-js";

/* ===== VARIABLES ===== */
const supabaseUrl = process.argv[2], supabaseKey = process.argv[3];
const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
});

/* ===== FUNCTIONS ===== */

// FUNCTION 1: uploadImage - performs the actual file upload
// PRECONDITIONS (1 parameter):
// 1.) file: an object containing both the file path and data
// POSTCONDITIONS (2 possible outcomes):
// if the file successfully uploads, a success message will be printed to the console, and the function returns
// otherwise, this function throws an error, which should be handled by the caller function
async function uploadImage(file) {
    try {
        const { error } = await supabase
            .storage
            .from("games")
            .upload(file.path.split("/")[1], file.data);

        // error handling
        if (error) {
            throw error;
        }

        console.log("File uploaded!");

    } catch (error) {
        throw error;
    }
}

// FUNCTION 2: uploadAll - a function that will attempt to upload all the files concurrently
// PRECONDITIONS (1 parameter):
// 1.) files - an array of file objects, each with the file path and file data
// POSTCONDITIONS (2 possible outcomes):
// if all files upload succcessfully, a success message is logged to the console, and this function simply returns
// otherwise, an error message is rendered to the console
async function uploadAll(files) {
    // define array of promises, one for each image
    const promises = files.map(file => uploadImage(file));

    // now, perform the upload
    try {
        await Promise.all(promises);
        console.log("All files uploaded successfully!");
    } catch (error) {
        console.error("One or more files failed to upload!");
    };
};

// FUNCTION 3: getFileData - function that takes a file path from the file object, grabs the data, and adds it on to the object
// PRECONDITIONS (1 parameter):
// 1.) file: a file object, containing only the pathname
// POSTCONDITIONS (2 possible outcomes):
// if the data is successfully read, we simply assign the `data` field of `file` to the data variable
// otherwise, print an error message to the console, and assign the `data` field of `file` as undefined
async function getFileData(file) {
    let data;
    try {
        data = fs.readFileSync(file.path);
    } catch (error) {
        console.error("File could not be read.");
    } finally {
        file.data = data;
    };
};

// FUNCTION 4: main - the entry point of this script
// PRECONDITIONS: NONE
// POSTCONDIITIONS (2 possible outcomes):
// ideally, once this function is complete, all files should have successfully uploaded to the storage system
// however, it is also possible one or more images failed to upload
async function main() {
    // first, define our files array
    const files = [
        { path: "images/651.png" },
        { path: "images/gaiden.png" }, 
        { path: "images/smb1.png" }, 
        { path: "images/smb2.png" },
        { path: "images/smb2pal.png" }
    ];

    // next, get the file data for each file
    for (const file of files) {
        await getFileData(file);
    };

    // finally, attempt to upload each image
    await uploadAll(files);
};

// call main function
main();