#!/usr/bin/env python3
"""Deploy Slate to Dokploy. Run from anywhere — reads config from infra.json."""

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

def api_call(endpoint, payload):
    url = f"{api_base}/{endpoint}"
    data = json.dumps({"json": payload}).encode()
    req = urllib.request.Request(
        url,
        data=data,
        headers={"x-api-key": token, "Content-Type": "application/json"},
        method="POST",
    )
    resp = json.loads(urllib.request.urlopen(req).read())
    return resp

def api_get(endpoint, payload):
    query = urllib.request.quote(json.dumps({"json": payload}))
    url = f"{api_base}/{endpoint}?input={query}"
    req = urllib.request.Request(url, headers={"x-api-key": token})
    resp = json.loads(urllib.request.urlopen(req).read())
    return resp


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
if "result" in resp:
    print("   ✓ Environment updated")
else:
    print("   ✗ Failed:", resp)
    sys.exit(1)

# Step 2: Deploy
print("2. Triggering deployment...")
resp = api_call("compose.deploy", {"composeId": compose_id})
if "result" in resp:
    print("   ✓ Deploy triggered")
else:
    print("   ✗ Failed:", resp)
    sys.exit(1)

# Step 3: Reload Traefik
print("3. Reloading Traefik...")
resp = api_call("settings.reloadTraefik", {})
if "result" in resp:
    print("   ✓ Traefik reloaded")
else:
    print("   ✗ Failed:", resp)

# Step 4: Monitor deployment
print("4. Monitoring deployment...")
for i in range(20):
    time.sleep(15)
    try:
        resp = api_get("compose.one", {"composeId": compose_id})
        data = resp["result"]["data"]["json"]
        status = data.get("composeStatus", "unknown")
        deployments = data.get("deployments", [])
        latest = deployments[0] if deployments else {}
        dep_status = latest.get("status", "unknown")
        print(f"   [{i+1}] compose: {status}, deploy: {dep_status}")

        if dep_status == "done":
            print("\n✓ Deployment successful!")
            print(f"  URL: https://{dokploy_json['domain']}")
            sys.exit(0)
        elif dep_status == "error":
            print("\n✗ Deployment failed!")
            print(f"  Error: {latest.get('errorMessage', 'unknown')}")
            sys.exit(1)
    except Exception as e:
        print(f"   [{i+1}] Checking... ({e})")

print("\n⚠ Timed out waiting for deployment. Check Dokploy dashboard.")
