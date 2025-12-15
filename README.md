# Mylar Bag Label Generator for Filament

This project generates printable labels for your 3D printer filament storage (Mylar bags).
Input a Bambu Store URL, and it will generate a clean, professional PDF with two labels per page, including the product image and name.

## Features

- **Automated Scraping**: Fetches product name and image from Bambu Store URLs.
- **Print Optimization**: Formatted specifically for Letter-sized paper (2 labels per page).
- **Premium UI**: Clean, dark-mode interface for easy interaction.

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Run Development Server**:
    ```bash
    npm run dev
    ```

3.  **Open in Browser**:
    Navigate to [http://localhost:3000](http://localhost:3000).

4.  **Usage**:
    - Paste a URL (e.g., `https://us.store.bambulab.com/products/pla-basic-filament?id=40475106640008`).
    - Click **Generate**.
    - Click **Print Labels** (or Ctrl+P / Cmd+P).
    - Ensure "Background graphics" is enabled in your print dialog if images don't appear.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Styling**: Native CSS (CSS Modules / Vanilla)
- **Scraping**: Cheerio

## Deployment

### Cloudflare Workers (Containers)

This project uses Cloudflare's [Container support](https://developers.cloudflare.com/workers/) (via Durable Objects) to run the Next.js application.

1.  **Prerequisites**:
    - Docker installed and running.
    - Cloudflare account with Workers paid plan (required for Containers/Durable Objects).

2.  **Deploy**:
    ```bash
    npx wrangler deploy
    ```
    This will:
    - Build the Docker image from `Dockerfile`.
    - Upload the image to Cloudflare.
    - Deploy the Worker and bind it to the Container.

3.  **Local Development**:
    To preview the containerized worker locally:
    ```bash
    npx wrangler dev
    ```
