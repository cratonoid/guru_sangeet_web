# Shree Guru Sangeet Vidyalaya — Website

A two-page static website. No build step, no dependencies — open `index.html` in a browser,
or upload the whole `site/` folder to any web host.

```
site/
├── index.html           Page 1 — home (all descriptive sections)
├── courses.html         Page 2 — course details
├── css/style.css
├── js/main.js
├── images/
├── apps-script/Code.gs  Google Sheets lead-form backend
└── README.md
```

## Before going live — three things to fill in

**1. Connect the lead form to Google Sheets** — see the section below. Until this is done the
form shows "The enquiry form is not connected yet" rather than losing the enquiry.

**2. Online Examination Portal link**

The portal button appears on both pages and currently points at `#` (nowhere). Search both
HTML files for `TODO` and replace the `href="#"` with the real portal URL:

```html
<a class="btn btn--gold btn--lg" href="#" target="_blank" rel="noopener">Online Examination Portal</a>
```

There are two occurrences — one in `index.html`, one in `courses.html`.

**3. Check the contact details**

Phone, email and address are taken from the content document and appear in the footer, the
contact section, the WhatsApp button and the form's error message. If any of them change,
search both HTML files for `9110490540` and for the email address.

The address that receives the "new lead" email alert is set separately, as `NOTIFY` in
`apps-script/Code.gs`.

---

## Connecting the lead form to Google Sheets

The form collects: **Student Name, Mobile, Email, Course, Previous Experience, Language of
Compositions Learnt**, and a **Course Type** radio (With Certification / Non-Certification).
Each submission becomes one row in a Google Sheet, and the institute gets an email alert.

### Step 1 — Create the sheet

Go to [sheets.new](https://sheets.new) and name it something like *Website Leads*. Leave it
empty; the script creates the tab and headings itself.

### Step 2 — Add the script

In that sheet: **Extensions → Apps Script**. Delete whatever is in `Code.gs`, then paste the
entire contents of `apps-script/Code.gs` from this folder. Save.

### Step 3 — Run `testSubmission` once

In the Apps Script toolbar, pick the `testSubmission` function and press **Run**. Google will
ask you to authorise it — choose your account, then *Advanced → Go to (project name)* →
**Allow**. The warning screen is expected: it appears because the script is yours and
unpublished, not because anything is wrong.

This creates the *Leads* tab, writes one test row, and sends a test email. Delete the test row
afterwards.

### Step 4 — Deploy it as a web app

**Deploy → New deployment**, and press the gear icon → **Web app**. Then:

| Setting | Value |
| --- | --- |
| Description | anything, e.g. `Lead form v1` |
| Execute as | **Me** |
| Who has access | **Anyone** |

> "Who has access" **must** be *Anyone* — not *Anyone with a Google account*. The website's
> visitors are not signed in to Google, and the latter setting will reject every submission.

Press **Deploy** and copy the **Web app URL**. It ends in `/exec`.

### Step 5 — Paste the URL into the site

Open `js/main.js` and put the URL on line 15:

```js
var LEAD_ENDPOINT = "https://script.google.com/macros/s/AKfyc.../exec";
```

That is the only change needed on the website side. Submit the form once to confirm a row
appears in the sheet.

### If you edit `Code.gs` later

A deployment is pinned to a fixed version of the code, so saving is not enough. Go to
**Deploy → Manage deployments**, press the pencil icon, set **Version** to *New version*, and
press **Deploy**. The URL stays the same.

### Troubleshooting

| What you see | Cause |
| --- | --- |
| "The enquiry form is not connected yet" | `LEAD_ENDPOINT` in `js/main.js` is still the placeholder. |
| Submissions fail with a network error | "Who has access" is not set to *Anyone*, or the URL is the `/dev` one instead of `/exec`. |
| Rows appear but no email arrives | Check `NOTIFY` in `Code.gs`, and the spam folder. Gmail allows roughly 100 script emails a day. |
| Nothing happens at all | Apps Script editor → **Executions** shows every call and its error. |

Opening the `/exec` URL directly in a browser should return
`{"result":"success","message":"..."}` — a quick way to confirm the deployment is live.

### Adding or removing a field later

Change it in two places, keeping the order the same:

1. `HEADERS` and `FIELDS` in `apps-script/Code.gs` — `FIELDS` holds the input `name` attributes,
   `HEADERS` the column titles they map to. `HEADERS` has one extra entry at the front for the
   timestamp, so `FIELDS[0]` lines up with `HEADERS[1]`.
2. The `<form id="lead-form">` block in **both** `index.html` and `courses.html`.

Then redeploy a new version as described above.

### Notes

- A hidden "honeypot" field catches most spam bots. It is invisible to people — don't remove it.
- The **Enquire for &lt;course&gt;** buttons on the courses page pre-select that course. A
  `?course=Tabla` URL parameter does the same, which is useful for ad links.
- If a submission ever fails, the form shows the institute's WhatsApp number and phone number so
  the enquiry is not simply lost.
- Leads are stored in your own Google account. Anyone you share the sheet with can read them, so
  share it only with people who should see students' contact details.

## Design

Colours are taken from the institute emblem — deep maroon `#6E1023`, temple gold `#C8952E`,
cream `#FDF8EF`, with a deep green `#123D2A` used for the examination portal callout. All
colours are defined once as custom properties at the top of `css/style.css`, so the whole
palette can be re-tuned from there.

Typography is Marcellus (headings) and Inter (body), loaded from Google Fonts with system
fallbacks, so the site still reads correctly offline.

The layout is responsive down to small phone widths, the navigation collapses to a menu button
below 880px, and `prefers-reduced-motion` is respected.

## Photographs

Images in `images/` are the institute's own photographs, renamed for clarity. They are the
original full-size files — running them through an image compressor (or converting to WebP)
before going live will noticeably speed up first load, particularly on mobile data.
