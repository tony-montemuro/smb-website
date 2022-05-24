import SMB1 from "../../img/smb1.png";
import SMB2 from "../../img/smb2.png";
import SMB2PAL from "../../img/smb2pal.jpg";
import SMBDX from "../../img/smbdx.jpg";

const GameCardInit = () => {
    
    // function that will return an image from an abbreviation (abb)
    const mapImg = (abb) => {
        if (abb === 'smb1') {
            return SMB1;
        }
        else if (abb === 'smb2') {
            return SMB2;
        }
        else if (abb === 'smb2pal') {
            return SMB2PAL;
        }
        else if (abb === 'smbdx') {
            return SMBDX;
        }
        else {
            return "";
        }
    };

    return { mapImg };
};

export default GameCardInit;