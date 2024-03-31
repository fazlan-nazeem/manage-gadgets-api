FROM node:lts-alpine3.19

WORKDIR /usr/src/app
# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.npm to speed up subsequent builds.
# Leverage a bind mounts to package.json and package-lock.json to avoid having to copy them into
# into this layer.
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

# Run the application as a non-root user.
USER 10001

# Copy the rest of the source files into the image.
COPY --chown=10001 . .

# Expose the port that the application listens on.
EXPOSE 4000

# Run the application.
CMD npm start
