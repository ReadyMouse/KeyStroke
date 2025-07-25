"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkId = exports.nearIntegrationExample = exports.bufferUploadExample = exports.exampleUsage = exports.createAutoDriveUploader = exports.AutoDriveUploader = void 0;
// Main exports for the AutoDrive Write integration
var upload_1 = require("./upload");
Object.defineProperty(exports, "AutoDriveUploader", { enumerable: true, get: function () { return upload_1.AutoDriveUploader; } });
Object.defineProperty(exports, "createAutoDriveUploader", { enumerable: true, get: function () { return upload_1.createAutoDriveUploader; } });
var example_1 = require("./example");
Object.defineProperty(exports, "exampleUsage", { enumerable: true, get: function () { return example_1.exampleUsage; } });
Object.defineProperty(exports, "bufferUploadExample", { enumerable: true, get: function () { return example_1.bufferUploadExample; } });
Object.defineProperty(exports, "nearIntegrationExample", { enumerable: true, get: function () { return example_1.nearIntegrationExample; } });
// Re-export NetworkId for convenience
var auto_utils_1 = require("@autonomys/auto-utils");
Object.defineProperty(exports, "NetworkId", { enumerable: true, get: function () { return auto_utils_1.NetworkId; } });
//# sourceMappingURL=index.js.map