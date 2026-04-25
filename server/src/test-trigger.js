const axios = require('axios');

const test = async () => {
  try {
    console.log('🚀 [TEST] Triggering meeting upload...');
    
    const response = await axios.post('http://localhost:4000/api/meetings/upload', {
      title: 'Real-time Strategy Review',
      workspaceId: '69ea5c6ced5550131e0e66db',
      creatorId: '69ebea5759bdf151810ecf51',
      fileUrl: 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3'
    }, {
      headers: {
        'x-user-id': '69ebea5759bdf151810ecf51',
        'x-workspace-id': '69ea5c6ced5550131e0e66db'
      }
    });

    const { meetingId } = response.data;
    console.log(`✅ [TEST] Meeting created: ${meetingId}. Waiting for AI processing...`);

    // Poll for status
    let status = 'UPLOADED';
    let attempts = 0;
    while (status !== 'PROCESSED' && attempts < 20) {
      process.stdout.write('.');
      await new Promise(r => setTimeout(r, 4000));
      const res = await axios.get(`http://localhost:4000/api/meetings/${meetingId}`, {
        headers: {
          'x-user-id': '69ebea5759bdf151810ecf51',
          'x-workspace-id': '69ea5c6ced5550131e0e66db'
        }
      });
      status = res.data.status;
      if (status === 'PROCESSED' || status === 'FAILED') break;
      attempts++;
    }
    console.log('\n');

    if (status === 'PROCESSED') {
      console.log('🎉 [TEST] SUCCESS: Meeting processed by AI!');
      const res = await axios.get(`http://localhost:4000/api/meetings/${meetingId}`, {
        headers: {
          'x-user-id': '69ebea5759bdf151810ecf51',
          'x-workspace-id': '69ea5c6ced5550131e0e66db'
        }
      });
      console.log('📝 AI Summary:', res.data.summary?.short);
      
      console.log('📄 [TEST] Testing PDF Export...');
      const pdfRes = await axios.get(`http://localhost:4000/api/meetings/${meetingId}/export/pdf`, {
        responseType: 'arraybuffer',
        headers: {
          'x-user-id': '69ea5c6ced5550131e0e66dc',
          'x-workspace-id': '69ea5c6ced5550131e0e66db'
        }
      });
      console.log('✅ [TEST] PDF Export successful! Size:', pdfRes.data.byteLength, 'bytes');
      console.log('\n--- ALL TESTS PASSED ---');
    } else {
      console.error('❌ [TEST] FAILED: Status is', status);
    }

  } catch (error) {
    console.error('❌ [TEST] ERROR:', error.response?.data || error.message);
  }
};

test();
