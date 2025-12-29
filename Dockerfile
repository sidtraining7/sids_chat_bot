# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Copy the backend requirements file first to leverage Docker cache
COPY backend/requirements.txt ./backend/requirements.txt

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy the rest of the application code
COPY backend ./backend
COPY frontend ./frontend

# Set working directory to backend to run the server
WORKDIR /app/backend

# Expose port 8000 for the app
EXPOSE 8000

# Run uvicorn server
# Using host 0.0.0.0 is crucial for Docker containers
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
