from pathlib import Path

script = r'''#!/usr/bin/env bash
set -Eeuo pipefail

REPO="NicolasKheirallah/openCMA---Website"
DOMAIN="hanterill.com"
WWW_DOMAIN="www.hanterill.com"
PAGES_HOST="NicolasKheirallah.github.io"
GITHUB_API_VERSION="2022-11-28"

A_RECORDS=(
  "185.199.108.153"
  "185.199.109.153"
  "185.199.110.153"
  "185.199.111.153"
)

AAAA_RECORDS=(
  "2606:50c0:8000::153"
  "2606:50c0:8001::153"
  "2606:50c0:8002::153"
  "2606:50c0:8003::153"
)

MODE="${1:---configure}"

ok()   { printf '✓ %s\n' "$*"; }
warn() { printf '⚠ %s\n' "$*"; }
info() { printf '→ %s\n' "$*"; }
fail() { printf '✗ %s\n' "$*" >&2; exit 1; }

if [[ "$MODE" != "--configure" && "$MODE" != "--check" ]]; then
  echo "Usage: $0 [--configure|--check]"
  exit 2
fi

command -v gh >/dev/null 2>&1 ||
  fail "GitHub CLI (gh) is required. Install it, then run: gh auth login"

gh auth status >/dev/null 2>&1 ||
  fail "GitHub CLI is not authenticated. Run: gh auth login"

gh repo view "$REPO" >/dev/null 2>&1 ||
  fail "Cannot access $REPO with the current GitHub login."

ok "GitHub authentication and repository access"

configure_pages() {
  info "Checking GitHub Pages configuration"

  if gh api \
      -H "Accept: application/vnd.github+json" \
      -H "X-GitHub-Api-Version: $GITHUB_API_VERSION" \
      "repos/$REPO/pages" >/dev/null 2>&1; then
    ok "GitHub Pages is already enabled"
  else
    info "GitHub Pages is not enabled; enabling workflow-based Pages"

    gh api \
      --method POST \
      -H "Accept: application/vnd.github+json" \
      -H "X-GitHub-Api-Version: $GITHUB_API_VERSION" \
      "repos/$REPO/pages" \
      -f build_type=workflow >/dev/null ||
      fail "Could not enable GitHub Pages. Check your GitHub token permissions."

    ok "GitHub Pages enabled"
  fi

  info "Setting custom domain to $DOMAIN"

  gh api \
    --method PUT \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: $GITHUB_API_VERSION" \
    "repos/$REPO/pages" \
    -f cname="$DOMAIN" \
    -f build_type=workflow >/dev/null ||
    fail "Could not set the Pages custom domain. Check your GitHub token permissions."

  ok "Custom domain configured: $DOMAIN"
}

print_dns_instructions() {
cat <<EOF

Inleed DNS records
==================

Required apex records:

Type   Name   Value
A      @      ${A_RECORDS[0]}
A      @      ${A_RECORDS[1]}
A      @      ${A_RECORDS[2]}
A      @      ${A_RECORDS[3]}

Required www record:

Type   Name   Value
CNAME  www    $PAGES_HOST

Optional IPv6 records:

Type   Name   Value
AAAA   @      ${AAAA_RECORDS[0]}
AAAA   @      ${AAAA_RECORDS[1]}
AAAA   @      ${AAAA_RECORDS[2]}
AAAA   @      ${AAAA_RECORDS[3]}

Important:
- Remove old A/AAAA/ALIAS/ANAME records for @ that point elsewhere.
- Remove any existing www A/AAAA/CNAME record that conflicts with the CNAME above.
- Do not use a wildcard record such as *.hanterill.com for GitHub Pages.
- Keep $DOMAIN as the custom domain in GitHub Pages.
- With both apex and www DNS configured, GitHub Pages can redirect www to the apex domain.

After saving the DNS records in Inleed, run:

  ./scripts/setup-pages-domain.sh --check

EOF
}

check_dns() {
  echo
  info "Checking DNS"

  if ! command -v dig >/dev/null 2>&1; then
    warn "dig is not installed, so automatic DNS checks are skipped."
    return
  fi

  expected_a="$(printf '%s\n' "${A_RECORDS[@]}" | sort)"
  actual_a="$(dig +short A "$DOMAIN" | sed '/^$/d' | sort)"

  if [[ "$actual_a" == "$expected_a" ]]; then
    ok "A records for $DOMAIN are correct"
  else
    warn "A records for $DOMAIN do not yet exactly match GitHub Pages"
    echo "Expected:"
    printf '%s\n' "$expected_a" | sed 's/^/  /'
    echo "Current:"
    if [[ -n "$actual_a" ]]; then
      printf '%s\n' "$actual_a" | sed 's/^/  /'
    else
      echo "  <none>"
    fi
  fi

  expected_cname="${PAGES_HOST,,}"
  actual_cname="$(
    dig +short CNAME "$WWW_DOMAIN" |
      head -n1 |
      sed 's/\.$//' |
      tr '[:upper:]' '[:lower:]'
  )"

  if [[ "$actual_cname" == "$expected_cname" ]]; then
    ok "CNAME for $WWW_DOMAIN is correct"
  else
    warn "CNAME for $WWW_DOMAIN is not correct yet"
    echo "  Expected: $PAGES_HOST"
    echo "  Current:  ${actual_cname:-<none>}"
  fi

  actual_ns="$(dig +short NS "$DOMAIN" | sort)"

  if grep -qi 'inleed\.net' <<<"$actual_ns"; then
    ok "Domain is delegated to Inleed nameservers"
  else
    warn "Authoritative nameservers do not appear to be Inleed"
    printf '%s\n' "$actual_ns" | sed 's/^/  /'
  fi
}

check_pages() {
  echo
  info "Checking GitHub Pages state"

  pages_json="$(
    gh api \
      -H "Accept: application/vnd.github+json" \
      -H "X-GitHub-Api-Version: $GITHUB_API_VERSION" \
      "repos/$REPO/pages"
  )" || fail "Could not read GitHub Pages configuration"

  cname="$(printf '%s' "$pages_json" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("cname") or "")')"
  html_url="$(printf '%s' "$pages_json" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("html_url") or "")')"
  https_enforced="$(printf '%s' "$pages_json" | python3 -c 'import json,sys; print(str(json.load(sys.stdin).get("https_enforced", False)).lower())')"
  cert_state="$(printf '%s' "$pages_json" | python3 -c 'import json,sys; print((json.load(sys.stdin).get("https_certificate") or {}).get("state","unknown"))')"
  protected_state="$(printf '%s' "$pages_json" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("protected_domain_state") or "unknown")')"

  if [[ "$cname" == "$DOMAIN" ]]; then
    ok "GitHub Pages custom domain is $DOMAIN"
  else
    warn "GitHub Pages custom domain is '${cname:-<none>}'"
  fi

  [[ -n "$html_url" ]] && info "Pages URL: $html_url"
  info "Domain protection state: $protected_state"
  info "HTTPS certificate state: $cert_state"

  if [[ "$cert_state" == "approved" ]]; then
    if [[ "$https_enforced" == "true" ]]; then
      ok "HTTPS is enforced"
    else
      info "Certificate approved; enabling HTTPS enforcement"

      gh api \
        --method PUT \
        -H "Accept: application/vnd.github+json" \
        -H "X-GitHub-Api-Version: $GITHUB_API_VERSION" \
        "repos/$REPO/pages" \
        -F https_enforced=true >/dev/null &&
        ok "HTTPS enforcement enabled" ||
        warn "Could not enable HTTPS automatically. Enable 'Enforce HTTPS' under Settings > Pages."
    fi
  else
    warn "HTTPS is not ready yet. GitHub can issue the certificate after DNS is correct and propagated."
  fi
}

if [[ "$MODE" == "--configure" ]]; then
  configure_pages
  print_dns_instructions
fi

check_dns
check_pages

echo
info "Recommended security step: verify hanterill.com in GitHub's Pages domain verification settings."
info "Final expected URL: https://$DOMAIN"
'''

path = Path("/mnt/data/setup-pages-domain.sh")
path.write_text(script)
path.chmod(0o755)
print(path)
