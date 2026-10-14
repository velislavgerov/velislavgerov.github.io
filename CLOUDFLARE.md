# Cloudflare Pages migration

Project: `gerov-dev` in account `velislavgerov`.

- Staging/production alias: https://gerov-dev.pages.dev/
- Git source: `velislavgerov/velislavgerov.github.io`, production branch `master`.
- Build: `python3 scripts/build-site.py`; output: `dist`.
- Public asset allowlist excludes worker source, project notes, scripts and Git metadata.
- Automatic Git production deployments are enabled; no additional deployment token is stored in GitHub.
- Source deployment `907223d5-c59a-4dec-9589-21b61d68da6a` (`98727eee1b267ca7a3bcbd77a70e08d4f6225230`) succeeded on 14 October 2026. Production alias homepage matches repository bytes.

## Cutover pending

`gerov.dev` still uses Namecheap registrar nameservers and GitHub Pages A records. Root-domain Pages hosting requires a Cloudflare zone and nameserver delegation. Before switching, export the complete authoritative DNS inventory, including MX, TXT/DKIM/SPF/DMARC, verification, wildcard and subdomain records. DNS queries alone cannot enumerate the complete zone.

Copy and review the inventory, associate the root and www domains with this project, verify intended apex/www behavior and email/subdomain preservation, then change registrar nameservers and verify activation/TLS/routes. Do not guess missing records or change DNSSEC without inspecting its state. CINDY's separate pending cutover is not implied by this migration.

Keep the existing GitHub Pages deployment and DNS values for rollback until the custom domain is verified on Cloudflare. After a successful cutover, retire the legacy GitHub deployment workflow and update this record. Current migration preparation does not change domain delegation or mail delivery.
