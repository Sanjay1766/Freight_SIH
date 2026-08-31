import os
import sys

# Auto-re-execute with dedicated venv if running from global system python
backend_dir = os.path.dirname(os.path.abspath(__file__))
venv_python = os.path.join(backend_dir, "venv", "bin", "python")

if os.path.exists(venv_python) and sys.executable != venv_python and "venv" not in sys.prefix:
    os.execv(venv_python, [venv_python] + sys.argv)

backend_dir = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(backend_dir)
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

import uvicorn
from backend.app.main import app

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
