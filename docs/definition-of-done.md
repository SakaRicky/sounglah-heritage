# Definition of Done

A slice is done only when:

1. The goal is clearly stated.
2. The scope stayed small.
3. The implementation matches existing patterns.
4. The app still builds.
5. Relevant tests/checks were run.
6. No unrelated files were changed.
7. The reviewer approved it.
8. Known assumptions are documented.
9. The slice board is updated.
10. A clear commit message is prepared.

## Minimum Checks

For backend slices, run what exists (from repository root, `backend/` first):

```bash
cd backend
python3 -m venv .venv   # once; skip if .venv already exists
source .venv/bin/activate
pytest
python run.py
```

For frontend slices, run what exists (from `frontend/`):

```bash
cd frontend
npm run build
npm run lint
```

If a command does not exist yet, document that instead of pretending it passed.
