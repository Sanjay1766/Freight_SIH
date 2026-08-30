import sys
import os

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.dirname(backend_dir)
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

import uvicorn
from backend.app.main import app

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
