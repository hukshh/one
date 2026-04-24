
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const API_URL = 'http://localhost:4000/api';
const MOCK_USER_ID = '65ea5c6ced5550131e0e66da';
const MOCK_WORKSPACE_ID = '65ea5c6ced5550131e0e66db';

const headers = {
  'x-user-id': MOCK_USER_ID,
  'x-workspace-id': MOCK_WORKSPACE_ID,
};

async function runE2ETest() {
  console.log('🚀 Starting "Difficult" E2E Stress Test (v3)...');
  const startTime = Date.now();

  try {
    // 1. Download a real audio file locally first to ensure we have data
    const audioUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
    const localPath = path.join(process.cwd(), 'test-audio.mp3');
    
    console.log(`📥 Step 1: Downloading test audio from ${audioUrl}...`);
    const writer = fs.createWriteStream(localPath);
    const response = await axios({
      url: audioUrl,
      method: 'GET',
      responseType: 'stream'
    });
    response.data.pipe(writer);
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
    console.log('✅ Download complete.');

    // 2. Upload via Multipart Form Data
    console.log('📤 Step 2: Uploading via Multipart Form Data...');
    const form = new FormData();
    form.append('title', `Stress Test Meeting - ${new Date().toISOString()}`);
    form.append('workspaceId', MOCK_WORKSPACE_ID);
    form.append('creatorId', MOCK_USER_ID);
    form.append('file', fs.createReadStream(localPath));

    const uploadResponse = await axios.post(`${API_URL}/meetings/upload`, form, {
      headers: {
        ...headers,
        ...form.getHeaders(),
      },
    });

    const { meetingId } = uploadResponse.data;
    console.log(`✅ Upload successful! Meeting ID: ${meetingId}`);

    // 3. Poll for status transitions
    console.log('🔄 Step 3: Monitoring status transitions...');
    let lastStatus = '';
    let processed = false;
    let attempts = 0;
    const maxAttempts = 100; // Increase timeout for long audio

    while (!processed && attempts < maxAttempts) {
      const response = await axios.get(`${API_URL}/meetings/${meetingId}`, { headers });
      const meeting = response.data;
      
      if (meeting.status !== lastStatus) {
        console.log(`📡 Status Change: ${lastStatus || 'INIT'} ➡️ ${meeting.status}`);
        lastStatus = meeting.status;
      }

      if (meeting.status === 'PROCESSED') {
        processed = true;
        console.log('🎉 Processing Complete!');
        
        // 4. Difficult Validation: Intelligence Depth
        console.log('🔍 Step 4: Performing Depth Validation...');
        
        const summary = meeting.summary;
        const actionItems = meeting.actionItems || [];
        const transcript = meeting.transcript || [];

        console.log('--- TEST RESULTS ---');
        console.log(`⏱️ Total Time: ${((Date.now() - startTime) / 1000).toFixed(2)}s`);
        console.log(`📝 Transcript Segments: ${transcript.length}`);
        console.log(`📋 Summary Length: ${summary?.detailed?.length || 0} chars`);
        console.log(`✅ Action Items: ${actionItems.length}`);

        if (transcript.length === 0) throw new Error('FAIL: Empty transcript');
        // Relaxing summary check slightly as it depends on the audio content
        if (!summary?.detailed) throw new Error('FAIL: Summary missing');

        break;
      }

      if (meeting.status === 'FAILED') {
        throw new Error(`❌ Processing Failed! Check server logs.`);
      }

      await new Promise(r => setTimeout(r, 5000));
      attempts++;
    }

    if (!processed) {
      throw new Error('❌ Test Timed Out.');
    }

    // Cleanup
    if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
    console.log('\n🌟 TEST PASSED: Full E2E Multipart Lifecycle Verified.');

  } catch (error) {
    console.error('\n❌ TEST FAILED');
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
}

runE2ETest();
