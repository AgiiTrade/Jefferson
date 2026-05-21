# DNS Quick Reference — agii.ca + ai.agii.ca

Last updated: 2026-05-21 | Full runbook: DNS_SETUP_AGII.md

---

## Record values (copy-paste ready)

### agii.ca — four A records (apex)

```
Type   Name   Value              TTL
A      @      185.199.108.153    300
A      @      185.199.109.153    300
A      @      185.199.110.153    300
A      @      185.199.111.153    300
```

Optional IPv6 (AAAA):

```
Type   Name   Value                   TTL
AAAA   @      2606:50c0:8000::153     300
AAAA   @      2606:50c0:8001::153     300
AAAA   @      2606:50c0:8002::153     300
AAAA   @      2606:50c0:8003::153     300
```

### ai.agii.ca — one CNAME record (subdomain)

```
Type    Name   Value                  TTL
CNAME   ai     agiitrade.github.io    300
```

### CNAME file contents (for Pages repo roots)

```
agii.ca
```
_(in the root CNAME of the agii.ca Pages repo)_

```
ai.agii.ca
```
_(in the root CNAME of the AI Modernizer Pages repo — already at active/deploy/ai-modernizer/CNAME)_

---

## TTL cheat-sheet

| Phase                           | TTL   |
|---------------------------------|-------|
| Lower existing records before cutover (≥24 h ahead) | 300   |
| New records during cutover      | 300   |
| Raise after HTTPS confirmed     | 3600  |
| Long-term stable                | 86400 |

---

## Cloudflare gotcha

Set proxy status to **DNS only (grey cloud)** for all records.
Orange cloud (proxied) blocks GitHub Pages TLS certificate provisioning.

---

## Pre-flight (quick)

- [ ] Pages repo exists, source branch set, `index.html` at root
- [ ] `CNAME` file committed at Pages repo root with correct hostname
- [ ] Pages Settings → custom domain entered and saved
- [ ] GitHub DNS check passing (green / no error in Pages settings)
- [ ] No conflicting DNS records for `@` or `ai` at provider
- [ ] Existing record TTLs lowered to 300s at least 24 h before cutover

---

## Verification commands

```bash
# DNS propagation
dig +short agii.ca A
dig +short agii.ca AAAA
dig +short ai.agii.ca CNAME
dig +short ai.agii.ca A

# HTTP reachability
curl -vI https://agii.ca 2>&1 | head -40
curl -vI https://ai.agii.ca 2>&1 | head -40

# Follow redirects, check page content
curl -L https://agii.ca | head -20
curl -L https://ai.agii.ca | head -20

# Certificate detail
echo | openssl s_client -connect agii.ca:443 -servername agii.ca 2>/dev/null \
  | openssl x509 -noout -subject -ext subjectAltName

echo | openssl s_client -connect ai.agii.ca:443 -servername ai.agii.ca 2>/dev/null \
  | openssl x509 -noout -subject -ext subjectAltName
```

### Expected results

| Check | Expected |
|-------|---------|
| `dig +short agii.ca A` | `185.199.108.153` … (all four IPs) |
| `dig +short ai.agii.ca CNAME` | `agiitrade.github.io.` |
| `curl -vI https://agii.ca` | `HTTP/2 200`, cert CN includes `agii.ca` |
| `curl -vI https://ai.agii.ca` | `HTTP/2 200`, cert CN includes `ai.agii.ca` |
| Page body | Agii landing / AI Modernizer content |

---

## HTTPS timing

| Step | Wait |
|------|------|
| After setting DNS records | 5–15 min for propagation |
| After DNS resolves at GitHub | 10–20 min for cert provisioning |
| Enable "Enforce HTTPS" | Only after cert is shown active in Pages settings |
| Total expected | 20–40 min end-to-end |

---

## Rollback (quick)

1. Delete new A / CNAME records at DNS provider.
2. Restore previous records if any existed.
3. Clear custom domain in GitHub Pages settings.
4. Remove / revert `CNAME` file in Pages source branch, commit + push.
5. Wait ≤ TTL (≤5 min if TTL was 300s) then re-run `dig +short` to confirm.

---

_Do not claim live until `curl -vI` confirms HTTP 200 + valid cert on both domains._
