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

2. Im Repo **`docker-compose.nginx-proxy.yml`** den Platzhalter `REPLACE_WITH_NGINX_PROXY_NETWORK` durch diesen Namen ersetzen, **`LETSENCRYPT_EMAIL`** setzen.

3. Seebadi neu starten:

   ```bash
   cd /opt/seebadiwollishofen
   docker compose -f docker-compose.yml -f docker-compose.nginx-proxy.yml up -d --build
   ```

4. DNS: **A-Record** für `seebadiwollishofen.ch` und `www` auf die Server-IP.

Der Companion beantragt das Zertifikat automatisch, sobald der Host per HTTP erreichbar ist.
