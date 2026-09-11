# FAQGenie Local Setup Guide

This document defines the exact commands and configuration requirements for running the entire FAQGenie platform locally.

## Prerequisites

Before attempting to start any services, you must verify the following dependencies:

1. **Node.js**: v18 or v20
2. **Python**: Strictly **Python 3.11**. Other versions (like 3.12 or 3.13) will cause unresolvable module errors with pinned PyTorch/Transformer bindings.
3. **MongoDB Atlas**:
   - You must have a valid `MONGODB_URI`.
   - **CRITICAL BLOCKER**: Your machine's current public IP address **MUST be allowlisted** in the MongoDB Atlas Network Access panel. Otherwise, the backend API and worker will crash with a clear network blocked error on startup.
4. **Redis**: Redis must be installed and running locally on the default port `6379`.
5. **Groq API**: You need a valid `GROQ_API_KEY`.

---

## Process Management Workflow

A clean local service management layer has been implemented. Do **NOT** use `killall node` or `lsof` manually. The repository now uses native helper scripts to safely identify and terminate ONLY the FAQGenie processes bound to these expected ports.

### Expected Ports
- **Frontend**: 3000
- **Backend**: 5001
- **ML API**: 8000
- **Redis**: 6379

---

### Start Services

Run these root commands from the `FAQ_Genie` repository root directory.

1. **Redis**: Ensure your local Redis server is running on `6379`.
2. **Machine Learning API**:
   ```bash
   npm run dev:ml
   ```
3. **Backend API**:
   ```bash
   npm run dev:backend
   ```
4. **Backend Worker**:
   ```bash
   npm run dev:worker
   ```
5. **Frontend Application**:
   ```bash
   npm run dev:frontend
   ```

*Note: The start scripts automatically check if their respective ports are already occupied and will refuse to double-start, preventing silent port switching.*

---

### Stop Services

To cleanly terminate processes and free their ports without affecting unrelated programs:

```bash
# Stop the Machine Learning service
npm run stop:ml

# Stop the Frontend service
npm run stop:frontend

# Stop the Backend API
npm run stop:backend
```
*(The backend worker can be stopped via standard `Ctrl+C` as it does not bind to a port).*

---

### Restart Services

To restart a service without triggering an "address already in use" conflict:

```bash
npm run stop:frontend
npm run dev:frontend
```
