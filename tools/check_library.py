#!/usr/bin/env python3
"""
tools/check_library.py

CLI entrypoint for library validation as specified in library/README.md.
"""
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT))

from companion.check_library import main

if __name__ == "__main__":
    sys.exit(main())
