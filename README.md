# Alex Kersell — Portfolio Site

A project-focused portfolio site with a built-in content editor at `/admin` —
add projects, upload images, and create new pages without touching code.

## How it works

- The site itself is plain HTML/CSS/JS (`index.html`, `project.html`, `page.html`) —
  fast, no build step, works anywhere.
- Content lives in `content/site.json`, `content/projects.json`, and `content/pages.json`.
  The pages fetch these files at runtime and render them.
- `/admin` runs **Decap CMS** (free, open source), a form-based editor that edits
  those JSON files and uploads images for you, then commits the changes to your
  GitHub repo automatically. Netlify redeploys in under a minute after every save.

You will need two free accounts: **GitHub** and **Netlify**. Neither requires a
credit card for this.

## One-time setup (about 10 minutes)

1. **Create a GitHub repository.**
   Go to github.com → New repository → name it something like `my-portfolio` →
   keep it **Public** → Create.

2. **Upload these files to it.**
   On the repo page, click "Add file" → "Upload files", then drag in everything
   from this folder — keep the folder structure exactly as-is (`admin/`, `assets/`,
   `content/`, `images/`, plus the `.html` files and `netlify.toml`). Commit.

3. **Deploy to Netlify.**
   Go to netlify.com → sign up (use "Sign up with GitHub" to link them automatically)
   → "Add new site" → "Import an existing project" → choose your GitHub repo.
   Netlify will read `netlify.toml` and pick the right settings automatically —
   just click "Deploy". You'll get a live URL like `random-name-123.netlify.app`.

4. **Turn on the editor.**
   In your new Netlify site's dashboard:
   - Go to **Site configuration → Identity** → click "Enable Identity".
   - Under Identity **Registration**, set it to **Invite only** (so strangers can't sign up).
   - Scroll to **Services → Git Gateway** → click "Enable Git Gateway". This is what
     lets the editor save changes to your GitHub repo — no personal token needed.

5. **Invite yourself.**
   Go to the **Identity** tab (top of the site dashboard, next to Deploys) →
   "Invite users" → enter your own email → send.
   Check your inbox, click the invite link, and set a password.

6. **Log in and start editing.**
   Visit `your-site.netlify.app/admin`, log in with the email and password from
   step 5. You'll see three sections:
   - **Site Settings** — your name, tagline, contact info, links, resume upload.
   - **Projects** — add/edit/reorder project entries, each with a title, summary,
     cover image, tags, and a full write-up (with image gallery support).
   - **Pages** — add any additional page (a longer About, a blog post, whatever you
     want) with a toggle for whether it shows in the top navigation.

   Every change you click "Publish" on commits straight to GitHub and goes live
   within about a minute. No code, ever, from here on.

## Optional: a custom domain

Netlify → Site configuration → Domain management → Add a domain. The free
`*.netlify.app` address works fine on its own if you'd rather skip this.

## Local preview (optional, for testing before you deploy)

From this folder:
```
python3 -m http.server 8000
```
Then open `http://localhost:8000`. Note: `/admin` won't work locally since it
depends on Netlify Identity/Git Gateway — that part only works once deployed.

## Notes

- Images you upload through the editor are stored in `images/uploads/` in your
  repo and referenced automatically — nothing to configure.
- The "Full Description" / "Content" fields support basic markdown: `**bold**`,
  `*italics*`, `## Heading`, `### Subheading`, `- bullet lists`, and `[text](url)` links.
- Project and page URLs are built from the **Slug** field you set — keep slugs
  lowercase with dashes (e.g. `my-cool-project`), no spaces.
