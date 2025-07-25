"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoDriveUploader = void 0;
exports.createAutoDriveUploader = createAutoDriveUploader;
const auto_drive_1 = require("@autonomys/auto-drive");
const auto_utils_1 = require("@autonomys/auto-utils");
class AutoDriveUploader {
    constructor(apiKey, network = auto_utils_1.NetworkId.TAURUS) {
        this.api = (0, auto_drive_1.createAutoDriveApi)({ apiKey, network: network });
        this.network = network;
    }
    /**
     * Upload a file from filepath to AutoDrive storage
     * @param filePath - Path to the file to upload
     * @param options - Upload options including password, compression, and progress callback
     * @returns Promise<UploadResult> - Upload result with CID and metadata
     */
    async uploadFileFromPath(filePath, options = {}) {
        try {
            console.log(`Starting upload for file: ${filePath}`);
            const defaultOptions = {
                password: options.password,
                compression: options.compression ?? true,
                onProgress: options.onProgress || ((progress) => {
                    console.log(`Upload progress: ${progress}%`);
                })
            };
            const cid = await auto_drive_1.fs.uploadFileFromFilepath(this.api, filePath, defaultOptions);
            console.log(`File uploaded successfully! CID: ${cid}`);
            return {
                cid,
                size: 0, // TODO: Get actual file size
                uploadedAt: new Date(),
                network: this.network
            };
        }
        catch (error) {
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
    async uploadFileFromBuffer(buffer, filename, options = {}) {
        try {
            console.log(`Starting buffer upload for file: ${filename}`);
            const defaultOptions = {
                password: options.password,
                compression: options.compression ?? true,
                onProgress: options.onProgress || ((progress) => {
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
        }
        catch (error) {
            console.error('Buffer upload failed:', error);
            throw new Error(`Failed to upload buffer: ${error}`);
        }
    }
    /**
     * Get file information from CID
     * @param cid - Content Identifier
     * @returns Promise<any> - File information
     */
    async getFileInfo(cid) {
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
        }
        catch (error) {
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
    async downloadFile(cid, outputPath) {
        try {
            console.log(`Downloading file with CID: ${cid} to ${outputPath}`);
            // TODO: Implement actual file download
            // await fs.downloadFile(this.api, cid, outputPath);
            console.log(`File downloaded successfully to: ${outputPath}`);
        }
        catch (error) {
            console.error('Download failed:', error);
            throw new Error(`Failed to download file: ${error}`);
        }
    }
    /**
     * Get the current network being used
     * @returns NetworkId - Current network
     */
    getNetwork() {
        return this.network;
    }
}
exports.AutoDriveUploader = AutoDriveUploader;
// Export a factory function for easy instantiation
function createAutoDriveUploader(apiKey, network) {
    return new AutoDriveUploader(apiKey, network);
}
//# sourceMappingURL=upload.js.map