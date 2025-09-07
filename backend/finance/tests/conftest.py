import os
import django

# Set Django settings before any Django import
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()
