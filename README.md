# EWU NotesHub 

> **East West University — academic notes, shared freely..**
> A minimal academic notes-sharing platform — dark/light mode, glass UI, ZIP downloads.

---

## Project Structure

```
notown/
├── frontend/               ← All HTML, CSS, JS (open in browser)
│   ├── index.html          ← Home
│   ├── upload.html         ← Contribute notes
│   ├── download.html       ← Explore & download
│   ├── auth.html           ← Sign in / Create account
│   ├── dashboard.html      ← User dashboard
│   ├── reviews.html        ← Community reviews & feedback
│   └── assets/
│       ├── css/main.css    ← Design system (colors, components)
│       ├── fonts/          ← Funnel Display variable font
│       └── js/
│           ├── main.js     ← Shared: theme, API, icons, nav
│           ├── auth.js     ← Sign in / Sign up logic
│           ├── upload.js   ← Contribution form logic
│           ├── download.js ← Explore + ZIP download logic
│           ├── reviews.js  ← Reviews & complaints logic
│           └── dashboard.js← Dashboard: uploads + history
│
└── backend/                ← PHP API (place in htdocs)
    ├── api/
    │   ├── config.php      ← DB connection, helpers, CORS
    │   ├── auth.php        ← Register / Login / Logout / Me
    │   ├── courses.php     ← Departments & courses
    │   ├── notes.php       ← Upload / List / Download-ZIP / Delete
    │   └── reviews.php     ← Reviews & complaints
    ├── uploads/            ← Uploaded files (auto-created, writable)
    ├── schema.sql          ← Full MySQL schema + seed data
    └── .htaccess           ← Upload protection + PHP limits
```

---

## Setup with XAMPP + VS Code

### Step 1 — Copy to XAMPP

Copy the entire `notown` folder into your XAMPP `htdocs`:

```
C:\xampp\htdocs\notown\
```

So the paths become:
```
C:\xampp\htdocs\notown\frontend\index.html
C:\xampp\htdocs\notown\backend\api\config.php
```

### Step 2 — Start XAMPP

Open XAMPP Control Panel → Start **Apache** and **MySQL**.

### Step 3 — Import database

1. Go to `http://localhost/phpmyadmin`
2. Click **New** → name it `notown` → click **Create**
3. Click **Import** → choose `notown/backend/schema.sql` → click **Go**

### Step 4 — Configure DB credentials

Open `backend/api/config.php` in VS Code:

```php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');        // default XAMPP = no password
define('DB_NAME', 'notown');
```

### Step 5 — Open the site

```
http://localhost/notown/frontend/index.html
```

That's it. No Node, no npm, no build step required.

---

## Color Palette

| Token       | Light           | Dark            |
|-------------|-----------------|-----------------|
| Background  | `#EDEAE4`       | `#292D30`       |
| Foreground  | `#292D30`       | `#EDEAE4`       |
| Lime accent | `#B4F045`       | `#B4F045`       |
| Purple      | `#554BF9`       | `#554BF9`       |

## Font

**Funnel Display** (variable weight 100–900) — loaded locally from `assets/fonts/`.

---

## Authentication Rules

| Action                      | Guest | Signed in |
|-----------------------------|-------|-----------|
| Browse notes                | ✅    | ✅        |
| Download (≤2 courses)       | ✅    | ✅        |
| Download (3+ courses)       | ❌    | ✅        |
| Upload / contribute notes   | ❌    | ✅        |
| Write reviews               | ❌    | ✅        |
| Submit complaints           | ✅    | ✅        |
| Dashboard                   | ❌    | ✅        |

---

## Download as ZIP

Every download — single note or bulk — is delivered as a `.zip`:

- **Single note** → `NoteTitle.zip` (file + INFO.txt)
- **Bulk (multiple courses)** → `notown_YYYY-MM-DD.zip` with one folder per course + CONTENTS.txt per folder + root README.txt

---

## Troubleshooting

| Problem | Fix |
|---|---|
| API returns blank / 500 | Check `C:\xampp\apache\logs\error.log` |
| "Database connection failed" | Ensure MySQL is running; check DB_PASS is `''` |
| Uploads not saving | Make sure `backend/uploads/` folder exists and is not read-only |
| Font not loading | Confirm `FunnelDisplay.ttf` is in `frontend/assets/fonts/` |
| PHP version error | Use XAMPP with PHP 7.4+ |

---

*notown — DBMS project. Minimal. Functional. Yours.*
