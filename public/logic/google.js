const {google}=require('googleapis');

const OAuth2Client=new google.auth.OAuth2(
    '991368878610-364g8bvnm8of93tsvfdk56s7gkl3bf2u.apps.googleusercontent.com',
    'yugmojWz1n5BB_SZEGIreXsD'
);

function getAuth(accessToken, refreshToken){
    OAuth2Client.setCredentials({access_token: accessToken, refresh_token:refreshToken});
    return OAuth2Client;
}

async function listEvents(auth){
    const calendar = google.calendar({version: 'v3', auth});
  const res= await calendar.events.list({
    calendarId: 'primary',
    timeMin: (new Date()).toISOString(),
    timeMax: (new Date(new Date().getTime() +60*60*24*1000)).toISOString(),
    maxResults: 100,
    showDeleted: false,
    singleEvents: true,
    orderBy: 'startTime',
  });
  return res.data.items;
}

module.exports={getAuth, listEvents};