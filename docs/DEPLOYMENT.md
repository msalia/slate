# Deployment

## How It Works

This project deploys to Dokploy at https://dok.msalia.org.
Dokploy pulls from the GitHub repo, builds with Docker Compose, and runs
the stack (web + db) behind HTTPS at slate.msalia.org.

## Ship Code

Use the `/project ship` command or manually:

```bash
# Run tests
npm test

# Format
npm run format

# Commit and push
git add -A
git commit -m "feat: description"
git push
```

Pushing to main triggers auto-deploy on Dokploy.

## Environment Variables

Set production secrets via Dokploy dashboard or API.
The `.env` file contains safe local defaults and is committed to the repo.
Override `POSTGRES_PASSWORD` with a real value in Dokploy.
