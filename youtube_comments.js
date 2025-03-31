const { google } = require('googleapis');
const fs = require('fs');

// You need to set up a Google Cloud Project and enable the YouTube Data API v3
// 1. Go to https://console.cloud.google.com/
// 2. Create a new project or select an existing one
// 3. Enable the YouTube Data API v3
// 4. Create credentials (OAuth 2.0 Client ID)
// 5. Download the client credentials and save them as 'credentials.json'

// Replace these with your actual credentials
const CREDENTIALS_PATH = './credentials.json';
const TOKEN_PATH = './token.json';

// Your YouTube channel ID
// You can find this by:
// 1. Going to your YouTube channel
// 2. The URL will be like: https://www.youtube.com/channel/UCxxxxxxxxxxxxxxxx
// 3. The last part (UCxxxxxxxxxxxxxxxx) is your channel ID
const CHANNEL_ID = 'YOUR_CHANNEL_ID';

async function getChannelComments() {
    try {
        // Load client credentials
        const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
        
        // Create OAuth2 client
        const oauth2Client = new google.auth.OAuth2(
            credentials.installed.client_id,
            credentials.installed.client_secret,
            credentials.installed.redirect_uris[0]
        );

        // Check if we have a stored token
        let token;
        try {
            token = JSON.parse(fs.readFileSync(TOKEN_PATH));
        } catch (err) {
            // If no token exists, you'll need to authenticate
            // This will open a browser window for authentication
            const authUrl = oauth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: ['https://www.googleapis.com/auth/youtube.readonly']
            });
            console.log('Please visit this URL to authenticate:', authUrl);
            return;
        }

        // Set credentials
        oauth2Client.setCredentials(token);

        // Create YouTube API client
        const youtube = google.youtube({
            version: 'v3',
            auth: oauth2Client
        });

        // First, get all videos from your channel
        const channelResponse = await youtube.search.list({
            part: 'id',
            channelId: CHANNEL_ID,
            maxResults: 50,
            type: 'video'
        });

        const videoIds = channelResponse.data.items.map(item => item.id.videoId);

        // Get comments for each video
        for (const videoId of videoIds) {
            console.log(`Fetching comments for video: ${videoId}`);
            
            const commentsResponse = await youtube.commentThreads.list({
                part: 'snippet',
                videoId: videoId,
                maxResults: 100
            });

            const comments = commentsResponse.data.items.map(item => ({
                videoId: videoId,
                commentId: item.id,
                author: item.snippet.topLevelComment.snippet.authorDisplayName,
                text: item.snippet.topLevelComment.snippet.textDisplay,
                publishedAt: item.snippet.topLevelComment.snippet.publishedAt
            }));

            console.log(`Found ${comments.length} comments for video ${videoId}`);
            console.log(comments);
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

// Run the function
getChannelComments(); 