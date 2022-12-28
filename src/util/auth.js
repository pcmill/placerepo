export async function checkToken(token) {
    return new Promise(async (resolve, reject) => {
        try {
            if (token) {
                const response = await fetch(`https://api.github.com/applications/${process.env.GITHUB_OAUTH_CLIENT_ID}/token`, {
                    body: JSON.stringify({
                        access_token: token
                    }),
                    headers: {
                        'Accept': 'application/vnd.github+json',
                        'Authorization': `Basic ${Buffer.from(process.env.GITHUB_OAUTH_CLIENT_ID + ':' + process.env.GITHUB_OAUTH_CLIENT_SECRET).toString('base64')}`,
                        'X-GitHub-Api-Version': '2022-11-28'
                    },
                    method: 'POST'
                });
        
                if (response.status === 200) {
                    const json = await response.json();
        
                    resolve(json.user);
                }
            }
    
            throw({ message: 'Invalid token', status: 401 });
        } catch (error) {
            reject(error);
        }   
    });
}