FROM node:26-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY src ./src
COPY fixtures ./fixtures
ENTRYPOINT ["node", "src/main.ts"]
CMD ["fixtures/good"]
