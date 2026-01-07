# Test App - API Design

## Overview
API design specifications for the Test App backend integration.

## Base Configuration

**Base URL**: `http://localhost:3000` (Orchestrator API)  
**Content-Type**: `application/json`  
**Authentication**: Bearer token (future implementation)

---

## Endpoints

### File Operations

#### Read File
```
GET /files/read?path={filePath}
```

**Response**:
```json
{
  "content": "file contents here",
  "path": "/absolute/path/to/file"
}
```

**Status Codes**:
- 200: Success
- 404: File not found
- 400: Not a text file

---

### Browser Control

#### Navigate
```
POST /browser/navigate
```

**Request**:
```json
{
  "url": "https://example.com"
}
```

**Response**:
```json
{
  "status": "success",
  "url": "https://example.com"
}
```

#### Control Actions
```
POST /browser/control
```

**Request**:
```json
{
  "action": "back" | "forward" | "reload"
}
```

---

### Terminal Management

#### WebSocket Terminal
```
WS /ws/terminal/{sessionId}
```

**Messages**:
- Input: `{"type": "input", "data": "command\n"}`
- Output: `{"type": "output", "data": "result"}`
- Resize: `{"type": "resize", "cols": 80, "rows": 24}`

---

### Instance Management

#### Spawn Toad Instance
```
POST /spawn
```

**Request**:
```json
{
  "port": 8001
}
```

**Response**:
```json
{
  "status": "started",
  "port": 8001,
  "pid": 12345
}
```

#### List Instances
```
GET /instances/list
```

**Response**:
```json
{
  "instances": [
    {
      "port": 8000,
      "pid": 12345,
      "status": "running"
    }
  ]
}
```

---

## Error Handling

All endpoints return errors in this format:

```json
{
  "detail": "Error message description"
}
```

**Common Status Codes**:
- 400: Bad Request
- 404: Not Found
- 500: Internal Server Error

---

## Future Enhancements

- [ ] Authentication via JWT
- [ ] Rate limiting
- [ ] WebSocket reconnection logic
- [ ] File upload endpoints
- [ ] Batch operations
