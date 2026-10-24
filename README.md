# Classes

A one-page tracker for private classes: log each class with **+**, mark payments, see who owes what.

- `index.html` — the app. Works offline; data is saved on the device.
- `Code.gs` — Google Apps Script that turns a Google Sheet into the shared database.

Live: https://andresinp.github.io/classes/

## Connecting the Google Sheet

1. Open the sheet → **Extensions → Apps Script**, replace the editor contents with `Code.gs`, Save.
2. **Deploy → New deployment → Web app** · Execute as: **Me** · Who has access: **Anyone**. Authorize.
3. Copy the web app URL (ends in `/exec`).
4. In the app, tap **Google Sheet** at the bottom, paste the URL, **Save**. Do this once on each device.
   Or open `https://andresinp.github.io/classes/#sheet=<web app URL>` once on the device — the app
   saves the URL and removes it from the address bar.

The sheet keeps the full data in a hidden `_data` tab and rewrites two readable tabs on every save:
`Classes` (one row per class) and `Summary` (one row per student). Edit in the app, not the sheet.

If you change `Code.gs`, redeploy with **Deploy → Manage deployments → Edit → New version** so the
URL stays the same.

Note: anyone who has the `/exec` URL can read and overwrite the data, so don't post it anywhere.
