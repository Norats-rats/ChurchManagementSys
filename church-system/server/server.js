const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());


mongoose.connect('mongodb+srv://lancemanemail_db_user:KvK0MOxjl5EbIK12@church.bfa7div.mongodb.net/churchDB?retryWrites=true&w=majority')
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch(err => console.log("❌ Connection error:", err));

const MemberSchema = new mongoose.Schema({
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
});

const eventSchema = new mongoose.Schema({
  title: String,
  category: String, 
  date: String,     
  time: String,
  room: String,    
  expected: { type: Number, default: 0 },
  attendees: [{ type: String }], 
  type: String,     
  role: String      
}, { timestamps: true });

const AttendanceSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: String, 
  service: String,
  date: String,
  time: String,
  status: { type: String, enum: ['Present', 'Late', 'Absent'], default: 'Present' }
}, { timestamps: true });

const PrayerSchema = new mongoose.Schema({
  name: String,
  initial: String,
  text: String,
  tags: [String], 
  prayingCount: { type: Number, default: 0 },
  date: { type: Date, default: Date.now },
  status: { type: String, default: 'Active' }
});

const MinistrySchema = new mongoose.Schema({
  name: { type: String, required: true },
  leader: { type: String, required: true },
  members: { type: Number, default: 0 },
  schedule: { type: String, required: true },
  color: { type: String, default: "#2563eb" },
  growth: { type: String, default: "+0%" },
  status: { type: String, default: "Active" } 
}, { timestamps: true });

const TransactionSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  description: { type: String, required: true },
  type: { type: String, enum: ['Income', 'Expense'], required: true },
  amount: { type: Number, required: true }
}, { timestamps: true });



const Member = mongoose.model('members', MemberSchema);
const Event = mongoose.model('events', eventSchema);
const Attendance = mongoose.model('attendance', AttendanceSchema);
const Prayer = mongoose.model('prayers', PrayerSchema);
const Ministry = mongoose.model('Ministry', MinistrySchema);
const Transaction = mongoose.model('transactions', TransactionSchema);


app.post('/api/ministries', async (req, res) => {
  try {
    const newMin = new Ministry(req.body);
    await newMin.save();
    res.status(201).json(newMin);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/ministries', async (req, res) => {
  try {
    const list = await Ministry.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/ministries/:id', async (req, res) => {
  try {
    const updated = await Ministry.findByIdAndUpdate(
      req.params.id, 
      { $set: req.body }, 
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/ministries/:id', async (req, res) => {
  try {
    await Ministry.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



app.get('/api/finances', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1 });
    const totalIncome = transactions.filter(t => t.type === 'Income').reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'Expense').reduce((acc, curr) => acc + curr.amount, 0);

    res.json({
      transactions,
      stats: {
        totalIncome,
        totalExpenses,
        netBalance: totalIncome - totalExpenses,
        savingsFund: 245000 
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch financial data" });
  }
});

app.post('/api/finances', async (req, res) => {
  try {
    const newTransaction = new Transaction(req.body);
    await newTransaction.save();
    res.status(201).json(newTransaction);
  } catch (err) {
    res.status(400).json({ error: "Failed to save transaction" });
  }
});


app.get('/api/members', async (req, res) => {
  try {
    const members = await Member.find().sort({ date: -1 });
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch members" });
  }
});

app.post('/api/members', async (req, res) => {
  try {
    const data = req.body;
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    const newMember = new Member(data);
    await newMember.save();
    res.status(201).json(newMember);
  } catch (err) {
    res.status(400).json({ error: "Failed to create record. Email might already exist." });
  }
});

app.put('/api/members/:id', async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.password && data.password.trim() !== "") {
      data.password = await bcrypt.hash(data.password, 10);
    } else {
      delete data.password;
    }
    const updated = await Member.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: "Failed to update record" });
  }
});

app.patch('/api/members/:id', async (req, res) => {
  try {
    const updated = await Member.findByIdAndUpdate(
      req.params.id,
      { $set: { status: req.body.status } },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: "Failed to update status" });
  }
});

app.delete('/api/members/:id', async (req, res) => {
  try {
    await Member.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete" });
  }
});


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


app.get('/api/attendance', async (req, res) => {
  try {
    const list = await Attendance.find();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch attendance" });
  }
});

app.post('/api/attendance', async (req, res) => {
  try {
    const { userId, name, service, checkInTime, status } = req.body;
    
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();
    const existing = await Attendance.findOne({ 
      userId: String(userId),
      checkInTime: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    if (existing) {
      return res.status(400).json({ error: "You have already checked in for today." });
    }

    const newRecord = new Attendance({
      userId: String(userId),
      name,
      service,
      checkInTime: checkInTime || new Date().toISOString(),
      status: status || 'Present'
    });

    await newRecord.save();
    res.status(201).json(newRecord);
  } catch (err) {
    console.error("Attendance Server Error:", err);
    res.status(500).json({ error: "Internal Server Error during check-in" });
  }
});

app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

app.post('/api/events', async (req, res) => {
  try {
    const newEvent = new Event(req.body);
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (err) {
    res.status(400).json({ error: "Failed to create event" });
  }
});

app.put('/api/events/:id', async (req, res) => {
  try {
    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: "Failed to update event" });
  }
});

app.delete('/api/events/:id', async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete event" });
  }
});

app.patch('/api/events/:id/attend', async (req, res) => {
  try {
    const { userId } = req.body;
    const event = await Event.findById(req.params.id);
    
    const isAttending = event.attendees.includes(userId);
    
    if (isAttending) {
      event.attendees = event.attendees.filter(id => id !== userId);
      event.expected = Math.max(0, event.expected - 1);
    } else {
      event.attendees.push(userId);
      event.expected += 1;
    }
    
    await event.save();
    res.json(event);
  } catch (err) {
    res.status(400).json({ error: "Toggle failed" });
  }
});

app.get('/api/prayers', async (req, res) => {
  try {
    const prayers = await Prayer.find().sort({ date: -1 });
    res.json(prayers);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch prayers" });
  }
});

app.post('/api/prayers', async (req, res) => {
  try {
    const { name, text, tags } = req.body;
    const initial = name ? name.split(' ').map(n => n[0]).join('') : "U";
    const newPrayer = new Prayer({ name, initial, text, tags });
    await newPrayer.save();
    res.status(201).json(newPrayer);
  } catch (err) {
    res.status(400).json({ error: "Could not submit prayer" });
  }
});

app.patch('/api/prayers/:id/pray', async (req, res) => {
  try {
    const updated = await Prayer.findByIdAndUpdate(
      req.params.id,
      { $inc: { prayingCount: 1 } }, 
      { new: true } 
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: "Failed to update count" });
  }
});

app.patch('/api/prayers/:id/answer', async (req, res) => {
  try {
    const updatedPrayer = await Prayer.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { status: 'Answered' } },
      { 
        returnDocument: 'after' 
      }
    );

    if (!updatedPrayer) {
      return res.status(404).json({ message: "Prayer not found" });
    }

    res.json(updatedPrayer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

app.listen(5000, () => console.log("🚀 Server running on port 5000"));