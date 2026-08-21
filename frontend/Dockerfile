# [Docker] 프론트(React+Vite) 컨테이너 빌드 정의
#
# 2단계(멀티스테이지) 빌드:
#   1) builder — Node로 `npm run build`를 실행해 정적 파일(dist/)을 생성한다.
#      이 프로젝트는 빌드 시점에 주입해야 할 VITE_ 환경변수가 없다 (import.meta.env
#      미사용, grep으로 확인) — teams-kanban-board의 frontend/Dockerfile과 달리
#      build args가 필요 없다.
#   2) 최종 이미지 — nginx가 그 dist/ 결과물만 그대로 서빙한다. Node/소스코드는
#      최종 이미지에 남지 않아 이미지 용량이 작다.

FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
