import { useEffect, useState } from 'react';

const MemberForm = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState(""); 
    const [address, setAddress] = useState("");
    const [ministry, setMinistry] = useState("Worship Team");
    const [role, setRole] = useState("Member"); 
    
    const [searchQuery, setSearchQuery] = useState("");
    const [filterMinistry, setFilterMinistry] = useState("All Ministries");
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [allMembers, setAllMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/members');
            const data = await response.json();
            if (Array.isArray(data)) {
                setAllMembers(data);
            }
            setLoading(false);
        } catch (err) {
            console.error("Database connection failed:", err);
            setLoading(false);
        }
    };

    const handleAction = async () => {
        if (!firstName || !lastName || !email || (!isEditing && !password)) {
            return alert("Please fill in Names, Email, and Password");
        }

        const memberData = { 
            firstName, lastName, email, address, ministry, role,
            category: role === "Admin" ? "Admin" : "Member",
            ...(password && { password }) 
        };

        try {
            const url = isEditing ? `http://localhost:5000/api/members/${editId}` : 'http://localhost:5000/api/members';
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(memberData)
            });

            if (response.ok) {
                resetForm();
                fetchMembers();
            }
        } catch (err) {
            alert("Could not save to database.");
        }
    };

    const resetForm = () => {
        setFirstName(""); setLastName(""); setEmail(""); setPassword("");
        setAddress(""); setMinistry("Worship Team"); setRole("Member");
        setIsEditing(false); setEditId(null);
    };

    const toggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
        await fetch(`http://localhost:5000/api/members/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        fetchMembers();
    };

    const deleteMember = async (id) => {
        if (!window.confirm("Are you sure you want to permanently delete this user?")) return;
        await fetch(`http://localhost:5000/api/members/${id}`, { method: 'DELETE' });
        fetchMembers();
    };

    const startEdit = (member) => {
        setIsEditing(true);
        setEditId(member._id);
        setFirstName(member.firstName || "");
        setLastName(member.lastName || "");
        setEmail(member.email || "");
        setAddress(member.address || "");
        setMinistry(member.ministry || "Worship Team");
        setRole(member.role || "Member");
        setPassword(""); 
    };

    const filteredMembers = (allMembers || []).filter(m => {
        const fullName = `${m.firstName || ""} ${m.lastName || ""}`.toLowerCase();
        const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || (m.email || "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchesMinistry = filterMinistry === "All Ministries" || m.ministry === filterMinistry;
        return matchesSearch && matchesMinistry;
    });

  return (
    <div className="member-directory-container">
        <div className="directory-header">
            <h2>System User Management</h2>
            <p>Register members and assign administrative roles</p>
        </div>

        <div className="search-filter-container" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input type="text" placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
            <select value={filterMinistry} onChange={(e) => setFilterMinistry(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}>
                <option>All Ministries</option>
                <option>Worship Team</option>
                <option>Youth Ministry</option>
                <option>Children's Ministry</option>
                <option>Outreach</option>
                <option>General Staff</option>
                <option>None</option>
            </select>
        </div>

        <div className="quick-add-bar" style={{ display: 'flex', gap: '8px', background: '#fff', padding: '15px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #eee' }}>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First Name" />
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last Name" />
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
            <select value={role} onChange={(e) => setRole(e.target.value)} style={{ fontWeight: 'bold', color: '#2563eb' }}>
                <option value="Member">Member</option>
                <option value="Admin">Admin</option>
                <option value="Staff">Staff</option>
                <option value="Ministry Leader">Ministry Leader</option>
            </select>
            <button onClick={handleAction} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>
                {isEditing ? "Update Account" : "Create Account"}
            </button>
        </div>

        <table className="member-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                    <th>USER</th><th>ROLE</th><th>MINISTRY</th><th>STATUS</th><th>ACTIONS</th>
                </tr>
            </thead>
            <tbody>
                {filteredMembers.map((m) => (
                    <tr key={m._id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px 0' }}>{m.firstName} {m.lastName}</td>
                        <td>{m.role}</td>
                        <td>{m.ministry}</td>
                        <td><button onClick={() => toggleStatus(m._id, m.status)}>{m.status || "Active"}</button></td>
                        <td>
                            <button onClick={() => startEdit(m)}>✏️</button>
                            <button onClick={() => deleteMember(m._id)}>🗑️</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  );
}

export default MemberForm;