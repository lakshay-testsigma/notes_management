FROM node:22.18-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY src ./src
COPY samples ./samples
# The CLI reads files you mount at /data. Report goes to stdout, logs to stderr.
ENTRYPOINT ["node", "src/main.ts"]
CMD ["--har", "samples/checkout.har", "--exit-zero"]
