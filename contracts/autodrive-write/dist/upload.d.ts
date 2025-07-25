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
export declare class AutoDriveUploader {
    private api;
    private network;
    constructor(apiKey: string, network?: NetworkId);
    /**
     * Upload a file from filepath to AutoDrive storage
     * @param filePath - Path to the file to upload
     * @param options - Upload options including password, compression, and progress callback
     * @returns Promise<UploadResult> - Upload result with CID and metadata
     */
    uploadFileFromPath(filePath: string, options?: UploadOptions): Promise<UploadResult>;
    /**
     * Upload a file from buffer (useful for browser uploads)
     * @param buffer - File buffer
     * @param filename - Name of the file
     * @param options - Upload options
     * @returns Promise<UploadResult> - Upload result with CID and metadata
     */
    uploadFileFromBuffer(buffer: Buffer, filename: string, options?: UploadOptions): Promise<UploadResult>;
    /**
     * Get file information from CID
     * @param cid - Content Identifier
     * @returns Promise<any> - File information
     */
    getFileInfo(cid: string): Promise<any>;
    /**
     * Download file from CID
     * @param cid - Content Identifier
     * @param outputPath - Path to save the downloaded file
     * @returns Promise<void>
     */
    downloadFile(cid: string, outputPath: string): Promise<void>;
    /**
     * Get the current network being used
     * @returns NetworkId - Current network
     */
    getNetwork(): NetworkId;
}
export declare function createAutoDriveUploader(apiKey: string, network?: NetworkId): AutoDriveUploader;
//# sourceMappingURL=upload.d.ts.map