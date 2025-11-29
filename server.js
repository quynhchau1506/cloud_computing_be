require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');
const categoryUserRoutes = require('./routes/categoryUser.routes');
const categoryAdminRoutes = require('./routes/categoryAdmin.routes');
const authRoutes = require('./routes/auth.routes');
const errorHandler = require('./middleware/error');

const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL, // Vue dev server
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Environment variables
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/test_mongodb';

// MongoDB connection
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'news-api' });
});

// Routes
app.use('/user', userRoutes);
app.use('/user', categoryUserRoutes);
app.use('/admin', authRoutes);
app.use('/admin', adminRoutes);
app.use('/admin', categoryAdminRoutes);

// Error handler (keep at end)
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
