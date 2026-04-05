# MobyPhish Study Deployment

Tooling for distributing the MobyPhish/Tutanota study build to research laptops
as pre-built Docker images. Laptops never build from source — they load a
pre-made image bundle and switch between study arms at runtime.

## What's in here

| File | Runs on | Purpose |
|---|---|---|
| `build-all-arms.sh` | Dev machine | Builds all four study arms and saves them as a single compressed tarball |
| `make-release.sh` | Dev machine | Wraps `build-all-arms.sh` + publishes the result as a GitHub release |
| `docker-compose.laptop.yml` | Study laptop | Image-based compose file (no `build:` directive) |
| `run-study.sh` | Study laptop | Launcher — switches between study arms at runtime |

## Study arms

Each arm is built from a distinct git branch and tagged as a separate Docker image:

| Arm | Branch | What it does |
|---|---|---|
| `sean-dev1` | `sean-dev1` | Full MobyPhish anti-phishing UI with custom warning banners |
| `db-dev` | `db-dev` | Assignment tracking + `email_opened` logging |
| `default-antiphishing-header` | `default-antiphishing-header` | Upstream Tuta anti-phishing header |
| `no-antiphishing-header` | `no-antiphishing-header` | Control group, no anti-phishing header |

---

## Dev-machine workflow

### Build all arms into one tarball

```bash
./deployment/build-all-arms.sh
# → writes dist/mobyphish-images-YYYYMMDD-<sha>.tar.gz
```

Variants:
```bash
OUT_DIR=/tmp ./deployment/build-all-arms.sh              # write tarball elsewhere
ARMS="sean-dev1 db-dev" ./deployment/build-all-arms.sh   # subset of arms
```

First build is ~5 minutes on a fast machine (i9/4080), much longer on
weaker hardware. Subsequent builds reuse BuildKit cache and are much faster.

### Publish as a GitHub release

```bash
./deployment/make-release.sh
# Uses GITHUB_CLI (gh) to create a release tagged deploy-YYYYMMDD-<sha>
# Uploads: the tarball + docker-compose.laptop.yml + run-study.sh as assets
```

Variants:
```bash
./deployment/make-release.sh v1.0.0                   # custom tag
./deployment/make-release.sh v1.0.0 "Pilot release"   # custom tag + title
DRAFT=1 ./deployment/make-release.sh                  # draft release (not public)
```

**Prerequisites:**
- `gh` CLI installed and authenticated (`gh auth login`)
- A default repo set (`gh repo set-default`)
- `docker` + `docker compose` working without `sudo`

---

## Laptop workflow

### First-time setup (once per laptop)

```bash
# 1. Download the release assets (requires gh CLI + GitHub auth, OR use curl from release page)
gh release download deploy-YYYYMMDD-<sha> -R sdpteam30/sdptutanota

# 2. Load all four images into Docker
gunzip -c mobyphish-images-*.tar.gz | docker load

# 3. Place your Supabase credentials file next to the compose file
cp /secure-location/.env .

# 4. Make the launcher executable
chmod +x run-study.sh
```

Final laptop directory should look like:
```
.
├── docker-compose.laptop.yml
├── run-study.sh
├── .env                            ← Supabase creds (NEVER committed to git)
└── mobyphish-images-*.tar.gz       ← optional to keep after loading
```

The `.env` file needs:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
```

### Switching between study arms

Each arm corresponds to a distinct loaded Docker image. Switching takes ~2 seconds:

```bash
./run-study.sh sean-dev1                      # full anti-phishing UI
./run-study.sh db-dev                         # assignment tracking + email_opened
./run-study.sh default-antiphishing-header    # upstream Tuta header
./run-study.sh no-antiphishing-header         # control, no header
```

The script stops the current container and starts a new one on the same ports.
No rebuild, no download, no git operations.

### Ports

Every arm exposes the same ports:
- **Frontend:** http://localhost:9000
- **Backend (trusted-senders):** http://localhost:3000
- **CORS proxy:** http://localhost:8080

### Checking which arm is running

```bash
docker compose -f docker-compose.laptop.yml ps
# look at the IMAGE column — it shows mobyphish:<arm-name>
```

### Viewing logs / stopping

```bash
docker compose -f docker-compose.laptop.yml logs -f      # live logs
docker compose -f docker-compose.laptop.yml down         # stop container
```

---

## Troubleshooting

### `Error: image 'mobyphish:<arm>' not found locally`
You haven't loaded the image bundle yet, or the tarball was incomplete:
```bash
gunzip -c mobyphish-images-*.tar.gz | docker load
docker images | grep mobyphish   # verify all four are listed
```

### `Error: .env not found`
Copy your Supabase credentials file into the same directory as
`docker-compose.laptop.yml`. The file must be named exactly `.env`.

### Container starts but frontend doesn't load
Check the backend came up and Supabase creds are valid:
```bash
curl http://localhost:3000/     # should return "Trusted Senders Backend is Running..."
docker compose -f docker-compose.laptop.yml logs tutanota
```

### Port already in use
Another service is bound to 9000/3000/8080. Either stop it, or edit
`docker-compose.laptop.yml` to remap ports.

### Participant data persists between arms
The `backend-data` Docker volume is shared across arms by default. Most study
state lives in Supabase anyway, so this rarely matters, but if you need
isolated state per arm, add a per-arm volume in `docker-compose.laptop.yml`.
