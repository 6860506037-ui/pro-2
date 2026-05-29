const express = require('express');
const mariadb = require('mariadb');
const app = express();

app.use(express.json());

// สร้าง Connection Pool ไปยังฐานข้อมูล MariaDB
const pool = mariadb.createPool({
     host: 'localhost', 
     user: 'root', 
     password: 'your_secure_password',
     database: 'coworking_db',
     connectionLimit: 10
});

// Middleware ป้องกันความปลอดภัย เช็คค่าโทเค็นจาก Header
function authenticateToken(req, res, next) {
    const authToken = req.headers['x-spacecube-auth'];
    if (!authToken || authToken !== 'ExpectedSecretTokenWS2026') {
        return res.status(401).json({ error: 'สิทธิ์การเข้าถึงถูกปฏิเสธ (401 Unauthorized)' });
    }
    next();
}

// API จองเวลา โดยใช้ Database Checking เพื่อกันการจองซ้ำ
app.post('/api/bookings', authenticateToken, async (req, res) => {
    const { room_id, start_time, end_time, user_id } = req.body;

    if (!room_id || !start_time || !end_time || !user_id) {
        return res.status(400).json({ error: 'ข้อมูลสำหรับทำรายการจองไม่ครบถ้วน' });
    }

    let conn;
    try {
        conn = await pool.getConnection();
        
        // ตรวจสอบการทับซ้อนของช่วงเวลาจอง (Double-Booking Prevention Check)
        const overlapQuery = `
            SELECT id FROM bookings 
            WHERE room_id = ? 
              AND NOT (end_time <= ? OR start_time >= ?)
        `;
        const conflicts = await conn.query(overlapQuery, [room_id, start_time, end_time]);
        
        if (conflicts.length > 0) {
            // หากมีการทับซ้อน ให้ตอบกลับด้วย HTTP 409 Conflict เพื่อระบุว่าห้องไม่ว่างแล้ว
            return res.status(409).json({ error: 'ช่วงเวลาดังกล่าวถูกจองไว้เรียบร้อยแล้ว' });
        }

        // หากผ่าน ให้ทำการบันทึกข้อมูลการจองลงในฐานข้อมูล
        const insertQuery = `
            INSERT INTO bookings (room_id, start_time, end_time, user_id) 
            VALUES (?, ?, ?, ?)
        `;
        const result = await conn.query(insertQuery, [room_id, start_time, end_time, user_id]);
        
        res.status(201).json({ 
            message: 'ดำเนินการจองพื้นที่สำเร็จ', 
            bookingId: Number(result.insertId) 
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการประมวลผลเซิร์ฟเวอร์ภายใน' });
    } finally {
        if (conn) conn.release(); // คืนการเชื่อมต่อสู่ Pool เสมอ
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Smart Co-Working Server running on port ${PORT}`));
