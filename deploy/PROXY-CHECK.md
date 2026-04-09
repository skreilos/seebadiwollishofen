# Welche Proxy-Konfiguration passt?

Seebadi-Compose published standardmässig **`8081:80`** (Service-Name **`web`**).

## 1) Checks auf dem Server

```bash
# Seebadi läuft?
docker compose -f /opt/seebadiwollishofen/docker-compose.yml ps

# Antwortet die Site auf dem Host-Port?
curl -sI http://127.0.0.1:8081/
curl -sI http://127.0.0.1:8081/page/
```

Wenn hier **kein** `HTTP/1.1 200` kommt, zuerst Seebadi fixen — Proxy hilft nicht.

## 2) Wo läuft dein „Front“-Nginx?

### A) Nginx als **Systemdienst** auf dem Host

- In `deploy/nginx-reverse-proxy.example.conf`: **`proxy_pass http://127.0.0.1:8081;`**
- Konfig nach `/etc/nginx/sites-available/` (o. Ä.), Symlink nach `sites-enabled`, dann:
  `sudo nginx -t && sudo systemctl reload nginx`

### B) Nginx **in Docker** (eigener Container)

Der Container muss die **Host-IP** erreichen, auf der **8081** lauscht.

**Einfach:** Im Compose des Nginx-Containers:

```yaml
extra_hosts:
  - "host.docker.internal:host-gateway"
```

Dann in der Site-Config:

`proxy_pass http://host.docker.internal:8081;`

**Alternative Linux:** stattdessen `proxy_pass http://172.17.0.1:8081;` testen (Docker-Brücke — nicht überall identisch).

### C) Beide Stacks im **gleichen Docker-Netz**

1. Netz anlegen: `docker network create webproxy`
2. Seebadi-`docker-compose.yml` um `container_name` + Netz `webproxy` erweitern (siehe README oder Issue).
3. Den **gleichen** Nginx-Container an `webproxy` hängen.
4. `proxy_pass http://seebadiwollishofen-web:80;` (wenn `container_name` so gesetzt ist)

## 3) HTTPS

Wenn Port 80 mit Proxy klappt: Zertifikat für `seebadiwollishofen.ch` + `www` (Certbot, Caddy, Traefik, …) — danach `X-Forwarded-Proto` beibehalten, damit Links stimmen.

---

## nginx-proxy + acme-companion (Container `nginx-proxy` auf 80/443)

Wenn **nginxproxy/nginx-proxy** und **acme-companion** laufen (wie bei mehreren WordPress-Containern):

1. Netzwerk ermitteln, in dem `nginx-proxy` steckt:

   ```bash
   docker inspect nginx-proxy --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}}{{"\n"}}{{end}}'
   ```

2. Im Repo **`docker-compose.nginx-proxy.yml`** bei `networks.proxy.name` den Namen aus Schritt 1 eintragen (auf manchen Servern heisst er schlicht **`nginx-proxy`**), **`LETSENCRYPT_EMAIL`** setzen.

3. Seebadi neu starten:

   ```bash
   cd /opt/seebadiwollishofen
   docker compose -f docker-compose.yml -f docker-compose.nginx-proxy.yml up -d --build
   ```

4. DNS: **A-Record** für `seebadiwollishofen.ch` und `www` auf die Server-IP.

Der Companion beantragt das Zertifikat automatisch, sobald der Host per HTTP erreichbar ist.

---

## HTTPS funktioniert nicht (nginx-proxy + acme-companion)

**Ablauf:** Zuerst muss **HTTP (Port 80)** für die Domain funktionieren — dann erzeugt der Companion das Zertifikat und **nginx-proxy** schaltet **443** frei.

### Checkliste

1. **Umgebungsvariablen** am Seebadi-Container (nach `docker compose … up`):

   ```bash
   docker inspect seebadiwollishofen-web-1 --format '{{range .Config.Env}}{{println .}}{{end}}' | grep -E 'VIRTUAL|LETSENCRYPT'
   ```

   Es müssen u. a. stehen: `VIRTUAL_HOST`, `LETSENCRYPT_HOST` (gleiche Hosts, kommagetrennt), **`LETSENCRYPT_EMAIL`** mit einer **echten** E-Mail (in `docker-compose.nginx-proxy.yml` anpassen, Container neu erstellen).

2. **Logs Companion** (Fehler von Let’s Encrypt):

   ```bash
   docker logs letsencrypt-nginx-proxy-companion 2>&1 | tail -80
   ```

   Typisch: Rate-Limit, Challenge schlägt fehl, Domain stimmt nicht.

3. **DNS:** `seebadiwollishofen.ch` und ggf. `www` per **A-Record** auf die **Server-IP** (ohne dass ein anderer Proxy die Challenge blockiert). Bei **Cloudflare:** für die ACME-Challenge oft **„DNS only“** (graues Wolke-Symbol) statt „Proxied“ testen.

4. **Nach Änderungen** Companion und Proxy kurz neu anwerfen, dann 1–2 Minuten warten:

   ```bash
   docker restart letsencrypt-nginx-proxy-companion
   ```

5. **Prüfen:**

   ```bash
   curl -sI http://seebadiwollishofen.ch/
   curl -sI https://seebadiwollishofen.ch/
   ```

   Erst wenn **HTTP** sauber ist, liefert **HTTPS** ein gültiges Zertifikat.

### Hinweis

Der **Seebadi-Container** lauscht nur **intern auf 80** — TLS macht ausschliesslich **nginx-proxy** davor. SSL-Zertifikate in der Seebadi-`default.conf` sind dafür **nicht** nötig.
