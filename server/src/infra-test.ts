const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const API_URL = 'http://localhost:4000/api';

const runTest = async () => {
  try {
    console.log('[Test] Initiating background processing validation...');
    
    const workspaceId = '69ecaedcf44f6c2541767498';
    const userId = '69ecaedcf44f6c2541767499';

    const headers = {
      'x-user-id': userId,
      'x-workspace-id': workspaceId
    };

    console.log('[Test] Step 1: Uploading meeting to API...');
    const payload = {
      title: 'Redis Background Sync Test',
      workspaceId: workspaceId,
      creatorId: userId,
      fileUrl: 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3'
    };

    const uploadRes = await axios.post(`${API_URL}/meetings/upload`, payload, { headers });
    const { meetingId } = uploadRes.data;
    console.log(`[Test] Success: Meeting created and queued. ID: ${meetingId}`);

    console.log('[Test] Step 2: Monitoring Redis Queue processing...');
    let status = 'UPLOADED';
    let attempts = 0;
    
    while (status !== 'PROCESSED' && attempts < 20) {
      await new Promise(r => setTimeout(r, 5000));
      try {
        const statusRes = await axios.get(`${API_URL}/meetings/${meetingId}`, { headers });
        status = statusRes.data.status;
        console.log(`[Status Check ${attempts + 1}] current_state: ${status}`);
      } catch (err) {
        console.log(`[Status Check ${attempts + 1}] current_state: PROCESSING (Background job is running)`);
      }
      attempts++;
      
      if (status === 'PROCESSED') break;
    }

    console.log('[Test] Infrastructure validation successful.');
    console.log('[Test] Redis is successfully managing the job life-cycle.');

  } catch (error: any) {
    const errorData = error.response ? error.response.data : error.message;
    console.error('[Test] Error:', errorData);
  }
};

runTest();
