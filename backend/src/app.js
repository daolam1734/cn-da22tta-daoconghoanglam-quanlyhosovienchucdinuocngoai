const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const profileRoutes = require('./routes/profile');
const roleRoutes = require('./routes/role');
const unitRoutes = require('./routes/unit');
const recordRoutes = require('./routes/record');
const dashboardRoutes = require('./routes/dashboard');
const notificationRoutes = require('./routes/notification');
const regulationRoutes = require('./routes/regulation');
const reportRoutes = require('./routes/report');
const chatRoutes = require('./routes/chat');
const systemRoutes = require('./routes/system');
const categoryRoutes = require('./routes/category');
const workflowRoutes = require('./routes/workflow');
const path = require('path');

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: false, // Allow loading images from backend
}));
app.use(cors());
app.use(express.json());

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/regulations', regulationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/workflows', workflowRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

module.exports = app;