# Kakeibochan 🐾

A small **Progressive Web App** to manage your monthly budget, inspired by the Japanese
**Kakeibo** method. Everything is stored **locally in your browser** (no account, no server).

## What does it do?

- **Categories** – create spending categories, each with a *type*: **Survival**, **Charges** or **Leisure**.
- **Expenses** – add daily expenses with an *amount (€)*, a *date* and a *category*.
- **Dashboard** – monthly summary, totals per type, a monthly budget progress bar,
  a **week filter** (week 1 to 5 of the month) and a chart you can switch between **pie** and **columns**.
- **Weekly budget** – the monthly budget is split in 5 weeks (e.g. €1000 → €200 per week). Switch between **Monthly** and **Weekly** views to see what is left to spend.
- **Quick add** – a floating **+** button on every page opens the expense form instantly.
- **PDF report** – download a monthly report (summary, weekly budget, pie and column charts, expense list).
- **Responsive** – sidebar on desktop, bottom bar and bottom-sheet forms on mobile, tables turn into cards.
- **Category filter** – filter the Dashboard expense list by type or by category.
- **CSV import / export** – a dedicated *Import / Export* page: back up your data to a `.csv` file (opens in Excel, Google Sheets, Numbers), or import categories and expenses (merge or replace). An example file is available in the app.
- **Tables** – every page lists its items in a table with **Edit** and **Delete** buttons.
- **Manage** – full lists of categories and expenses.
- **Installable & offline** – works as an app on your phone or desktop.
- Metronic-inspired design (dark sidebar, clean white cards).

> Your data lives in the browser's `localStorage`. Clearing site data erases it, and it is
> not shared between devices.

## Receipt photos and sorting

- **Receipt photos (optional):** when adding or editing an expense, attach a photo of the receipt.
  The photo is resized and compressed in the browser, then stored in IndexedDB on this device.
  Expense data stays in localStorage, so photos never block saving expenses.
  Photos are deleted together with their expense, and they are **not** included in CSV exports.
- **Sorting:** expense lists can be sorted by newest, oldest, highest price or lowest price.
- **Filtering:** expense lists can be filtered by category or by type.

## Tech stack

Vite · React · vite-plugin-pwa · Recharts · jsPDF (PDF report)

## Project structure (MVC)

```
src/
  models/                 MODEL: data shape and business rules (pure functions)
    constants.js            Category types and chart colours
    categoryModel.js        Create / validate categories
    expenseModel.js         Create / validate expenses, filters, sorting, totals
    budgetModel.js          Weekly budget split (monthly budget / 5)
    csvModel.js             App data <-> CSV text, parsing, import rules
    storage.js              localStorage hook
  controllers/            CONTROLLER: hooks that connect models to views
    useBudgetController.js        Data + add / update / delete actions (incl. receipts)
    useExpenseListController.js   Category filter and sort order of an expense list
    useDashboardController.js     Period filters, budget figures, PDF download
    useManageController.js        Data for the Manage page
    useDataController.js          CSV export / import actions
    useToast.js                   Confirmation messages
  views/                  VIEW: what the user sees
    components/             Forms, tables, toolbar, modal, charts, budget card...
    pages/                  Dashboard, Manage, Import / Export
  services/               Browser-specific or heavy code
    receiptService.js       Receipt photos (IndexedDB) and image compression
    fileService.js          Save / read text files
    pdfReport.js            Monthly PDF report (loaded on demand)
  utils/format.js         Formatting and date helpers
  App.jsx                 Connects the controller to the views
  styles.css              Theme
```

## Run locally

Requirements: [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually http://localhost:5173).

To test the production build (including the PWA / service worker):

```bash
npm run build
npm run preview
```

## Deploy on GitHub Pages

1. Create a new repository on GitHub (for example `kakeibochan`) and push this project to the `main` branch:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/kakeibochan.git
   git push -u origin main
   ```
2. On GitHub, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. The workflow in `.github/workflows/deploy.yml` runs on every push to `main`.
   It builds the app with the correct base path (`/<repository-name>/`) and publishes it.
4. After a minute, your app is available at `https://<your-username>.github.io/kakeibochan/`.

### Notes

- The base path comes from the `VITE_BASE` environment variable (see `vite.config.js`).
  If you use a custom domain or a `<user>.github.io` repository, set it to `/`.
- To install the app: open the site in Chrome/Edge/Safari and use **Install** / **Add to Home Screen**.

## CSV format

One row per expense, with a header row:

```
Date,Name,Amount,Category,Type
2026-11-03,Weekly groceries,54.20,Groceries,Survival
,,,Cinema,Leisure
```

- `Type` (Survival, Charges, Leisure) is required the first time a category appears.
- A row with only a category creates an empty category.
- Dates: `2026-11-03` or `03/11/2026`. Amounts: `12.5` or `12,5`.
- Comma, semicolon or tab separators are detected automatically.
