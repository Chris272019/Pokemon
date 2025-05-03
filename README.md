# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Pokemon App Deployment Guide

This guide will help you deploy the Pokemon app's backend to Render and frontend to Netlify.

## Backend Deployment (Render)

1. Create a Render account at https://render.com
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - Name: `pokemon-backend` (or your preferred name)
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Select the branch to deploy (usually `main` or `master`)
5. Add the following environment variables:
   - `PORT`: `10000` (or any port number)
6. Click "Create Web Service"

## Frontend Deployment (Netlify)

1. Create a Netlify account at https://netlify.com
2. Click "Add new site" and select "Import an existing project"
3. Connect your GitHub repository
4. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `dist` (or your build output directory)
5. Add the following environment variables:
   - `VITE_API_URL`: `https://your-render-backend-url.onrender.com`
6. Click "Deploy site"

## Environment Variables

### Backend (Render)
- `PORT`: The port number for the server to listen on

### Frontend (Netlify)
- `VITE_API_URL`: The URL of your deployed backend service

## Post-Deployment

1. Update your frontend's API calls to use the new backend URL
2. Test the application to ensure everything is working correctly
3. Set up custom domains if needed (optional)

## Troubleshooting

- If the backend fails to start, check the logs in Render dashboard
- If the frontend can't connect to the backend, verify the `VITE_API_URL` is correct
- Ensure CORS is properly configured in the backend for the frontend domain
