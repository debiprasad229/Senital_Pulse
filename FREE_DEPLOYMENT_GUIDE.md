# Free Deployment Guide for SentinelPulse

You can deploy SentinelPulse **100% completely free with zero credit card required**.

Because SentinelPulse is built as a self-contained Node.js / Express application that serves both the API and the interactive dashboard, it runs seamlessly on all major free cloud hosts.

---

## 🥇 Option 1: Render.com (Recommended — 2 Minutes, Zero Cost, No Card)

Render offers a permanent **Free Web Service** tier that supports Node.js applications with free HTTPS.

### Steps:
1. **Push your code to GitHub:**
   - Go to [github.com/new](https://github.com/new) and create a new repository named `sentinelpulse` (choose Public).
   - In your project terminal, link your repository and push:
     ```bash
     git branch -M main
     git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/sentinelpulse.git
     git push -u origin main
     ```

2. **Deploy on Render:**
   - Go to [render.com](https://render.com) and sign up with your GitHub account (No credit card needed).
   - Click **New +** > **Web Service**.
   - Select your `sentinelpulse` repository.
   - Configure the settings:
     - **Name:** `sentinelpulse` (or your preferred name)
     - **Runtime:** `Node`
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`
     - **Instance Type:** `Free` ($0/month)
   - Click **Deploy Web Service**.

Render will build and give you a live HTTPS URL:
👉 `https://sentinelpulse.onrender.com`

---

## 🥈 Option 2: Vercel (1 Minute, 100% Free Hobby Tier)

The repository already includes the pre-configured `vercel.json` file.

### Method A: Using GitHub
1. Push your repository to GitHub (same as Option 1, Step 1).
2. Go to [vercel.com](https://vercel.com) and log in with GitHub.
3. Click **Add New...** > **Project** and select your repository.
4. Click **Deploy**.

### Method B: Directly from your Terminal (No GitHub needed)
Run this command in your project folder:
```bash
npx vercel
```
- Follow the prompt (press Enter to accept default settings).
- Vercel will upload and immediately give you a live production URL:
  👉 `https://sentinelpulse-<your-team>.vercel.app`

---

## 🥉 Option 3: Instant Live Link for Demos (30 Seconds, No Sign-up)

If you need an immediate public HTTPS URL to show a judge or tester right now from your computer without deploying to the cloud:

1. Start your local server:
   ```bash
   npm start
   ```
2. In a second terminal window, run:
   ```bash
   npx localtunnel --port 3000
   ```
This instantly generates a public link (e.g. `https://quiet-river-42.loca.lt`) accessible from any browser on any phone or computer in the world!

