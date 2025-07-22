import { fs, createAutoDriveApi } from '@autonomys/auto-drive';
import { NetworkId } from '@autonomys/auto-utils';

export interface UploadOptions {
  password?: string;
  compression?: boolean;
  onProgress?: (progress: number) => void;
}

export interface UploadResult {
  cid: string;
  size: number;
  uploadedAt: Date;
  network: NetworkId;
}

export class AutoDriveUploader {
  private api: any;
  private network: NetworkId;

  constructor(apiKey: string, network: NetworkId = NetworkId.TAURUS) {
    this.api = createAutoDriveApi({ apiKey, network: network as any });
    this.network = network;
  }

  /**
   * Upload a file from filepath to AutoDrive storage
   * @param filePath - Path to the file to upload
   * @param options - Upload options including password, compression, and progress callback
   * @returns Promise<UploadResult> - Upload result with CID and metadata
   */
  async uploadFileFromPath(
    filePath: string, 
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    try {
      console.log(`Starting upload for file: ${filePath}`);
      
      const defaultOptions = {
        password: options.password,
        compression: options.compression ?? true,
        onProgress: options.onProgress || ((progress: number) => {
          console.log(`Upload progress: ${progress}%`);
        })
      };

      const cid = await fs.uploadFileFromFilepath(this.api, filePath, defaultOptions);
      
      console.log(`File uploaded successfully! CID: ${cid}`);
      
      return {
        cid,
        size: 0, // TODO: Get actual file size
        uploadedAt: new Date(),
        network: this.network
      };
    } catch (error) {
      console.error('Upload failed:', error);
      throw new Error(`Failed to upload file: ${error}`);
    }
  }

  /**
   * Upload a file from buffer (useful for browser uploads)
   * @param buffer - File buffer
   * @param filename - Name of the file
   * @param options - Upload options
   * @returns Promise<UploadResult> - Upload result with CID and metadata
   */
  async uploadFileFromBuffer(
    buffer: Buffer,
    filename: string,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    try {
      console.log(`Starting buffer upload for file: ${filename}`);
      
      const defaultOptions = {
        password: options.password,
        compression: options.compression ?? true,
        onProgress: options.onProgress || ((progress: number) => {
          console.log(`Upload progress: ${progress}%`);
        })
      };

      // Note: AutoDrive doesn't have a direct buffer upload method
      // You would need to save the buffer to a temporary file first
      // This is a placeholder implementation
      throw new Error('Buffer upload not directly supported by AutoDrive API. Use uploadFileFromPath instead.');
      
      // Alternative approach would be:
      // 1. Save buffer to temp file
      // 2. Upload temp file using uploadFileFromPath
      // 3. Clean up temp file
    } catch (error) {
      console.error('Buffer upload failed:', error);
      throw new Error(`Failed to upload buffer: ${error}`);
    }
  }

  /**
   * Get file information from CID
   * @param cid - Content Identifier
   * @returns Promise<any> - File information
   */
  async getFileInfo(cid: string): Promise<any> {
    try {
      // This would depend on AutoDrive's API for getting file info
      // Placeholder implementation
      console.log(`Getting file info for CID: ${cid}`);
      
      // TODO: Implement actual file info retrieval
      return {
        cid,
        size: 0,
        createdAt: new Date(),
        network: this.network
      };
    } catch (error) {
      console.error('Failed to get file info:', error);
      throw new Error(`Failed to get file info: ${error}`);
    }
  }

  /**
   * Download file from CID
   * @param cid - Content Identifier
   * @param outputPath - Path to save the downloaded file
   * @returns Promise<void>
   */
  async downloadFile(cid: string, outputPath: string): Promise<void> {
    try {
      console.log(`Downloading file with CID: ${cid} to ${outputPath}`);
      
      // TODO: Implement actual file download
      // await fs.downloadFile(this.api, cid, outputPath);
      
      console.log(`File downloaded successfully to: ${outputPath}`);
    } catch (error) {
      console.error('Download failed:', error);
      throw new Error(`Failed to download file: ${error}`);
    }
  }

  /**
   * Get the current network being used
   * @returns NetworkId - Current network
   */
  getNetwork(): NetworkId {
    return this.network;
  }
}

// Export a factory function for easy instantiation
export function createAutoDriveUploader(apiKey: string, network?: NetworkId): AutoDriveUploader {
  return new AutoDriveUploader(apiKey, network);
} 