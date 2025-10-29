# ===== Stage 1: Builder =====
FROM python:3.11 AS builder

WORKDIR /app

COPY requirements.txt .

# Install all dependencies normally (so binaries like uvicorn are generated)
RUN pip install --no-cache-dir -r requirements.txt


# ===== Stage 2: Final (Slim) Image =====
FROM python:3.11-slim AS final

WORKDIR /app

# Copy installed packages and binaries
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy project files
COPY . .

EXPOSE 8000

# Start FastAPI with uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
