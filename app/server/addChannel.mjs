// import axios from "axios";

const addSocialMediaChannel = async (channelName,divSelector,data) => {
    const apiUrl = 'http://localhost:4001/add';
    
    try {
        console.log(data);
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ channelName,divSelector, data })
        });

        if (!response.ok) {
            throw new Error('Failed to add social media channel');
        }

        const addedChannel = await response.json();
        console.log('Added social media channel:', addedChannel);
    } catch (error) {
        console.error('Error adding social media channel:', error);
    }
};

export default addSocialMediaChannel;