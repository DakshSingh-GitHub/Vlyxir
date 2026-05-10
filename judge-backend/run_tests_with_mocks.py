import sys
from unittest.mock import MagicMock

# Mocking modules that might be missing in the environment
def mock_missing():
    # Mock psutil
    if 'psutil' not in sys.modules:
        mock_psutil = MagicMock()
        sys.modules['psutil'] = mock_psutil

    # Mock requests (for test_api.py)
    if 'requests' not in sys.modules:
        mock_requests = MagicMock()
        sys.modules['requests'] = mock_requests

    # Mock fastapi/pydantic if needed for other tests
    for mod in ['fastapi', 'fastapi.middleware.cors', 'pydantic', 'jwt']:
        if mod not in sys.modules:
            sys.modules[mod] = MagicMock()

if __name__ == "__main__":
    mock_missing()
    import os
    import subprocess

    # Add judge-backend to PYTHONPATH
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    os.environ['PYTHONPATH'] = f"{os.environ.get('PYTHONPATH', '')}:{backend_dir}"

    # Run test_security.py
    print("Running test_security.py...")
    # We use a wrapper to run the test with mocks
    subprocess.run([sys.executable, "-c",
                   "import sys; from unittest.mock import MagicMock; sys.modules['psutil'] = MagicMock(); "
                   "import os; sys.path.append(os.getcwd()); from test_security import test_security; test_security()"],
                   cwd=backend_dir)
