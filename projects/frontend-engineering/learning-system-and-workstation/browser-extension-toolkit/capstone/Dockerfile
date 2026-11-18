FROM node:22.18-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY src ./src
COPY policy ./policy
COPY sample ./sample
# Mount your saved page and headers at /data. Report goes to stdout, logs to stderr.
ENTRYPOINT ["node", "src/main.ts"]
CMD ["run", "--profile", "sample/profile.json", "--page", "sample/page.html", "--headers", "sample/headers.txt"]
