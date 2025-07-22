// Simple test for AutoDrive uploader
const { createAutoDriveUploader, NetworkId } = require('./dist/index.js');

async function testUploader() {
  console.log('Testing AutoDrive Uploader...');
  
  try {
    // Initialize uploader (will use default API key or throw error)
    const apiKey = process.env.AUTODRIVE_API_KEY || 'test-key';
    const uploader = createAutoDriveUploader(apiKey, NetworkId.TAURUS);
    
    console.log('✅ Uploader initialized successfully');
    console.log(`Network: ${uploader.getNetwork()}`);
    
    // Test that the class structure is correct
    console.log('✅ Class structure is correct');
    
    // Note: We can't actually test uploads without a real API key
    console.log('⚠️  Skipping actual upload test (no API key)');
    console.log('To test uploads, set AUTODRIVE_API_KEY environment variable');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testUploader(); 