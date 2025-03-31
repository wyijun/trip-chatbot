const axios = require('axios');
const fs = require('fs');

// You need to set up a Facebook Developer account and create an app
// 1. Go to https://developers.facebook.com/
// 2. Create a new app or select an existing one
// 3. Add the Facebook Login product to your app
// 4. Get your App ID and App Secret from the app dashboard
// 5. Generate a User Access Token with the following permissions:
//    - pages_read_engagement
//    - pages_show_list
//    - read_insights

// Replace these with your actual credentials
const APP_ID = 'YOUR_APP_ID';
const APP_SECRET = 'YOUR_APP_SECRET';
const ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN';

// Your Facebook Page ID
// You can find this by:
// 1. Going to your Facebook page
// 2. Click on About
// 3. Look for "Page ID" in the page information
const PAGE_ID = 'YOUR_PAGE_ID';

async function getFacebookComments() {
    try {
        // Create Facebook Graph API client
        const graphApiUrl = 'https://graph.facebook.com/v18.0';
        
        // First, get all posts from your page
        const postsResponse = await axios.get(`${graphApiUrl}/${PAGE_ID}/posts`, {
            params: {
                access_token: ACCESS_TOKEN,
                fields: 'id,message,created_time'
            }
        });

        const posts = postsResponse.data.data;

        // Get comments for each post
        for (const post of posts) {
            console.log(`Fetching comments for post: ${post.id}`);
            
            const commentsResponse = await axios.get(`${graphApiUrl}/${post.id}/comments`, {
                params: {
                    access_token: ACCESS_TOKEN,
                    fields: 'id,message,from,created_time'
                }
            });

            const comments = commentsResponse.data.data.map(comment => ({
                postId: post.id,
                commentId: comment.id,
                author: comment.from.name,
                text: comment.message,
                publishedAt: comment.created_time
            }));

            console.log(`Found ${comments.length} comments for post ${post.id}`);
            console.log(comments);
        }

    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

// Run the function
getFacebookComments(); 