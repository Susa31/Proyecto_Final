import axios from 'axios';
const CLOUD_NAME = 'dzxkcmkq3';
const UPLOAD_PRESET = 'Zentro';

export const uploadMediaToCloudinary = async (mediaPath, mimeType) => {
    
    let resourceType = 'auto';
    let apiEndpoint = 'auto';

    if (mimeType.startsWith('image/')) {
        resourceType = 'image';
        apiEndpoint = 'image';
    } else if (mimeType.startsWith('video/')) {
        resourceType = 'video';
        apiEndpoint = 'video'; 
    } else {
        resourceType = 'raw';
        apiEndpoint = 'raw';
    }

    const formData = new FormData();
    formData.append('file', {
        uri: mediaPath,
        type: mimeType,
        name: `upload.${mimeType.split('/')[1]}`,
    });
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('resource_type', resourceType);

    console.log(`Uploading ${resourceType} to Cloudinary...`);

    try {
        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${apiEndpoint}/upload`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        
        const secureUrl = response.data.secure_url;
        console.log("Successfully uploaded files to Cloudinary: ", secureUrl);
        return secureUrl;

    } catch (error) {
        if (error.response) {
            console.error("Error when uploading (Cloudinary Answer): ", JSON.stringify(error.response.data));
        } else if (error.request) {
            console.error("Error when uploading (No answer): ", error.request);
        } else {
            console.error("Error when uploading (General Error): ", error.message);
        }
        throw new Error("Error when uploading the file");
    }
};