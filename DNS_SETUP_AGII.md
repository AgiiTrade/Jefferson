# DNS setup runbook: agii.ca and ai.agii.ca

Last prepared: 2026-05-20
Last updated: 2026-05-21

This runbook prepares the local hosting/DNS artifacts only. It does not change DNS, GitHub Pages settings, or live URLs.

---

## Current repository state

- Deploy repo: `AgiiTrade/Jefferson`
- Current GitHub remote: `git@github.com:AgiiTrade/Jefferson.git`
- Current deploy root: `active/deploy/`
- Current root page: `active/deploy/index.html`, a multi-project dashboard
- Agii main-site candidate: `active/deploy/index.html` (rebuilt as canonical Agii.ca landing page; `agii-landing.html` kept as redirect)
- AI Modernizer static site candidate: `active/deploy/ai-modernizer/index.html`
- Existing CNAME files found before this runbook: none
- CNAME artifact prepared: `active/deploy/ai-modernizer/CNAME` contains `ai.agii.ca`

Important constraint: GitHub Pages supports one configured custom domain per Pages site. A `CNAME` file is only honored at that site's published root. A `CNAME` inside `ai-modernizer/` is useful only if that folder is published as its own Pages site root, for example through a separate repository or a GitHub Actions Pages artifact.

---

## Recommended architecture

Use separate GitHub Pages sites for the public Agii domains:

1. `agii.ca`
   - Host from a dedicated Agii main-site Pages repo or Pages artifact.
   - Publish the Agii landing page as the site root `index.html`.
   - Put `agii.ca` in that site's root `CNAME`.

2. `ai.agii.ca`
   - Host from a separate AI Modernizer Pages repo or Pages artifact.
   - Publish `active/deploy/ai-modernizer/` as the site root.
   - Put `ai.agii.ca` in that site's root `CNAME`.

3. Keep `AgiiTrade/Jefferson` unchanged for the existing multi-project GitHub Pages setup unless Arfeen explicitly decides to repurpose it.

This avoids breaking existing Jefferson paths such as `https://agiitrade.github.io/Jefferson/...` and avoids mapping the whole multi-project deploy tree to `agii.ca`.

---

## Why not use one repo with subfolders?

GitHub Pages custom domains apply to the whole Pages site, not to individual subfolders.

If `active/deploy/CNAME` is set to `agii.ca`, then the whole Jefferson Pages site becomes the `agii.ca` site. The path `active/deploy/ai-modernizer/` can still be reachable as `https://agii.ca/ai-modernizer/`, but it cannot independently become `https://ai.agii.ca/` from a nested `CNAME` file.

If `active/deploy/ai-modernizer/CNAME` is committed inside the current Jefferson repo but the repo still publishes from `active/deploy/`, GitHub Pages will not treat that nested file as a second custom domain.

---

## Deployment options

### Option A: safest production setup (recommended)

Create two dedicated Pages deployments.

For `agii.ca`:

```bash
# Example target repo layout
agii-ca/
  index.html          # copied/promoted from active/deploy/index.html
  agii-landing.html   # redirect shim
  CNAME               # contains: agii.ca
  css/
  js/
  assets/
```

For `ai.agii.ca`:

```bash
# Example target repo layout
ai-agii-ca/
  index.html          # copied from active/deploy/ai-modernizer/index.html
  CNAME               # contains: ai.agii.ca
  css/
  assets/
  platform.html
  methodology.html
  case-studies.html
  book-demo.html
```

GitHub Pages settings:

- Source: the published branch root, or GitHub Actions Pages artifact.
- Custom domain for main site: `agii.ca`
- Custom domain for AI site: `ai.agii.ca`
- Enable Enforce HTTPS after DNS is detected and certificate provisioning completes (see HTTPS timing section below).

### Option B: one Pages site with paths

Use one custom domain for the whole Pages site:

- `agii.ca` points to the Pages site.
- AI Modernizer lives at `https://agii.ca/ai-modernizer/`.
- Do not attempt to use `ai.agii.ca` for the subfolder.

This is simpler, but it does not satisfy the separate `ai.agii.ca` subdomain goal.

### Option C: external static host

Use Cloudflare Pages, Netlify, Vercel, or another static host:

- `agii.ca` deploys from the Agii main site root.
- `ai.agii.ca` deploys from `active/deploy/ai-modernizer/`.
- DNS records follow the selected host's instructions.

This can be cleaner if GitHub repo separation is inconvenient.

---

## DNS records for GitHub Pages

Only make these changes at the DNS provider **after** the GitHub Pages sites are ready (see pre-flight checklist below).

### Apex: agii.ca

GitHub Pages requires A records for the apex domain (ALIAS/ANAME may be used instead if your registrar supports it — see Cloudflare note below).

```text
Type  Name  Value               TTL
A     @     185.199.108.153     300 (lower before cutover; raise to 3600 after verification)
A     @     185.199.109.153     300
A     @     185.199.110.153     300
A     @     185.199.111.153     300
AAAA  @     2606:50c0:8000::153  300
AAAA  @     2606:50c0:8001::153  300
AAAA  @     2606:50c0:8002::153  300
AAAA  @     2606:50c0:8003::153  300
```

IPv6 (AAAA) records are optional but recommended for full GitHub Pages HTTPS support.

### Subdomain: ai.agii.ca

```text
Type   Name  Value                   TTL
CNAME  ai    agiitrade.github.io     300
```

Notes:

- Do not point `ai` to a URL with a path such as `agiitrade.github.io/Jefferson/ai-modernizer/`; DNS CNAME values cannot target paths.
- If the AI Modernizer Pages site is hosted in a different GitHub account or org, replace `agiitrade.github.io` with that org's Pages hostname (e.g., `yourusername.github.io`).
- Avoid duplicate or conflicting `A`, `AAAA`, or `CNAME` records for the same name.

---

## TTL strategy

| Phase | TTL to set | When |
|-------|-----------|------|
| Pre-cutover preparation | Lower existing records to 300s | 24–48 hours before cutover — ensures old value expires quickly if you need to roll back |
| During cutover | 300s | Set new records at 300s TTL |
| Post-verification (stable ≥1 hour) | 3600s | Raise TTL once `curl -vI` confirms HTTPS is working end-to-end |
| Long-term | 86400s | Optional: raise further once the setup has been stable for several days |

Setting TTL low before cutover is critical. If your existing records have a TTL of 86400s and you forgot to lower them, resolvers worldwide may cache the old value for up to 24 hours after you change it.

---

## Pre-flight checklist

Complete all items before making any DNS changes.

**For each Pages site (agii.ca and ai.agii.ca):**

- [ ] The target repo exists on GitHub with Pages enabled (Settings → Pages).
- [ ] The Pages source branch is set to the correct branch (e.g., `main`) and root `/` or `/docs`.
- [ ] The published root contains `index.html` with the correct page content.
- [ ] The published root contains exactly one `CNAME` file with the exact intended hostname (no trailing whitespace or newline issues).
- [ ] The repository Pages settings show "Your site is published at `https://<username>.github.io/<repo>`" before the custom domain is added.
- [ ] The custom domain field in Pages settings has been entered and saved (GitHub will run a DNS check).
- [ ] GitHub's DNS check has passed (green checkmark or no error shown in Pages settings).
- [ ] No conflicting custom domain is set on another Pages site in the same org/account.

**DNS provider:**

- [ ] You have logged in to the DNS provider and located the DNS management panel for `agii.ca`.
- [ ] Existing records for `@` (apex) and `ai` (subdomain) have been reviewed — no conflicts.
- [ ] TTL on any existing records has been lowered to 300s at least 24 hours before cutover.
- [ ] You have confirmed the GitHub Pages canonical hostname for the AI Modernizer repo (`agiitrade.github.io` or another org's Pages hostname).

---

## Provider-specific record entry

### Cloudflare

**Critical:** Set the proxy status to **DNS only** (grey cloud icon) for both records. If the orange cloud (proxied) is active, Cloudflare will intercept TLS and GitHub Pages will not be able to provision its Let's Encrypt certificate.

For apex `agii.ca` — add four A records:

| Type | Name | IPv4 address      | TTL  | Proxy status |
|------|------|-------------------|------|--------------|
| A    | @    | 185.199.108.153   | 300  | DNS only     |
| A    | @    | 185.199.109.153   | 300  | DNS only     |
| A    | @    | 185.199.110.153   | 300  | DNS only     |
| A    | @    | 185.199.111.153   | 300  | DNS only     |

Cloudflare also supports CNAME flattening at the apex — you can alternatively add a single CNAME for `@` pointing to `agiitrade.github.io` (DNS only). GitHub Pages accepts this.

For subdomain `ai.agii.ca`:

| Type  | Name | Target                  | TTL  | Proxy status |
|-------|------|-------------------------|------|--------------|
| CNAME | ai   | agiitrade.github.io     | 300  | DNS only     |

### GoDaddy

Navigate to **My Products → Domains → Manage → DNS**.

For apex `agii.ca` — click **Add** four times:

| Type | Name | Value             | TTL         |
|------|------|-------------------|-------------|
| A    | @    | 185.199.108.153   | 300 seconds |
| A    | @    | 185.199.109.153   | 300 seconds |
| A    | @    | 185.199.110.153   | 300 seconds |
| A    | @    | 185.199.111.153   | 300 seconds |

For subdomain `ai.agii.ca`:

| Type  | Name | Value                   | TTL         |
|-------|------|-------------------------|-------------|
| CNAME | ai   | agiitrade.github.io     | 300 seconds |

GoDaddy requires a trailing period on CNAME values in some UI versions. If the form rejects `agiitrade.github.io`, try `agiitrade.github.io.`.

### Namecheap

Navigate to **Dashboard → Domain List → Manage → Advanced DNS**.

For apex `agii.ca` — click **Add New Record** four times with type A Record:

| Type     | Host | Value             | TTL        |
|----------|------|-------------------|------------|
| A Record | @    | 185.199.108.153   | 5 min (300)|
| A Record | @    | 185.199.109.153   | 5 min (300)|
| A Record | @    | 185.199.110.153   | 5 min (300)|
| A Record | @    | 185.199.111.153   | 5 min (300)|

For subdomain `ai.agii.ca`:

| Type         | Host | Value                   | TTL        |
|--------------|------|-------------------------|------------|
| CNAME Record | ai   | agiitrade.github.io     | 5 min (300)|

### Google Domains / Squarespace DNS

Google Domains was acquired by Squarespace in 2023; the DNS UI may appear as either brand depending on migration status.

Navigate to **DNS → Manage custom records → Create new record**.

For apex `agii.ca` — create four A records:

| Type | Host name | Data (IPv4)        | TTL |
|------|-----------|--------------------|-----|
| A    | (blank/@) | 185.199.108.153    | 300 |
| A    | (blank/@) | 185.199.109.153    | 300 |
| A    | (blank/@) | 185.199.110.153    | 300 |
| A    | (blank/@) | 185.199.111.153    | 300 |

For subdomain `ai.agii.ca`:

| Type  | Host name | Data                    | TTL |
|-------|-----------|-------------------------|-----|
| CNAME | ai        | agiitrade.github.io     | 300 |

Note: Squarespace/Google Domains may auto-append the root domain to the host name. Enter just `ai` (not `ai.agii.ca`) in the Host name field.

---

## HTTPS / "Enforce HTTPS" timing

GitHub Pages provisions a Let's Encrypt certificate automatically once DNS resolves correctly. Follow this sequence:

1. Set DNS records at the provider (TTL 300s).
2. Wait 5–15 minutes for DNS to propagate (verify with `dig +short agii.ca A`).
3. In the GitHub Pages settings, confirm the custom domain field shows no error and the DNS check is passing.
4. Wait a further 10–20 minutes for GitHub to provision the TLS certificate.
5. Once Pages settings show "Your certificate has been issued" or the HTTPS enforcement checkbox becomes clickable without a warning, enable **Enforce HTTPS**.

**Do not enable "Enforce HTTPS" before the certificate is issued.** Doing so while the certificate is pending will cause browsers to reject the site with a certificate error until provisioning completes. If you enabled it too early, uncheck it, wait for certificate issuance, then re-enable.

Total expected time from DNS change to HTTPS-enforced: 20–40 minutes with a 300s TTL and no propagation delays.

---

## Verification commands

Run these from a terminal after DNS records are set at the provider.

### Phase 1 — DNS propagation check

```bash
# Check A records for apex
dig +short agii.ca A

# Check AAAA records for apex (if IPv6 records added)
dig +short agii.ca AAAA

# Check CNAME for subdomain
dig +short ai.agii.ca CNAME

# Resolve subdomain to IP (should reach GitHub Pages IPs)
dig +short ai.agii.ca A

# Verbose dig to see TTL and authoritative server
dig agii.ca A
dig ai.agii.ca CNAME
```

Expected:
- `agii.ca A` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
- `ai.agii.ca CNAME` → `agiitrade.github.io.`
- `ai.agii.ca A` → one or more of the same GitHub Pages IPs

### Phase 2 — HTTP/HTTPS reachability check

```bash
# Verbose headers — check for HTTPS redirect and certificate
curl -vI https://agii.ca 2>&1 | head -40

# Follow redirects and print first 20 lines of response body
curl -L https://agii.ca | head -20

# Subdomain check
curl -vI https://ai.agii.ca 2>&1 | head -40
curl -L https://ai.agii.ca | head -20
```

Expected:
- `curl -vI` shows `HTTP/2 200` (or `301` → `200`).
- TLS handshake shows `subject: CN=agii.ca` (or a wildcard/SAN cert from GitHub Pages).
- Response body contains expected page content (`Agilitas Innovations` or `AI Modernizer`).

### Phase 3 — Certificate detail

```bash
# Print certificate subject and SAN fields
echo | openssl s_client -connect agii.ca:443 -servername agii.ca 2>/dev/null | openssl x509 -noout -subject -ext subjectAltName

echo | openssl s_client -connect ai.agii.ca:443 -servername ai.agii.ca 2>/dev/null | openssl x509 -noout -subject -ext subjectAltName
```

Expected: certificate SANs include `agii.ca` (and `www.agii.ca`) and `ai.agii.ca` respectively.

---

## Local verification before pushing artifacts

These commands verify only local files and repository state. They do not require live DNS or active servers.

```bash
# Run from workspace root
find active/deploy -name CNAME -print -exec sed -n '1,5p' {} \;
git -C active/deploy status --short -- DNS_SETUP_AGII.md ai-modernizer/CNAME
git -C active/deploy diff -- DNS_SETUP_AGII.md ai-modernizer/CNAME
```

If running from inside `active/deploy`:

```bash
find . -name CNAME -print -exec sed -n '1,5p' {} \;
git status --short
git diff
```

---

## Rollback procedure

If DNS cutover fails or the site does not come up correctly:

### Immediate rollback steps

1. Remove the new DNS records added for `agii.ca` (four A records, four AAAA records) and/or `ai.agii.ca` (CNAME `ai`).
2. If there were previous live DNS records, restore them exactly.
3. In the GitHub Pages repository settings, clear the custom domain field for the affected site.
4. Revert or remove the `CNAME` file from the Pages source branch if it was committed.
5. Commit and push the revert — GitHub Pages will de-provision the certificate for the removed domain within minutes.

### Expected timing after rollback

| What | Expected time |
|------|--------------|
| DNS record removal visible at provider | Immediate (UI) |
| Old TTL expires at resolvers (if TTL was 300s) | ≤5 minutes |
| Old TTL expires at resolvers (if TTL was 3600s or higher) | Up to 1 hour |
| GitHub Pages stops serving the domain | 5–10 minutes after Pages settings updated |
| Let's Encrypt certificate revocation/expiry | Not required — expired certificates are not actively revoked, but the domain will 404 once Pages de-provisions it |

### If a previous live site existed

If `agii.ca` was previously pointing to another host (e.g., a Squarespace site, another web host), restore those records and verify with `curl -L https://agii.ca` that the previous site responds before declaring the rollback complete.

### Re-run verification after rollback

Run the verification commands (Phase 1 and Phase 2 above) against the restored state to confirm the previous site is back and the new records are gone.

---

## GitHub Pages setup checklist (per site)

1. Confirm the published root contains the correct `index.html`.
2. Confirm the published root contains exactly one `CNAME` file with the intended hostname (no trailing whitespace, no extra lines).
3. Confirm the repository Pages settings show the expected custom domain.
4. Wait for GitHub's DNS check to pass (green in Pages settings, no TXT record error).
5. Wait for certificate issuance before enabling Enforce HTTPS.
6. Enable Enforce HTTPS after the certificate is shown as active.
7. Do not delete or overwrite Jefferson Pages settings unless intentionally migrating the existing site.

---

## Local artifacts prepared

- `active/deploy/DNS_SETUP_AGII.md`: this runbook.
- `active/deploy/ai-modernizer/CNAME`: local artifact containing `ai.agii.ca` for a future separate AI Modernizer Pages publish root.
- `active/deploy/DNS_QUICKREF.md`: one-page copy-paste quick reference for record values and verification commands.

No `active/deploy/CNAME` was created because the current deploy root is not a dedicated `agii.ca` site and changing it would risk disrupting the existing Jefferson Pages setup.

---

## Do not claim live until verified

Do not claim that `agii.ca` or `ai.agii.ca` is live until:

- DNS records have actually been changed at the provider.
- GitHub Pages settings show the custom domain is accepted with no error.
- The TLS certificate has been provisioned (Enforce HTTPS is clickable without a warning).
- `curl -vI https://agii.ca` returns `200` with a valid certificate.
- `curl -L https://agii.ca | head` shows the expected Agii landing page content.
- Same for `ai.agii.ca`.
