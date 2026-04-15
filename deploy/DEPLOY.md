# Deployment Seebadi Wollishofen

Kurzanleitung für den **Produktionsserver** (Stand: typischer DigitalOcean-Ubuntu-Host mit **nginx-proxy** + **acme-companion**).

## Wo liegt das Projekt?

Auf dem Server liegt das Repository in:

```text
/opt/seebadiwollishofen
```

(Ordnername = Git-Clone. Abweichende Pfade nur nutzen, wenn du bewusst woanders geklont hast.)

## Voraussetzungen

- **Docker** und **Docker Compose** (Plugin `docker compose`) installiert.
- **`nginx-proxy`** läuft bereits; das Seebadi-Compose hängt mit Overlay an dessen **externem Netzwerk** (siehe `docker-compose.nginx-proxy.yml`, Netzname z. B. `nginx-proxy`).
- Git-Zugriff auf das Remote-Repository (SSH-Key auf dem Server).

## Deploy (Standard: mit nginx-proxy)

Im Projektordner auf dem Server:

```bash
cd /opt/seebadiwollishofen
git pull origin main
docker compose -f docker-compose.yml -f docker-compose.nginx-proxy.yml up -d --build
```

Ohne Proxy-Overlay (nur lokal / direkter Port **8081**):

```bash
cd /opt/seebadiwollishofen
git pull origin main
docker compose up -d --build
```

### Kurz prüfen

```bash
docker compose -f docker-compose.yml -f docker-compose.nginx-proxy.yml ps
curl -sI http://127.0.0.1:8081/page/ | head -n 5
curl -sI https://seebadiwollishofen.ch/page/ | head -n 5
```

Mehr zu Proxy, Ports und HTTPS: **`deploy/PROXY-CHECK.md`**.

---

## Anfrageformular (Formspark)

Die Website sendet Event-Anfragen **nicht** per Mailserver auf dem Linux-Host, sondern per **HTTPS** an den Dienst **Formspark**.

| Thema | Wo / was |
|--------|-----------|
| **Dienst** | [Formspark](https://formspark.io/) |
| **Technik** | `POST` als JSON an `https://submit-form.com/<FORM_ID>` (siehe [Formspark Setup](https://documentation.formspark.io/setup), [AJAX](https://documentation.formspark.io/examples/ajax.html)) |
| **Form-ID im Code** | `public/assets/js/main.js` → Variable **`FORMSPARK_FORM_ID`** (aktuell Form **„Badi“**: `jKYEytA9o`) |
| **Empfänger der Benachrichtigungen** | Im **Formspark-Dashboard** beim Formular einstellen (nicht nur im HTML): **`mail@kreilos.ch`** (Betrieb; Kundenkontakt bleibt `badiwollishofen@bluewin.ch` im Footer/JSON-LD) |
| **Fehler-Fallback im UI** | `public/assets/js/main.js` → **`FORM_ADMIN_EMAIL`** (`mail@kreilos.ch`), falls der Submit fehlschlägt |
| **Datenschutz-Text** | `public/page/index.html` → Abschnitt **6.3** / **7** (Formspark nennen) |

Nach Änderung an `main.js` lokal: Cache-Buster in `public/page/index.html` beim Script-Tag erhöhen (`main.js?v=…`), damit Browser die neue Datei laden.

### Erster Test

1. Formspark: Benachrichtigung auf `mail@kreilos.ch` prüfen.  
2. Auf `https://seebadiwollishofen.ch/page/` Abschnitt **Anlässe** → **Anfrage** ausfüllen und absenden.  
3. Eingang in Postfach und ggf. Formspark-Dashboard prüfen.

---

## Repo / Remote (Referenz)

- Remote typisch: `git@github.com:skreilos/seebadiwollishofen.git`  
- Branch: **`main`**

Erstinstallation auf dem Server (falls noch kein Clone):

```bash
cd /opt
git clone git@github.com:skreilos/seebadiwollishofen.git seebadiwollishofen
cd seebadiwollishofen
docker compose -f docker-compose.yml -f docker-compose.nginx-proxy.yml up -d --build
```

Passe `LETSENCRYPT_EMAIL` in `docker-compose.nginx-proxy.yml` an eine erreichbare Adresse an, falls noch nicht geschehen.
