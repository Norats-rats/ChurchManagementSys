const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();

// --- 1. MIDDLEWARE ---
app.use(express.json());

app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    "https://churchmanagementsys.pages.dev",
    "http://localhost:5173"
  ],
  credentials: true
}));

// --- 2. DATABASE CONNECTION ---
const mongoURI = process.env.MONGODB_URI; 

mongoose.connect(mongoURI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// --- 3. MODELS ---
const Member = mongoose.model('members', new mongoose.Schema({
  firstName: String,
  lastName: String,
  name: String, 
  email: { type: String, unique: true },
  password: { type: String },
  contact: String,
  address: String,
  category: { type: String, default: 'Member' }, 
  ministry: { type: String, default: 'None' },
  role: { type: String, default: 'Member' },
  status: { type: String, default: 'Active' },
  date: { type: Date, default: Date.now }
}));

const Event = mongoose.model('events', new mongoose.Schema({
  title: String,
  category: String, 
  date: String,     
  time: String,
  room: String,    
  expected: { type: Number, default: 0 },
  attendees: [{ type: String }], 
  type: String,     
  role: String      
}, { timestamps: true }));

const Attendance = mongoose.model('attendance', new mongoose.Schema({
  userId: { type: String, required: true },
  name: String, 
  service: String,
  date: String,
  time: String,
  status: { type: String, enum: ['Present', 'Late', 'Absent'], default: 'Present' }
}, { timestamps: true }));

const Prayer = mongoose.model('prayers', new mongoose.Schema({
  name: String,
  initial: String,
  text: String,
  tags: [String], 
  prayingCount: { type: Number, default: 0 },
  date: { type: Date, default: Date.now },
  status: { type: String, default: 'Active' }
}));

const Ministry = mongoose.model('Ministry', new mongoose.Schema({
  name: { type: String, required: true },
  leader: { type: String, required: true },
  members: { type: Number, default: 0 },
  schedule: { type: String, required: true },
  color: { type: String, default: "#2563eb" },
  growth: { type: String, default: "+0%" },
  status: { type: String, default: "Active" } 
}, { timestamps: true }));

const Transaction = mongoose.model('transactions', new mongoose.Schema({
  date: { type: Date, default: Date.now },
  description: { type: String, required: true },
  type: { type: String, enum: ['Income', 'Expense'], required: true },
  amount: { type: Number, required: true }
}, { timestamps: true }));

// --- 4. ROUTES ---

app.get('/', (req, res) => {
  res.send('Church Management API is Online and Running');
});

// AUTH ROUTES
app.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newMember = new Member({ firstName, lastName, email, password: hashedPassword });
    await newMember.save();
    res.status(201).json({ message: "User created" });
  } catch (err) {
    res.status(400).json({ error: "Email already exists" });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Member.findOne({ email });
    if (user && await bcrypt.compare(password, user.password)) {
      res.json({ success: true, role: user.role, user });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ error: "Login error" });
  }
});

// MINISTRY ROUTES
app.post('/api/ministries', async (req, res) => {
  try {
    const newMin = new Ministry(req.body);
    await newMin.save();
    res.status(201).json(newMin);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/api/ministries', async (req, res) => {
  try {
    const list = await Ministry.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/ministries/:id', async (req, res) => {
  try {
    const updated = await Ministry.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.json(updated);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/ministries/:id', async (req, res) => {
  try {
    await Ministry.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// FINANCE ROUTES
app.get('/api/finances', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1 });
    const totalIncome = transactions.filter(t => t.type === 'Income').reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'Expense').reduce((acc, curr) => acc + curr.amount, 0);
    res.json({
      transactions,
      stats: { totalIncome, totalExpenses, netBalance: totalIncome - totalExpenses, savingsFund: 245000 }
    });
  } catch (err) { res.status(500).json({ error: "Failed to fetch financial data" }); }
});

app.post('/api/finances', async (req, res) => {
  try {
    const newTransaction = new Transaction(req.body);
    await newTransaction.save();
    res.status(201).json(newTransaction);
  } catch (err) { res.status(400).json({ error: "Failed to save transaction" }); }
});

// MEMBER ROUTES
app.get('/api/members', async (req, res) => {
  try {
    const members = await Member.find().sort({ date: -1 });
    res.json(members);
  } catch (err) { res.status(500).json({ error: "Failed to fetch members" }); }
});

app.post('/api/members', async (req, res) => {
  try {
    const data = req.body;
    if (data.password) data.password = await bcrypt.hash(data.password, 10);
    const newMember = new Member(data);
    await newMember.save();
    res.status(201).json(newMember);
  } catch (err) { res.status(400).json({ error: "Failed to create record" }); }
});

app.put('/api/members/:id', async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.password && data.password.trim() !== "") {
      data.password = await bcrypt.hash(data.password, 10);
    } else { delete data.password; }
    const updated = await Member.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json(updated);
  } catch (err) { res.status(400).json({ error: "Failed to update record" }); }
});

app.delete('/api/members/:id', async (req, res) => {
  try {
    await Member.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) { res.status(500).json({ error: "Failed to delete" }); }
});

// ATTENDANCE & EVENTS
app.get('/api/attendance', async (req, res) => {
  try {
    const records = await Attendance.find().sort({ createdAt: -1 });
    res.json(records);
  } catch (err) { res.status(500).json({ error: "Failed to fetch attendance" }); }
});

app.post('/api/attendance', async (req, res) => {
  try {
    const newRecord = new Attendance(req.body);
    await newRecord.save();
    res.status(201).json(newRecord);
  } catch (err) { res.status(500).json({ error: "Internal Server Error" }); }
});

app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (err) { res.status(500).json({ error: "Error" }); }
});

// PRAYER ROUTES
app.get('/api/prayers', async (req, res) => {
  try {
    const prayers = await Prayer.find().sort({ date: -1 });
    res.json(prayers);
  } catch (err) { res.status(500).json({ error: "Error" }); }
});

app.post('/api/prayers', async (req, res) => {
  try {
    const { name, text, tags } = req.body;
    const initial = name ? name.split(' ').map(n => n[0]).join('') : "U";
    const newPrayer = new Prayer({ name, initial, text, tags });
    await newPrayer.save();
    res.status(201).json(newPrayer);
  } catch (err) { res.status(400).json({ error: "Error" }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));