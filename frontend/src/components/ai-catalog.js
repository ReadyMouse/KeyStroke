import { useState, useEffect } from 'react';
import { useWalletSelector } from '@near-wallet-selector/react-hook';
import { createAutoDriveUploader } from '@/utils/autodrive-uploader';

import styles from '@/styles/app.module.css';

export const AICatalog = () => {
  const { selector, accountId } = useWalletSelector();
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('name');
  const [searchTags, setSearchTags] = useState('');
  const [totalModels, setTotalModels] = useState(0);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [sortBy, setSortBy] = useState('trending');
  const [filterTask, setFilterTask] = useState('all');
  const [filterSize, setFilterSize] = useState('all');
  const [newModel, setNewModel] = useState({
    id: '',
    name: '',
    description: '',
    model_type: 'llm',
    tags: ''
  });
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(''); // 'uploading', 'success', 'error'

  // Fetch total models count
  const fetchTotalModels = async () => {
    if (!selector) return;
    
    try {
      const { network } = selector.store.getState();
      const result = await selector.query({
        request: {
          method: 'query',
          params: {
            request_type: 'call_function',
            finality: 'optimistic',
            account_id: process.env.NEXT_PUBLIC_CONTRACT_ID,
            method_name: 'get_total_models',
            args_base64: btoa(JSON.stringify({}))
          }
        }
      });
      setTotalModels(JSON.parse(result.result));
    } catch (error) {
      console.error('Error fetching total models:', error);
    }
  };

  // Fetch all models
  const fetchModels = async () => {
    if (!selector) return;
    
    setLoading(true);
    try {
      const { network } = selector.store.getState();
      const result = await selector.query({
        request: {
          method: 'query',
          params: {
            request_type: 'call_function',
            finality: 'optimistic',
            account_id: process.env.NEXT_PUBLIC_CONTRACT_ID,
            method_name: 'get_all_models',
            args_base64: btoa(JSON.stringify({ from_index: 0, limit: 50 }))
          }
        }
      });
      setModels(JSON.parse(result.result));
    } catch (error) {
      console.error('Error fetching models:', error);
    } finally {
      setLoading(false);
    }
  };

  // Search models
  const searchModels = async () => {
    if (!selector || !searchQuery.trim()) return;
    
    setLoading(true);
    try {
      let result;
      switch (searchType) {
        case 'name':
          result = await selector.query({
            request: {
              method: 'query',
              params: {
                request_type: 'call_function',
                finality: 'optimistic',
                account_id: process.env.NEXT_PUBLIC_CONTRACT_ID,
                method_name: 'search_by_name',
                args_base64: btoa(JSON.stringify({ name_query: searchQuery }))
              }
            }
          });
          break;
        case 'type':
          result = await selector.query({
            request: {
              method: 'query',
              params: {
                request_type: 'call_function',
                finality: 'optimistic',
                account_id: process.env.NEXT_PUBLIC_CONTRACT_ID,
                method_name: 'search_by_type',
                args_base64: btoa(JSON.stringify({ model_type: searchQuery }))
              }
            }
          });
          break;
        case 'tags':
          const tags = searchTags.split(',').map(tag => tag.trim()).filter(tag => tag);
          result = await selector.query({
            request: {
              method: 'query',
              params: {
                request_type: 'call_function',
                finality: 'optimistic',
                account_id: process.env.NEXT_PUBLIC_CONTRACT_ID,
                method_name: 'search_by_tags',
                args_base64: btoa(JSON.stringify({ tags }))
              }
            }
          });
          break;
        default:
          return;
      }
      setModels(JSON.parse(result.result));
    } catch (error) {
      console.error('Error searching models:', error);
    } finally {
      setLoading(false);
    }
  };

  // Upload file to AutoDrive
  const uploadToAutoDrive = async (file) => {
    if (!file) return null;
    
    // Validate file size (e.g., 100MB limit)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      alert('File size too large. Please select a file smaller than 100MB.');
      setUploadStatus('error');
      return null;
    }
    
    setUploadStatus('uploading');
    try {
      // Initialize AutoDrive uploader
      const apiKey = process.env.NEXT_PUBLIC_AUTODRIVE_API_KEY;
      if (!apiKey) {
        throw new Error('AutoDrive API key not configured');
      }
      
      const uploader = createAutoDriveUploader(apiKey);
      
      // Upload file with progress tracking
      const autonomysLocation = await uploader.uploadFile(file, {
        compression: true,
        onProgress: (progress) => {
          console.log(`Upload progress: ${progress}%`);
          // You could update a progress bar here
        }
      });
      
      setUploadStatus('success');
      return autonomysLocation;
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('error');
      return null;
    }
  };

  // Create new model
  const createModel = async () => {
    if (!selector || !accountId) return;
    
    try {
      // Upload file first
      if (!uploadedFile) {
        alert('Please select a file to upload');
        return;
      }
      
      const autonomysLocation = await uploadToAutoDrive(uploadedFile);
      if (!autonomysLocation) {
        alert('File upload failed. Please try again.');
        return;
      }
      
      const tags = newModel.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      await selector.signAndSendTransaction({
        signerId: accountId,
        receiverId: process.env.NEXT_PUBLIC_CONTRACT_ID,
        actions: [{
          type: 'FunctionCall',
          params: {
            methodName: 'create_model',
            args: {
              id: newModel.id,
              name: newModel.name,
              description: newModel.description,
              model_type: newModel.model_type,
              autonomys_location: autonomysLocation,
              tags
            },
            gas: '300000000000000',
            deposit: '1'
          }
        }]
      });
      
      // Reset form and refresh
      setNewModel({
        id: '',
        name: '',
        description: '',
        model_type: 'llm',
        tags: ''
      });
      setUploadedFile(null);
      setUploadStatus('');
      setShowCreateForm(false);
      fetchModels();
      fetchTotalModels();
    } catch (error) {
      console.error('Error creating model:', error);
      setUploadStatus('error');
    }
  };

  useEffect(() => {
    fetchTotalModels();
    fetchModels();
  }, [selector]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchType === 'tags') {
      searchModels();
    } else {
      searchModels();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchTags('');
    fetchModels();
  };

  const getTaskDisplayName = (modelType) => {
    const taskMap = {
      'llm': 'Text Generation',
      'image': 'Image Generation',
      'audio': 'Audio Processing',
      'video': 'Video Processing',
      'multimodal': 'Multimodal'
    };
    return taskMap[modelType] || modelType;
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp / 1000000);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Updated today';
    if (diffDays <= 7) return `Updated ${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😏</div>
        <h1>Smirking Face</h1>
        <p style={{ fontSize: '1.2rem', color: '#666', marginTop: '0.5rem' }}>
          AI Models on Blockchain
        </p>
      </div>

      {/* Search and Filters */}
      <div className={styles.searchSection}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search models..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.input}
            style={{ flex: 1, minWidth: '200px' }}
          />
          <select 
            value={filterTask} 
            onChange={(e) => setFilterTask(e.target.value)}
            className={styles.select}
          >
            <option value="all">All Tasks</option>
            <option value="llm">Text Generation</option>
            <option value="image">Image Generation</option>
            <option value="audio">Audio Processing</option>
            <option value="video">Video Processing</option>
            <option value="multimodal">Multimodal</option>
          </select>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className={styles.select}
          >
            <option value="trending">Trending</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
          <button onClick={clearSearch} className={styles.button}>
            Clear
          </button>
        </div>
        
        <button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className={styles.button}
          style={{ backgroundColor: '#007bff', color: 'white' }}
        >
          {showCreateForm ? 'Cancel' : 'Upload Model'}
        </button>
      </div>

      {/* Create Model Form */}
      {showCreateForm && (
        <div className={styles.createSection}>
          <form onSubmit={(e) => { e.preventDefault(); createModel(); }} className={styles.createForm}>
            <h3>Upload New Model</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <input
                type="text"
                placeholder="Model ID"
                value={newModel.id}
                onChange={(e) => setNewModel({...newModel, id: e.target.value})}
                className={styles.input}
                required
              />
              <input
                type="text"
                placeholder="Model Name"
                value={newModel.name}
                onChange={(e) => setNewModel({...newModel, name: e.target.value})}
                className={styles.input}
                required
              />
            </div>
            <textarea
              placeholder="Description"
              value={newModel.description}
              onChange={(e) => setNewModel({...newModel, description: e.target.value})}
              className={styles.textarea}
              required
            />
                        <select
              value={newModel.model_type}
              onChange={(e) => setNewModel({...newModel, model_type: e.target.value})}
              className={styles.select}
            >
              <option value="llm">Language Model (LLM)</option>
              <option value="image">Image Generation</option>
              <option value="audio">Audio Processing</option>
              <option value="video">Video Processing</option>
              <option value="multimodal">Multimodal</option>
            </select>
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="file"
                onChange={(e) => setUploadedFile(e.target.files[0])}
                className={styles.input}
                accept=".bin,.model,.pt,.pth,.onnx,.tflite,.h5,.pb,.safetensors"
              />
              <small style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginTop: '0.25rem' }}>
                Supported formats: .bin, .model, .pt, .pth, .onnx, .tflite, .h5, .pb, .safetensors
              </small>
              {uploadStatus === 'uploading' && (
                <div style={{ color: '#007bff', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  ⏳ Uploading to AutoDrive...
                </div>
              )}
              {uploadStatus === 'success' && (
                <div style={{ color: '#28a745', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  ✅ File uploaded successfully!
                </div>
              )}
              {uploadedFile && (
                <div style={{ color: '#007bff', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  📁 Selected: {uploadedFile.name} ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}
              {uploadStatus === 'error' && (
                <div style={{ color: '#dc3545', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  ❌ Upload failed. Please try again.
                </div>
              )}
            </div>
            <input
              type="text"
              placeholder="Tags (comma separated)"
              value={newModel.tags}
              onChange={(e) => setNewModel({...newModel, tags: e.target.value})}
              className={styles.input}
            />
            <button type="submit" className={styles.button} style={{ backgroundColor: '#28a745', color: 'white' }}>
              Upload Model
            </button>
          </form>
        </div>
      )}

      {/* Models Display */}
      <div className={styles.modelsSection}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Models ({models.length})</h2>
          <p>Total: {totalModels}</p>
        </div>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Loading models...</p>
          </div>
        ) : models.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>No models found.</p>
          </div>
        ) : (
          <div className={styles.modelsGrid}>
            {models.map((model, index) => (
              <div key={model.id || index} className={styles.modelCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{model.name}</h3>
                  <span style={{ 
                    fontSize: '0.8rem', 
                    padding: '0.2rem 0.5rem', 
                    backgroundColor: '#f0f0f0', 
                    borderRadius: '4px',
                    color: '#666'
                  }}>
                    {getTaskDisplayName(model.model_type)}
                  </span>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                  {model.description}
                </p>
                <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.5rem' }}>
                  <span>ID: {model.id}</span> • <span>Owner: {model.owner}</span>
                  {model.autonomys_location && (
                    <div style={{ marginTop: '0.25rem' }}>
                      <span>Location: {model.autonomys_location}</span>
                    </div>
                  )}
                  {model.version && (
                    <div style={{ marginTop: '0.25rem' }}>
                      <span>Version: {model.version}</span>
                    </div>
                  )}
                </div>
                {model.tags && model.tags.length > 0 && (
                  <div className={styles.tags} style={{ marginBottom: '0.5rem' }}>
                    {model.tags.slice(0, 3).map((tag, tagIndex) => (
                      <span key={tagIndex} className={styles.tag}>{tag}</span>
                    ))}
                    {model.tags.length > 3 && (
                      <span style={{ fontSize: '0.8rem', color: '#888' }}>+{model.tags.length - 3} more</span>
                    )}
                  </div>
                )}
                <div style={{ fontSize: '0.8rem', color: '#888' }}>
                  {formatDate(model.created_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 