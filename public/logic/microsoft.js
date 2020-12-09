const { Client } = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');

function getGraphAuth(accessToken, refreshToken)
{
    const graphClient = Client.init({
        authProvider: (done) => {
            done(null, accessToken);
        }
    });
    return graphClient;
}

async function getCalendarView(auth, start, end) 
{
    const events = await auth
      .api('/me/calendarview')
      // Add the begin and end of the calendar window
      .query({ startDateTime: start, endDateTime: end })
      // Get just the properties used by the app
      .select('subject,organizer,start,end')
      // Order by start time
      .orderby('start/dateTime')
      // Get at most 1000 results
      .top(1000)
      .get();
  
    return events;
}

module.exports={getGraphAuth, getCalendarView};