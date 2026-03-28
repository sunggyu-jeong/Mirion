#!/bin/bash
set -e

REPO_DIR="/home/ubuntu/lockfi"
APP_DIR="$REPO_DIR/apps/web"
DATA_DIR="/home/ubuntu/lockfi/data"

echo "=== LockFi API 배포 ==="

# 코드 업데이트
cd "$REPO_DIR"
git pull origin main

# 의존성 설치
pnpm install --frozen-lockfile

# 빌드
cd "$APP_DIR"
pnpm build

# 데이터 디렉토리 생성
mkdir -p "$DATA_DIR"

# PM2 재시작
pm2 reload ecosystem.config.cjs --update-env || pm2 start ecosystem.config.cjs

echo "=== 배포 완료 ==="
pm2 status
