# Deployment Guide for Stream Bingo (Vue Version)

This guide explains how to deploy the Stream Bingo Vue application to GitHub Pages.

## Prerequisites

- Node.js and npm installed on your computer
- Git installed on your computer
- A GitHub account
- The Stream Bingo Vue repository cloned to your local machine

## Deployment Steps

### 1. Install Dependencies

First, make sure you've installed all required dependencies:

```bash
npm install
```

This will install all required dependencies, including the `gh-pages` package that we use for deployment.

### 2. Build the Application

Build the application for production:

```bash
npm run build
```

This will create a `dist` folder with the compiled application.

### 3. Deploy to GitHub Pages

The project is already configured to deploy to GitHub Pages. Simply run:

```bash
npm run deploy
```

This script will:
1. Build the application
2. Push the built files to the `gh-pages` branch
3. Configure GitHub Pages to serve your site from this branch

### 4. Configure GitHub Pages

If this is your first deployment, you need to configure GitHub Pages:

1. Go to your GitHub repository
2. Click on "Settings"
3. Scroll down to the "GitHub Pages" section
4. Select "gh-pages" as the source branch
5. Click "Save"

Your site will be published at `https://yourusername.github.io/stream-bingo-vue/`

## Custom Domain (Optional)

If you want to use a custom domain:

1. In your GitHub repository settings, under "GitHub Pages", add your custom domain
2. Create a file called `CNAME` in the `public` folder with your domain name
3. Update the `publicPath` in `vue.config.js` to match your domain

## Troubleshooting

### 404 Errors After Deployment

If you get 404 errors when navigating your deployed application, it's because GitHub Pages doesn't support the HTML5 History Mode used by Vue Router. Two solutions:

1. Use hash mode for routing (update `src/router/index.js`):

   ```js
   const router = createRouter({
     history: createWebHashHistory(process.env.BASE_URL),
     routes
   })
   ```

2. Add a 404.html file that redirects to your index.html (already implemented in this project)

### Firebase Configuration

Make sure your Firebase project settings allow access from your GitHub Pages domain. Update your Firebase console settings:

1. Go to Firebase Console → Your project → Authentication → Sign-in method → Authorized domains
2. Add your GitHub Pages domain (`yourusername.github.io`) to the list

## Automatic Deployment with GitHub Actions

For continuous deployment, you can set up a GitHub Action. Create a file at `.github/workflows/deploy.yml` with:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ master ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2

      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy
        uses: JamesIves/github-pages-deploy-action@4.1.4
        with:
          branch: gh-pages
          folder: dist
```

This workflow will automatically deploy your application whenever you push to the master branch.
