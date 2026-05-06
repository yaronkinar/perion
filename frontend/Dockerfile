FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM deps AS builder
COPY tsconfig.json vite.config.ts tailwind.config.ts postcss.config.cjs index.html ./
COPY src ./src
COPY public ./public
COPY .storybook ./.storybook
RUN npm run build

FROM nginx:alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

FROM deps AS test
COPY tsconfig.json vite.config.ts vitest.setup.ts tailwind.config.ts postcss.config.cjs index.html ./
COPY src ./src
ENV CI=true
CMD ["npm", "test"]

FROM mcr.microsoft.com/playwright:v1.47.2-jammy AS e2e
WORKDIR /work
COPY package.json package-lock.json* ./
RUN npm ci
COPY tsconfig.json vite.config.ts tailwind.config.ts postcss.config.cjs index.html playwright.config.ts ./
COPY src ./src
COPY public ./public
COPY e2e ./e2e
ENV CI=true
ENV E2E_NO_WEBSERVER=1
CMD ["npx", "playwright", "test"]
