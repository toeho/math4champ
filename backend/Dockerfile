# ===== Stage 1: Builder =====
FROM python:3.11 AS builder

# Set working directory
WORKDIR /app

# Copy requirements file first for better layer caching
COPY requirements.txt .

# Install dependencies in a temporary folder
RUN pip install --no-cache-dir -r requirements.txt -t /install


# ===== Stage 2: Final (Slim) Image =====
FROM python:3.11-slim AS final

# Set working directory
WORKDIR /app

# Copy only dependencies from builder stage
COPY --from=builder /install /usr/local/lib/python3.11/site-packages/

# Copy your application code
COPY . .

# Expose port (optional)

# Set default command
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]