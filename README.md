# Al-Azan Educational Complex — Professional Website + Admin Dashboard

## What is included
- Public bilingual-ready school website using the supplied Al-Azan branding and supplied brochure/source images.
- Secure session-based Admin Dashboard.
- Student records: add/edit/delete, student photo, admission no, father, class, section, DOB, B-Form/ID, parent phone, address, active/inactive status.
- Student search, class filtering and selection for SMS.
- Staff/teacher management.
- Class/section management.
- Announcements management.
- Gallery photo upload/delete.
- Website Editor for school name, contact information, about, vision, mission, objectives, facilities, future goals, admissions and chairman details.
- Website image manager for logo, chairman/principal and building photos.
- Bulk SMS endpoint with Twilio configuration.
- JSON file storage database stored locally in `data/school.db`.

## Run locally
1. Install Node.js 20+ LTS.
2. Extract this ZIP.
3. Open a terminal in the `alazan_site` folder.
4. Run `npm install`.
5. Copy `.env.example` to `.env` and set a strong `ADMIN_PASSWORD` and `SESSION_SECRET`.
6. Run `npm start`.
7. Open `http://localhost:3000`.
8. Admin dashboard: `http://localhost:3000/admin.html`.

## SMS
SMS is intentionally not enabled without credentials. Add these to `.env`:
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_NUMBER`

## Backup
For a complete backup, copy both `data/` and `uploads/` folders.

## Important source note
The supplied PDF is a scanned 12-page CamScanner document; the public site retains the brochure pages as image assets and uses the supplied school information already entered into the site. The admin editor allows future corrections/updates without editing source code.


## Windows note
This version does not require Python or a C/C++ build toolchain. Data is stored in `data/school-data.json`, so `npm install` can run on a normal Node.js Windows installation.
