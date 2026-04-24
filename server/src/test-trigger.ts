const axios = require('axios');

const test = async () => {
  try {
    console.log('🚀 Triggering test meeting upload...');
    
    const response = await axios.post('http://localhost:4000/api/meetings/upload', {
      title: 'Monthly Strategy Review',
      workspaceId: '69ea5c6ced5550131e0e66db',
      creatorId: '69ea5c6ced5550131e0e66dc',
      fileUrl: 'https://example.com/meeting.mp4'
    }, {
      headers: {
        'x-user-id': '69ea5c6ced5550131e0e66dc',
        'x-workspace-id': '69ea5c6ced5550131e0e66db'
      }
    });

    const { meetingId } = response.data;
    console.log(`✅ Meeting created: ${meetingId}. Waiting for processing...`);

    // Poll for status
    let status = 'UPLOADED';
    let attempts = 0;
    while (status !== 'PROCESSED' && attempts < 10) {
      await new Promise(r => setTimeout(r, 2000));
      const res = await axios.get(`http://localhost:4000/api/meetings/${meetingId}`, {
        headers: {
          'x-user-id': '69ea5c6ced5550131e0e66dc',
          'x-workspace-id': '69ea5c6ced5550131e0e66db'
        }
      });
      status = res.data.status;
      console.log(`[Attempt ${attempts + 1}] Status: ${status}`);
      attempts++;
    }

    if (status === 'PROCESSED') {
      console.log('🎉 Meeting processed successfully!');
      const res = await axios.get(`http://localhost:4000/api/meetings/${meetingId}`, {
        headers: {
          'x-user-id': '69ea5c6ced5550131e0e66dc',
          'x-workspace-id': '69ea5c6ced5550131e0e66db'
        }
      });
      console.log('Summary:', res.data.summary?.short);
      console.log('Action Items Count:', res.data.actionItems?.length);
    } else {
      console.error('❌ Processing timed out or failed.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
};

test();
