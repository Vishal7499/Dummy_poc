# Kotak POC Frontend - Dummy Data Version

This is a frontend-only version of the Kotak POC project with all backend dependencies removed and replaced with dummy data.

## Features

- Complete frontend application with dummy data
- No backend required - all API calls use local dummy data
- Ready for GitHub Pages deployment
- Login credentials:
  - Admin: `admin` / `admin123`
  - Staff: `staff` / `staff123`
  - User: `user` / `user123`
  - Manager: `manager` / `manager123`

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

## GitHub Pages Deployment

This project is configured for GitHub Pages deployment. The deployment happens automatically via GitHub Actions when you push to the `main` branch.

### Manual Deployment Steps

1. Build the project:
   ```bash
   npm run build
   ```

2. The `dist` folder contains the built files ready for deployment.

3. Enable GitHub Pages in your repository settings:
   - Go to Settings > Pages
   - Select source: "GitHub Actions"

## Project Structure

- `src/utils/dummyData.js` - All dummy data and API replacements
- `src/utils/api.js` - API functions that now use dummy data
- `src/Screens/` - All screen components
- `src/components/` - Reusable components
- `src/contexts/` - React contexts (Auth, Activity Tracker)

## Technologies Used

- React 19
- Vite
- Tailwind CSS
- React Router
- ApexCharts
- React Icons

## Notes

- All backend API calls have been replaced with dummy data
- Authentication is handled locally via localStorage
- All data is generated dynamically and randomly for demonstration purposes
