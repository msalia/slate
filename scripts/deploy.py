#!/usr/bin/env python3
"""Deploy Slate to Dokploy.

Usage:
  python3 scripts/deploy.py           # Full deploy (env + build + traefik + monitor)
  python3 scripts/deploy.py traefik   # Reload Traefik only
  python3 scripts/deploy.py status    # Check deployment status
  python3 scripts/deploy.py deploy    # Deploy only (skip env update)
"""

import json
import sys
import time
import urllib.request
from pathlib import Path

# Find project root (where infra.json lives)
root = Path(__file__).resolve().parent.parent.parent.parent
infra = json.loads((root / "infra.json").read_text())
dokploy_json = json.loads((root / "projects" / "slate" / ".dokploy.json").read_text())

# Load config
server_name = dokploy_json["server"]
server = infra["integrations"]["dokploy"]["servers"][server_name]
api_base = server["apiBase"]
creds_path = root / infra["integrations"]["dir"] / server["credsFile"]
token = next(line.split()[1] for line in creds_path.read_text().splitlines() if line.startswith("TOKEN:"))
compose_id = dokploy_json["composeId"]
domain = dokploy_json["domain"]


def api_call(endpoint, payload):
    url = f"{api_base}/{endpoint}"
    data = json.dumps({"json": payload}).encode()
    req = urllib.request.Request(
        url, data=data,
        headers={"x-api-key": token, "Content-Type": "application/json"},
        method="POST",
    )
    return json.loads(urllib.request.urlopen(req).read())


def api_get(endpoint, payload):
    query = urllib.request.quote(json.dumps({"json": payload}))
    url = f"{api_base}/{endpoint}?input={query}"
    req = urllib.request.Request(url, headers={"x-api-key": token})
    return json.loads(urllib.request.urlopen(req).read())


def reload_traefik():
    print("Reloading Traefik...")
    resp = api_call("settings.reloadTraefik", {})
    print("  ✓ Traefik reloaded" if "result" in resp else f"  ✗ Failed: {resp}")


def check_status():
    print("Checking deployment status...")
    resp = api_get("compose.one", {"composeId": compose_id})
    data = resp["result"]["data"]["json"]
    status = data.get("composeStatus", "unknown")
    deployments = data.get("deployments", [])
    latest = deployments[0] if deployments else {}
    print(f"  Compose: {status}")
    print(f"  Latest deploy: [{latest.get('status', 'none')}] {latest.get('title', '')}")
    print(f"  URL: https://{domain}")


def deploy_only():
    print("Triggering deployment...")
    resp = api_call("compose.deploy", {"composeId": compose_id})
    if "result" not in resp:
        print(f"  ✗ Failed: {resp}")
        sys.exit(1)
    print("  ✓ Deploy triggered")
    reload_traefik()
    monitor()


def monitor():
    print("Monitoring deployment...")
    for i in range(20):
        time.sleep(15)
        try:
            resp = api_get("compose.one", {"composeId": compose_id})
            data = resp["result"]["data"]["json"]
            deployments = data.get("deployments", [])
            latest = deployments[0] if deployments else {}
            dep_status = latest.get("status", "unknown")
            print(f"  [{i+1}] {dep_status}")

            if dep_status == "done":
                print(f"\n✓ Deployment successful!\n  URL: https://{domain}")
                return
            elif dep_status == "error":
                print(f"\n✗ Deployment failed!\n  Error: {latest.get('errorMessage', 'unknown')}")
                sys.exit(1)
        except Exception as e:
            print(f"  [{i+1}] Checking... ({e})")

    print("\n⚠ Timed out. Check Dokploy dashboard.")


def full_deploy():
    # Step 1: Update env
    print("1. Updating environment variables...")
    env_content = "\n".join([
        "POSTGRES_USER=postgres",
        "POSTGRES_PASSWORD=postgres",
        "POSTGRES_DB=slate",
        "DATABASE_URL=postgresql://postgres:postgres@db:5432/slate",
        "SESSION_SECRET=slate-prod-6c90cf2b7152923a8114da70b304d73e",
        "WEB_PORT=3000",
    ])
    resp = api_call("compose.update", {"composeId": compose_id, "env": env_content})
    if "result" not in resp:
        print(f"   ✗ Failed: {resp}")
        sys.exit(1)
    print("   ✓ Environment updated")

    # Step 2: Deploy
    print("2. Triggering deployment...")
    resp = api_call("compose.deploy", {"composeId": compose_id})
    if "result" not in resp:
        print(f"   ✗ Failed: {resp}")
        sys.exit(1)
    print("   ✓ Deploy triggered")

    # Step 3: Reload Traefik
    print("3. Reloading Traefik...")
    reload_traefik()

    # Step 4: Monitor
    print("4. Monitoring deployment...")
    monitor()


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "full"

    commands = {
        "deploy": deploy_only,
        "full": full_deploy,
        "monitor": monitor,
        "status": check_status,
        "traefik": reload_traefik,
    }

    if cmd in commands:
        commands[cmd]()
    else:
        print(f"Unknown command: {cmd}")
        print("Usage: deploy.py [full|deploy|traefik|status|monitor]")
        sys.exit(1)
