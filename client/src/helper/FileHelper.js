const FileHelper = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: getFileInfo - determine the file information from an image form ref
    // PRECONDITIONS (1 parameter):
    // 1.) avatarRef: a ref to the image input
    // POSTCONDITIONS (2 returns):
    // 1.) file: the file object associated with the ref hook
    // 2.) fileExt: the extension of the file
    const getFileInfo = fileRef => {
        const file = fileRef.current.files[0];
        return { file: file, fileExt: file.name.split(".").pop().toLowerCase() };
    };

    // FUNCTION 2: checkImageDimension - code that checks the dimensions of an image uploaded by the user do not exceed the max
    // limits
    // PRECONDITIONS (3 parameters):
    // 1.) file: a File object, specifically, an image
    // 2.) maxWidth: an integer representing the maximum width, in pixels, of the image file
    // 3.) maxHeight: an integer representing the maximum height, in pixels, of the image file
    // POSTCONDITIONS (2 possible outcomes):
    // when this function is called, a Promise is returned, which is expected to be handled asynchronously
    // the promise will resolve if the image size is with in the `maxWidth`x`maxHeight` limit
    // otherwise, the promise will reject with the reason that the dimensions are off
    const checkImageDimension = (file, maxWidth, maxHeight) => {
        return new Promise((resolve, reject) => {
            const img = new Image();

            // code that executes when the image has been loaded from file
            img.onload = () => {
                // extract dimensions, and check if they are within valid range
                const width = img.width;
                const height = img.height;
                if (width > maxWidth || height > maxHeight) {
                    reject(`Image dimensions are too large: (${ width }x${ height }). Image must be within ${ maxWidth }x${ maxHeight }.`);
                } else {
                    resolve();
                }
            };

            img.src = URL.createObjectURL(file);
        });
    };

    return { getFileInfo, checkImageDimension };
};

/* ===== EXPORTS ===== */
export default FileHelper;