FROM python:3.12-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends libreoffice fonts-dejavu \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY server.py /app/server.py

ENV HOST=0.0.0.0
EXPOSE 8000
CMD ["python", "server.py"]