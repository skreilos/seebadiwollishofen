# seebadiwollishofen.ch: One-Page Restaurant / Event-Location

Statische, **mobile-first** Website (Deutsch) für die **Seebadi Wollishofen**: Hero, Über uns, **PDF-Speisekarten**, **Öffnungszeiten**, Galerie, **Google Maps**, **Reservationsformular**.

Aufbau analog zu `../badiletzigraben-ch/` (gleiche HTML-Struktur, **eigenes CSS** und Farben). Texte und Fakten: `../Seebadiwollishofen Daten/INHALTE.md` (Referenz: [Wayback März 2016](https://web.archive.org/web/20160313133811/http://seebadiwollishofen.ch/)).

## Lokale Vorschau

```bash
cd seebadiwollishofen-ch
docker compose up --build
```

Öffnen: **http://localhost:8081/** (Teaser), **http://localhost:8081/page/** (volle Website). Port **8081**, damit parallel zu Letzigraben auf 8080 nichts kollidiert.

Ohne Docker: beliebiger statischer Server auf `public/`, z. B. `npx serve public`.

### Wartungsmodus (Teaser auf `/`, volle Seite auf `/page/`)

- **`public/index.html`** — nur Logo + Hinweis *«Unser Webauftritt wird gerade überarbeitet.»*
- **`public/page/index.html`** — bisherige One-Page-Website; `<base href="/"/>` lädt CSS/JS/Bilder weiter von `/assets/…`.
- **`robots.txt`** — `Disallow: /page/` damit Suchmaschinen die Vorschau nicht indexieren (bei Go-live Zeile entfernen).
- **Go-live:** Inhalt von `public/page/index.html` wieder als `public/index.html` legen (oder tauschen), `Disallow: /page/` entfernen, ggf. Redirect von `/page/` einrichten.

## PDF-Speisekarten

Dateien nach `public/assets/menus/` legen:

- `speisekarte.pdf`
- `getraenkekarte.pdf`

## Reservierungen

Das Formular öffnet ein **Mailto** mit allen Feldern. E-Mail in `public/assets/js/main.js` (`RESERVATION_EMAIL`).

## Deployment (Server: Git + Docker)

```bash
git clone <ihr-repo> /opt/seebadiwollishofen-ch
cd /opt/seebadiwollishofen-ch
docker compose up -d --build
```

**Reverse-Proxy (Domain → Container):** Siehe **`deploy/PROXY-CHECK.md`** (welcher `proxy_pass` passt) und **`deploy/nginx-reverse-proxy.example.conf`**. Standard-Port auf dem Host: **8081** (`8081:80` in `docker-compose.yml`).

## Anpassungen

| Was | Wo |
|-----|-----|
| Texte, Öffnungszeiten, Adresse | `public/page/index.html` (Teaser: `public/index.html`) |
| Farben, Schriften | `public/assets/css/styles.css` (`:root`) |
| Mail, Formularlogik | `public/assets/js/main.js` |
| Bilder | `public/assets/img/` (Quelle: `../Seebadiwollishofen Daten/fotos/`) |
| Impressum / Datenschutz | Footer in `public/page/index.html` |

## Sammelordner „Seebadiwollishofen Daten“

Unter `../Seebadiwollishofen Daten/` liegen **`fotos/`** und **`INHALTE.md`**. Im Export war nur ein grosses JPG sicher vorhanden; weitere Slider-Fotos stehen in `INHALTE.md`.

## Bilder übernehmen

```bash
cp "../Seebadiwollishofen Daten/fotos/"*.{jpg,JPG,png} public/assets/img/
# danach hero-1.jpg / gallery-*.jpg benennen oder in index.html anpassen
```

## Lizenz / Inhalt

Inhalte historisch; Betreiber muss Impressum, Datenschutz und aktuelle Angebote selbst pflegen und prüfen.
