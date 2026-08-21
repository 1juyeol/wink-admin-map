# 배포 명령어

**꼭 `docker-compose.yml` 파일이 있는 폴더 안에서 실행할 것.** `docker compose` 명령어는
지금 위치한 폴더의 `docker-compose.yml`을 자동으로 찾아서 쓰기 때문에, 다른 폴더에서 치면
파일을 못 찾아 에러가 난다.

```bash
# 1. 압축 풀고 이동
unzip wink-admin-map.zip      # 압축 풀어서 프로젝트 파일 꺼내기
cd wink-admin-map              # docker-compose.yml이 있는 폴더로 이동

# 2. 실행
docker compose up --build -d   # frontend 이미지 빌드 후 백그라운드 실행

# 3. 확인
docker compose ps    # 컨테이너(frontend) Up인지 확인
```

이 프로젝트는 백엔드/DB가 없는 정적 SPA라, 테이블 생성이나 마이그레이션 같은 별도 초기화
단계가 없다. `docker compose up --build -d` 한 줄이면 끝.

## 브라우저 주소

- **지금(로컬 테스트)**: `http://localhost:8091`
- **서버 IP로 접속하는 경우**: `http://서버IP:8091`
- **도메인이 생기면**: `http://도메인:8091`

포트를 8091로 잡은 이유: 같은 서버에서 돌아갈 수 있는 teams-kanban-board가 8090을 쓰고
있어서 충돌 방지 차원. 포트를 바꾸고 싶으면 `.env`에 `NGINX_PORT=원하는포트`를 넣고
`docker compose up -d`로 재시작.

---

문제 생기면 로그 확인:
```bash
docker compose logs frontend
```
