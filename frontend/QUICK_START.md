# Clinerva Researcher Dashboard - Quick Start Guide

## ⚡ Quick Setup (5 minutes)

### Step 1: Install Icon Library
```bash
cd frontend
npm install lucide-react
```

### Step 2: Update Your App Router
In your `App.jsx` or router file, add the Researcher page:

```jsx
import Researcher from './pages/Researcher';

// Add to your routes:
<Route path="/researcher" element={<Researcher />} />
```

### Step 3: Run the Development Server
```bash
npm run dev
```

### Step 4: Visit the Dashboard
Navigate to `http://localhost:5173/researcher` (or your dev server URL)

**That's it! The dashboard is now live with sample data.** ✨

---

## 🎨 Dashboard Overview

The dashboard has **5 main tabs**:

| Tab | Purpose | Key Features |
|-----|---------|--------------|
| **Overview** | Dashboard summary | Metrics cards, activity feed |
| **Dataset** | Data management | Upload, cleaning status, table |
| **Analysis** | Research metrics | Charts, performance, correlations |
| **Insights** | AI-generated findings | Smart insights, recommendations |
| **Reports** | Trial reports | Export PDF/CSV, share, findings |

---

## 🎯 Key Features at a Glance

### Sidebar Navigation
- 🏷️ Clinerva branding
- ➕ Create Trial button
- 📊 Running & Past Trials
- 🚪 Logout button

### Top Navigation
- 5 tabs for content switching
- 🔔 Notification bell
- 👤 User profile dropdown

### Overview Panel
- 4 metric cards (Active Trials, Datasets, Insights, Researchers)
- Recent activity timeline

### Dataset Panel
- Upload/Import buttons
- Data quality metrics
- Dataset preview table

### Analysis Panel
- Performance metrics (Accuracy, Precision, Recall)
- Trend visualization
- Correlation analysis

### Insights Panel
- AI-generated insights (5 samples)
- Color-coded by type
- Learn More buttons

### Reports Panel
- Trial report list
- Export options (PDF, CSV, Share)
- Report details and key findings

---

## 🎨 Color Scheme (Clinerva Palette)

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Dark | `#0F2854` | Sidebar background |
| Secondary Blue | `#1C4D8D` | Secondary elements |
| Accent Blue | `#4988C4` | Buttons, hover effects |
| Light Highlight | `#BDE8F5` | Light backgrounds |

---

## 📁 File Structure

```
frontend/src/
├── pages/
│   └── Researcher.jsx ← Main component
├── components/researcher/
│   ├── Sidebar.jsx
│   ├── Navbar.jsx
│   ├── panels/
│   │   ├── OverviewPanel.jsx
│   │   ├── DatasetPanel.jsx
│   │   ├── AnalysisPanel.jsx
│   │   ├── InsightsPanel.jsx
│   │   └── ReportsPanel.jsx
│   ├── DASHBOARD_GUIDE.md
│   ├── LAYOUT_GUIDE.md
│   └── CUSTOMIZATION_GUIDE.md
```

---

## 🛠️ Common Customizations

### 1. Change Colors
Find and replace in component files:
```jsx
// Old:
bg-[#0F2854]

// New:
bg-[#YOUR_COLOR]
```

### 2. Add a New Tab
```jsx
// In Researcher.jsx renderPanel():
case 'newtab':
  return <NewTabPanel />;

// In Navbar.jsx tabs array:
{ id: 'newtab', label: 'New Tab' }
```

### 3. Connect Real Data
```jsx
// In any panel component:
useEffect(() => {
  fetch('/api/data')
    .then(res => res.json())
    .then(data => setData(data));
}, []);
```

### 4. Add Search Bar
Add to Navbar component:
```jsx
<input 
  type="text" 
  placeholder="Search..."
  className="px-3 py-2 bg-gray-100 rounded-lg outline-none"
/>
```

### 5. Change Card Styling
```jsx
// From (with shadow):
className="...shadow-sm..."

// To (more prominent):
className="...shadow-lg hover:shadow-xl..."
```

---

## 📊 Sample Data Included

The dashboard comes with realistic sample data:

### Overview Tab
- 12 active trials
- 24 datasets loaded
- 156 AI insights
- 8 collaborating researchers

### Dataset Tab
- 3 sample datasets
- Data quality metrics
- Status indicators

### Analysis Tab
- 6-month trend data
- 4 correlation examples
- Performance metrics

### Insights Tab
- 5 different insight types
- Various impact levels

### Reports Tab
- 3 trial reports
- Report details and findings

---

## 🔌 API Integration Template

### Connect to Your Backend

```jsx
// Example: Update Overview metrics
import { useEffect, useState } from 'react';

const [data, setData] = useState({
  activeTrials: 0,
  datasetsLoaded: 0,
  aiInsights: 0,
  researchers: 0
});

useEffect(() => {
  const fetchMetrics = async () => {
    const res = await fetch('/api/researcher/metrics');
    const json = await res.json();
    setData(json);
  };
  
  fetchMetrics();
}, []);
```

### Required API Endpoints (Optional)

```
GET  /api/researcher/metrics         - Dashboard metrics
GET  /api/researcher/activity        - Recent activity
GET  /api/datasets                   - List datasets
POST /api/datasets/upload            - Upload dataset
GET  /api/analysis/metrics           - Analysis data
GET  /api/insights                   - AI insights
GET  /api/reports                    - Trial reports
POST /api/reports/:id/export/pdf     - Export PDF
POST /api/reports/:id/export/csv     - Export CSV
```

---

## 🚀 Keyboard Shortcuts (Optional)

You can add these later:

| Shortcut | Action |
|----------|--------|
| `Ctrl+O` | Go to Overview |
| `Ctrl+D` | Go to Dataset |
| `Ctrl+A` | Go to Analysis |
| `Ctrl+I` | Go to Insights |
| `Ctrl+R` | Go to Reports |
| `Ctrl+/` | Search |

---

## 🎯 Common Tasks

### Show/Hide Sidebar
The sidebar is always visible on desktop and can be hidden on mobile.

### Change User Name
In `Navbar.jsx`, find:
```jsx
<span className="text-sm font-medium text-gray-700">Dr. Jane Smith</span>
```
Replace with your user data.

### Update Metrics
In `OverviewPanel.jsx`, modify the `dashboardCards` array.

### Add New Activity
In `OverviewPanel.jsx`, add to the `recentActivity` array:
```jsx
{
  id: 5,
  type: 'custom',
  title: 'Your Title',
  description: 'Your Description',
  timestamp: '1 hour ago',
  icon: YourIcon,
}
```

---

## 📱 Responsive Behavior

| Device | Layout |
|--------|--------|
| Mobile (<768px) | Single column, stacked cards |
| Tablet (768-1024px) | 2-column layouts |
| Desktop (>1024px) | 4-column layouts, fixed sidebar |

---

## 🐛 Troubleshooting

### Dashboard not showing?
- ✅ Ensure `npm install lucide-react` was run
- ✅ Check that route is added to your router
- ✅ Verify TailwindCSS is configured

### Icons missing?
- ✅ Run `npm install lucide-react`
- ✅ Check for npm errors in console
- ✅ Restart dev server

### Styles not applying?
- ✅ Ensure TailwindCSS is configured in `tailwind.config.js`
- ✅ Check that CSS file is imported in your app

### Tab switching not working?
- ✅ Check browser console for errors
- ✅ Verify state is being passed correctly

---

## 📚 Learn More

Read detailed documentation:
- 📖 `DASHBOARD_GUIDE.md` - Component documentation
- 🎨 `LAYOUT_GUIDE.md` - Visual layouts and structure
- ⚙️ `CUSTOMIZATION_GUIDE.md` - How to customize everything

---

## 🎉 Next Steps

1. ✅ **Setup** - Install lucide-react
2. ✅ **Display** - Add route to your app
3. ⏭️ **Customize** - Adjust colors and content
4. ⏭️ **Connect** - Add your API endpoints
5. ⏭️ **Deploy** - Push to production

---

## 💡 Pro Tips

1. **Use Chrome DevTools** - Inspect elements to understand structure
2. **Read the Customization Guide** - Has 15+ real examples
3. **Keep Components Small** - Easy to maintain and update
4. **Use TailwindCSS** - All styling is utility classes
5. **Test All Tabs** - Each has different layout patterns

---

## 📞 Support

If you have questions:
1. Check the documentation files
2. Review the customization examples
3. Check the component comments in code
4. Refer to TailwindCSS documentation

---

## ✨ Quick Win: Custom Task

Try this simple customization now:

**Change the sidebar background color:**

In `Sidebar.jsx`, find:
```jsx
<div className="w-64 bg-[#0F2854] text-white...">
```

Change `#0F2854` to any color, for example:
```jsx
<div className="w-64 bg-[#1a365d] text-white...">
```

Save and see the color change instantly! 🎨

---

## 🏁 You're Ready!

Your Clinerva Researcher Dashboard is ready to use. Navigate to the dashboard page and start exploring! 

**Happy coding! 🚀**

---

## Quick Links

- Main Component: `frontend/src/pages/Researcher.jsx`
- Components Folder: `frontend/src/components/researcher/`
- Full Guide: `RESEARCHER_DASHBOARD_SUMMARY.md`
- Customization: `CUSTOMIZATION_GUIDE.md`
- Layouts: `LAYOUT_GUIDE.md`
