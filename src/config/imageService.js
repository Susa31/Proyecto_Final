import axios from 'axios';

const CLOUD_NAME = 'dzxkcmkq3';
const UPLOAD_PRESET = 'Zentro';

export const uploadImageToCloudinary = async (imagePath) => {
    const formData = new FormData();
    
    formData.append('file', {
        uri: imagePath,
        type: 'image/jpeg',
        name: 'upload.jpg',
    });

    formData.append('upload_preset', UPLOAD_PRESET);

    console.log("Uploading to Cloudinary...");

    try {
        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        
        const secureUrl = response.data.secure_url;
        console.log("Image successfully uploaded to Cloudinary: ", secureUrl);
        return secureUrl;

    } catch (error) {
        if (error.response) {
            console.error("Error when uploading the image (Cloudinary response): ", error.response.data);
        } else if (error.request) {
            console.error("Error when uploading the image (No response): ", error.request);
        } else {
            console.error("Error when uploading the image (General error): ", error.message);
        }
        throw new Error("Error when uploading the image");
    }
};