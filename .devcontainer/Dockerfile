# Development container optimized for remote development with Docker Context
FROM node:20-alpine AS base

# Build arguments for Git configuration from host
ARG GIT_USER_NAME
ARG GIT_USER_EMAIL
ARG GIT_SIGNING_KEY
ARG GIT_SIGN_COMMITS
ARG GIT_REPO_URL

# Install system dependencies and tools for development
RUN apk add --no-cache \
    git \
    git-lfs \
    bash \
    curl \
    wget \
    openssh-client \
    ca-certificates \
    libc6-compat \
    python3 \
    make \
    g++ \
    shadow \
    gnupg \
    && rm -rf /var/cache/apk/*

# Install pnpm globally with specific version
RUN npm install -g pnpm@9.5.0

# Set up proper home directory and shell for node user
RUN mkdir -p /home/node && \
    chown node:node /home/node && \
    sed -i 's|/home/node:/bin/sh|/home/node:/bin/bash|' /etc/passwd

# Create pnpm directories for node user with proper permissions
RUN mkdir -p /home/node/.local/share/pnpm/store && \
    mkdir -p /home/node/.cache/pnpm && \
    mkdir -p /home/node/.local/share/pnpm/state && \
    chown -R node:node /home/node/.local && \
    chown -R node:node /home/node/.cache

# Install development tools
RUN apk add --no-cache \
    vim \
    nano \
    htop \
    tree \
    jq \
    && rm -rf /var/cache/apk/*

# Set up Git configuration for container
RUN git config --global --add safe.directory /workspace && \
    git config --global init.defaultBranch main

# Create workspace directory and set ownership immediately
RUN mkdir -p /workspace && chown node:node /workspace

# Switch to node user early
USER node
WORKDIR /workspace

# Configure pnpm for node user
RUN pnpm config set store-dir /home/node/.local/share/pnpm/store && \
    pnpm config set cache-dir /home/node/.cache/pnpm && \
    pnpm config set state-dir /home/node/.local/share/pnpm/state

# Set up Git configuration using build args or defaults
RUN git config --global user.name "${GIT_USER_NAME:-Dev Container User}" && \
    git config --global user.email "${GIT_USER_EMAIL:-dev@container.local}" && \
    git config --global core.autocrlf input && \
    git config --global pull.rebase false && \
    git config --global init.defaultBranch main && \
    if [ -n "$GIT_SIGNING_KEY" ]; then \
        git config --global user.signingkey "$GIT_SIGNING_KEY"; \
    fi && \
    if [ "$GIT_SIGN_COMMITS" = "true" ]; then \
        git config --global commit.gpgsign true; \
    fi

# Create entrypoint script
RUN echo '#!/bin/bash' > /home/node/entrypoint.sh && \
    echo 'set -e' >> /home/node/entrypoint.sh && \
    echo 'cd /workspace' >> /home/node/entrypoint.sh && \
    echo 'if [ ! -f package.json ] && [ -n "$GIT_REPO_URL" ]; then' >> /home/node/entrypoint.sh && \
    echo '  echo "Setting up project..."' >> /home/node/entrypoint.sh && \
    echo '  git clone "$GIT_REPO_URL" .' >> /home/node/entrypoint.sh && \
    echo '  pnpm install' >> /home/node/entrypoint.sh && \
    echo '  echo "Project setup complete!"' >> /home/node/entrypoint.sh && \
    echo 'elif [ -f package.json ]; then' >> /home/node/entrypoint.sh && \
    echo '  echo "Project already exists, skipping setup"' >> /home/node/entrypoint.sh && \
    echo 'else' >> /home/node/entrypoint.sh && \
    echo '  echo "No repo URL provided, workspace ready for manual setup"' >> /home/node/entrypoint.sh && \
    echo 'fi' >> /home/node/entrypoint.sh && \
    echo 'exec "$@"' >> /home/node/entrypoint.sh && \
    chmod +x /home/node/entrypoint.sh

# Set environment variables for development
ENV NODE_ENV=development \
    NEXT_TELEMETRY_DISABLED=1 \
    PNPM_HOME=/usr/local/bin \
    PATH=/usr/local/bin:$PATH \
    GIT_REPO_URL=${GIT_REPO_URL}

# Expose development ports
EXPOSE 3000 3001

# Use entrypoint script and keep container running
ENTRYPOINT ["/home/node/entrypoint.sh"]
CMD ["sleep", "infinity"] 