import { createAutoDriveUploader, UploadOptions } from './upload';
import { NetworkId } from '@autonomys/auto-utils';
import * as fs from 'fs';

// Example usage of the AutoDrive uploader
async function exampleUsage() {
  // Initialize the uploader with your API key
  const apiKey = process.env.AUTODRIVE_API_KEY || 'your-api-key-here';
  const uploader = createAutoDriveUploader(apiKey, NetworkId.TAURUS);

  console.log('AutoDrive Uploader Example');
  console.log('==========================');

  // Example 1: Upload a file from path
  try {
    console.log('\n1. Uploading file from path...');
    
    const uploadOptions: UploadOptions = {
      compression: true,
      password: 'optional-encryption-password',
      onProgress: (progress: number) => {
        console.log(`Upload progress: ${progress}%`);
      }
    };

    const result = await uploader.uploadFileFromPath(
      './example-file.txt', 
      uploadOptions
    );

    console.log('Upload successful!');
    console.log(`CID: ${result.cid}`);
    console.log(`Size: ${result.size} bytes`);
    console.log(`Uploaded at: ${result.uploadedAt}`);
    console.log(`Network: ${result.network}`);

    // Example 2: Get file info
    console.log('\n2. Getting file info...');
    const fileInfo = await uploader.getFileInfo(result.cid);
    console.log('File info:', fileInfo);

    // Example 3: Download file
    console.log('\n3. Downloading file...');
    await uploader.downloadFile(result.cid, './downloaded-file.txt');
    console.log('Download completed!');

  } catch (error) {
    console.error('Example failed:', error);
  }
}

// Example with buffer upload (useful for browser scenarios)
async function bufferUploadExample() {
  const apiKey = process.env.AUTODRIVE_API_KEY || 'your-api-key-here';
  const uploader = createAutoDriveUploader(apiKey, NetworkId.TAURUS);

  try {
    console.log('\nBuffer Upload Example');
    console.log('=====================');

    // Read file into buffer
    const fileBuffer = fs.readFileSync('./example-file.txt');
    
    const uploadOptions: UploadOptions = {
      compression: true,
      onProgress: (progress: number) => {
        console.log(`Buffer upload progress: ${progress}%`);
      }
    };

    const result = await uploader.uploadFileFromBuffer(
      fileBuffer,
      'example-file.txt',
      uploadOptions
    );

    console.log('Buffer upload successful!');
    console.log(`CID: ${result.cid}`);
    console.log(`Size: ${result.size} bytes`);

  } catch (error) {
    console.error('Buffer upload example failed:', error);
  }
}

// Example integration with NEAR contract
async function nearIntegrationExample() {
  const apiKey = process.env.AUTODRIVE_API_KEY || 'your-api-key-here';
  const uploader = createAutoDriveUploader(apiKey, NetworkId.TAURUS);

  try {
    console.log('\nNEAR Integration Example');
    console.log('========================');

    // 1. Upload file to AutoDrive
    const uploadResult = await uploader.uploadFileFromPath('./ai-model.bin');
    
    // 2. Create model metadata for NEAR contract
    const modelMetadata = {
      id: 'model_001',
      name: 'GPT-4 Model',
      description: 'Advanced language model',
      model_type: 'llm',
      autonomys_location: `autonomys://${uploadResult.cid}`, // AutoDrive location
      tags: ['language', 'ai', 'gpt'],
      version: '1.0.0',
      created_at: Date.now(),
      is_active: true
    };

    console.log('Model metadata for NEAR contract:');
    console.log(JSON.stringify(modelMetadata, null, 2));

    // 3. In a real scenario, you would call your NEAR contract here:
    // await nearContract.create_model(modelMetadata);

    console.log('Integration example completed!');

  } catch (error) {
    console.error('NEAR integration example failed:', error);
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  (async () => {
    await exampleUsage();
    await bufferUploadExample();
    await nearIntegrationExample();
  })();
}

export { exampleUsage, bufferUploadExample, nearIntegrationExample }; 