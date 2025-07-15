# DEVTEAM Backend Implementation Guide

## 1. System Architecture

### 1.1 Core Components
- **Browser Manager**: Handles browser instance creation and management
- **Team Processor**: Manages parallel processing across teams
- **Response Collector**: Aggregates and formats team outputs
- **State Manager**: Tracks system state and team status

### 1.2 Technical Stack
- **Runtime**: Node.js
- **Browser Automation**: Playwright
- **State Management**: React Context/Hooks
- **File System**: Node.js fs/promises
- **Concurrency**: Promise.all for parallel processing

## 2. Browser Management

### 2.1 Instance Configuration
```typescript
interface BrowserConfig {
  maxInstances: 4;  // One per team
  viewport: {
    width: 1280,
    height: 720
  };
  timeout: 300000;  // 5 minutes max per operation
}
```

### 2.2 Browser Layout
- 2x2 grid layout
- Each browser positioned programmatically
- Optional macOS window tiling support
- Independent browser sessions per team

### 2.3 Instance Management
```typescript
class BrowserManager {
  private instances: Browser[] = [];
  
  async initialize() {
    for (let i = 0; i < 4; i++) {
      const browser = await playwright.chromium.launch({
        headless: false,
        viewport: config.viewport
      });
      this.instances.push(browser);
    }
  }
  
  async cleanup() {
    await Promise.all(this.instances.map(b => b.close()));
  }
}
```

## 3. Team Processing

### 3.1 Parallel Execution
```typescript
async function processTeams(selectedTeams: number[], prompt: string) {
  const teamPromises = selectedTeams.map(teamId => 
    processTeam(teamId, prompt)
  );
  
  return Promise.all(teamPromises);
}
```

### 3.2 Individual Team Processing
```typescript
async function processTeam(teamId: number, prompt: string) {
  const browser = browserManager.getInstance(teamId);
  
  // Setup and process
  await setupTeamEnvironment(browser);
  const response = await executeTeamPrompt(browser, prompt);
  
  // Export results
  await exportTeamResults(teamId, response);
  
  return {
    teamId,
    status: 'complete',
    response
  };
}
```

### 3.3 Response Collection
- Each team exports to separate .md file
- Files named TEAM1.md through TEAM4.md
- Uses Chathub's native formatting
- Optional summary appending

## 4. State Management

### 4.1 System States
```typescript
interface SystemState {
  activeTeams: number[];
  processingStatus: {
    isProcessing: boolean;
    completedTeams: number[];
    errors: Record<number, Error>;
  };
  browserStatus: {
    ready: boolean;
    instances: Record<number, boolean>;
  };
}
```

### 4.2 State Transitions
1. **Idle**
   - System ready
   - Teams selectable
   - All controls enabled

2. **Processing**
   - Teams locked
   - Controls disabled
   - Progress tracking active

3. **Completing**
   - Results collection
   - File exports
   - Cleanup operations

4. **Error**
   - Error capture
   - Partial completion handling
   - Recovery procedures

## 5. File System Operations

### 5.1 Export Configuration
```typescript
interface ExportConfig {
  baseDir: string;
  filePrefix: 'TEAM';
  extension: '.md';
  encoding: 'utf-8';
}
```

### 5.2 File Operations
```typescript
async function exportTeamResults(teamId: number, content: string) {
  const fileName = `TEAM${teamId}.md`;
  await fs.writeFile(fileName, content, 'utf-8');
}
```

## 6. Error Handling

### 6.1 Error Types
- Browser launch failures
- Processing timeouts
- Export errors
- Network issues

### 6.2 Recovery Procedures
```typescript
async function handleTeamError(teamId: number, error: Error) {
  // Log error
  console.error(`Team ${teamId} error:`, error);
  
  // Attempt recovery
  try {
    await restartTeamBrowser(teamId);
    return true;
  } catch (e) {
    // Mark team as failed but continue others
    markTeamFailed(teamId);
    return false;
  }
}
```

## 7. Performance Optimization

### 7.1 Resource Management
- Memory monitoring
- CPU usage optimization
- Browser resource limits

### 7.2 Timeout Handling
```typescript
const TIMEOUTS = {
  browserLaunch: 30000,    // 30 seconds
  processing: 300000,      // 5 minutes
  export: 10000,          // 10 seconds
  cleanup: 5000           // 5 seconds
};
```

## 8. Security Considerations

### 8.1 Zero-Storage Architecture
- No data persistence
- Memory-only processing
- Automatic cleanup

### 8.2 Browser Security
- Isolated contexts
- No shared cookies
- Clean session per run

## 9. File Attachment System

### 9.1 File Attachment Interface
```typescript
interface FileAttachment {
  id: string;
  name: string;
  status: 'uploading' | 'success' | 'error';
  url?: string;
}

interface FileManager {
  maxFileSize: number;    // Maximum file size in bytes
  allowedTypes: string[]; // Allowed MIME types
  maxFiles: number;       // Maximum number of concurrent files
}
```

### 9.2 Upload Status Handling
- Real-time status updates
- Success indicator (green circle)
- Error handling with user feedback
- Progress tracking for large files

### 9.3 File Management
```typescript
class FileAttachmentManager {
  private attachments: Map<string, FileAttachment> = new Map();

  async addFile(file: File): Promise<FileAttachment> {
    const attachment = {
      id: generateUniqueId(),
      name: file.name,
      status: 'uploading'
    };
    
    this.attachments.set(attachment.id, attachment);
    return this.processFile(attachment, file);
  }

  async removeFile(id: string): Promise<void> {
    const attachment = this.attachments.get(id);
    if (attachment?.url) {
      await this.cleanupFile(attachment.url);
    }
    this.attachments.delete(id);
  }
}
```

### 9.4 UI Integration
- Matches Chathub's visual design
- File removal button ('X') for each attachment
- Status indicators matching Chathub
- Drag-and-drop support
- Click-to-upload alternative

### 9.5 File Processing
```typescript
async function processFile(attachment: FileAttachment, file: File) {
  try {
    // Validate file
    validateFile(file);
    
    // Process file
    const url = await uploadFile(file);
    
    // Update status
    return {
      ...attachment,
      status: 'success',
      url
    };
  } catch (error) {
    return {
      ...attachment,
      status: 'error'
    };
  }
}
```

### 9.6 Cleanup Operations
- Automatic cleanup of temporary files
- Removal of orphaned attachments
- Session-based file management
- Memory usage optimization

## 10. Testing Strategy

### 10.1 Unit Tests
- Browser management
- Team processing
- File operations

### 10.2 Integration Tests
- Multi-team processing
- Error recovery
- State transitions

### 10.3 End-to-End Tests
- Complete processing cycle
- UI interaction
- File output validation 