# Test Script for Dual Dashboard Implementation

## Quick Start Guide

### 1. Start Backend (if not running)
```bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Start Frontend (in new terminal)
```bash
cd frontend
npm run dev
```

### 3. Access the Application

Open browser to: `http://localhost:5173`

---

## Test Scenarios

### Scenario 1: Investor Login
1. Go to `http://localhost:5173`
2. Login with:
   - Username: `demo`
   - Password: `demo123`
3. **Expected:** Redirect to `/dashboard` (Investor Dashboard)
4. **Verify:** Can access all investor features (ESG scores, news, chat, reports, custom lab)
5. **Try:** Navigate to `/admin` manually
6. **Expected:** Redirect back to `/dashboard`

### Scenario 2: Admin Login
1. Logout from investor account
2. Login with:
   - Username: `admin`
   - Password: `admin123`
3. **Expected:** Redirect to `/admin` (Admin Dashboard)
4. **Verify:** See 4 tabs (User Management, Data Management, System Monitoring, System Logs)
5. **Test Each Tab:**
   - User Management: Should see 2 users (demo, admin)
   - Data Management: Should see ESG data stats
   - System Monitoring: Should see metrics and system health
   - System Logs: Should see log entries
6. **Try:** Navigate to `/dashboard` manually
7. **Expected:** Redirect back to `/admin`

### Scenario 3: API Protection
Test admin endpoints with investor token (should fail):

```bash
# First, login as investor and get token
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"demo123"}'

# Try to access admin endpoint (should return 403)
curl http://localhost:8000/api/admin/users \
  -H "Authorization: Bearer <investor_token>"
```

### Scenario 4: User Deletion (Admin Only)
1. Login as admin
2. Go to User Management tab
3. Try to delete the "demo" user
4. **Expected:** Confirmation dialog appears
5. Confirm deletion
6. **Expected:** User removed from list
7. **Verify:** Logout and try to login as "demo" - should fail

---

## Troubleshooting

### Backend Issues

**Problem:** Backend not starting
```bash
# Solution: Check if port 8000 is in use
netstat -ano | findstr :8000

# Kill the process if needed
taskkill /PID <process_id> /F

# Restart backend
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Problem:** Import errors
```bash
# Solution: Reinstall dependencies
cd backend
pip install -r requirements.txt
```

### Frontend Issues

**Problem:** Frontend not starting
```bash
# Solution: Reinstall node modules
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Problem:** API connection errors
- Check backend is running on port 8000
- Check CORS settings in `backend/main.py`
- Verify `frontend/src/api.js` has correct base URL

### Authentication Issues

**Problem:** Can't login
- Check console for errors
- Verify credentials (demo/demo123 or admin/admin123)
- Clear localStorage: `localStorage.clear()` in browser console

**Problem:** Redirecting to wrong dashboard
- Clear localStorage
- Check role in localStorage: `localStorage.getItem('role')`
- Logout and login again

---

## Features Checklist

### Investor Dashboard ✅
- [x] ESG Scores Overview
- [x] Sector Insights
- [x] Investor View (Reports)
- [x] News & Sentiment Analysis
- [x] ESG Chat Assistant
- [x] Custom ESG Lab

### Admin Dashboard ✅
- [x] User Management
  - [x] View all users
  - [x] Delete users
  - [x] See user roles
- [x] Data Management
  - [x] View ESG statistics
  - [x] See company data
- [x] System Monitoring
  - [x] View metrics
  - [x] System health status
- [x] System Logs
  - [x] View logs
  - [x] Filter by level

### Security ✅
- [x] Role-based authentication
- [x] Protected routes (frontend)
- [x] Protected endpoints (backend)
- [x] JWT token validation
- [x] 403 errors for unauthorized access

---

## API Endpoints Reference

### Public Endpoints
- `POST /api/register` - Register new user
- `POST /api/login` - Login user
- `GET /api/companies` - Get all companies
- `GET /api/company/{name}` - Get company details
- `GET /api/sectors` - Get all sectors
- `GET /api/stats` - Get ESG statistics
- `POST /api/news` - Get news with sentiment
- `POST /api/chat` - ESG chat assistant
- `POST /api/report` - Generate PDF report

### Admin-Only Endpoints
- `GET /api/admin/users` - List all users
- `DELETE /api/admin/users/{username}` - Delete user
- `GET /api/admin/stats` - Admin statistics
- `GET /api/admin/system-logs` - System logs

---

## Success Criteria

✅ **Implementation Complete When:**
1. Both dashboards accessible with correct credentials
2. Role-based routing working (auto-redirect based on role)
3. Admin can access all admin features
4. Investor can access all investor features
5. Cross-role access blocked (investor can't access admin, vice versa)
6. API endpoints protected with role checks
7. UI/UX polished with animations
8. No console errors

---

## Demo Video Script

1. **Landing Page** - Show login form
2. **Investor Login** - Login as demo, show dashboard
3. **Investor Features** - Quickly show each tab
4. **Logout** - Logout from investor
5. **Admin Login** - Login as admin, show admin dashboard
6. **Admin Features** - Show all 4 admin tabs
7. **User Management** - Demonstrate user list
8. **Security** - Try to access /dashboard as admin (should redirect)
9. **Logout** - Complete demo

---

## Deployment Notes

### Environment Variables
```env
# Backend
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Frontend
VITE_API_BASE_URL=http://localhost:8000
```

### Production Checklist
- [ ] Change default admin password
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain
- [ ] Use production database (PostgreSQL)
- [ ] Set up proper logging
- [ ] Add rate limiting
- [ ] Enable monitoring/analytics

---

**Implementation Status:** ✅ COMPLETE
**Last Updated:** 2025-12-21
**Version:** 1.0.0
