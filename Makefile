.PHONY: backend-upgrade backend-seed backend-test frontend-install frontend-typecheck frontend-lint frontend-build ci-local

backend-upgrade:
	cd backend && flask db upgrade

backend-seed:
	cd backend && flask seed

backend-test:
	cd backend && pytest

frontend-install:
	cd frontend && npm ci

frontend-typecheck:
	cd frontend && npm run typecheck

frontend-lint:
	cd frontend && npm run lint

frontend-build:
	cd frontend && npm run build

ci-local: backend-upgrade backend-test frontend-typecheck frontend-lint frontend-build
