# ZYNKY — Full Stack App (React + Express + MongoDB)

## โครงสร้างโฟลเดอร์

```
zynky/
├── frontend/                   ← React + Vite + Tailwind
│   ├── index.html              ← HTML entry (mount #root)
│   ├── vite.config.js          ← Dev server + proxy /api → backend
│   ├── tailwind.config.js
│   └── src/
│       ├── main.jsx            ← [1] จุดเริ่มต้น React ทั้งหมด
│       ├── App.jsx             ← [2] Layout + State-based routing
│       ├── index.css           ← Global styles + Tailwind
│       │
│       ├── context/
│       │   └── AppContext.jsx  ← [3] Global state (user, posts, loading)
│       │
│       ├── services/
│       │   ├── api.js          ← [4] axios instance + interceptors
│       │   ├── postService.js  ← [5] HTTP calls สำหรับ /api/posts
│       │   └── userService.js  ← [6] HTTP calls สำหรับ /api/users
│       │
│       ├── hooks/
│       │   └── usePosts.js     ← [7] Custom hooks (usePostList, useCreatePost)
│       │
│       ├── components/
│       │   ├── Navbar.jsx          ← Navigation bar
│       │   ├── PostCard.jsx        ← การ์ดโพสต์แต่ละชิ้น
│       │   ├── PostDetailModal.jsx ← Modal รายละเอียด
│       │   ├── CreatePostModal.jsx ← Modal สร้างโพสต์
│       │   ├── ChatPanel.jsx       ← Chat slide-in panel
│       │   ├── StarRating.jsx      ← ดาว rating
│       │   └── SkeletonCard.jsx    ← Loading placeholder
│       │
│       └── pages/
│           ├── SearchPage.jsx  ← หน้าค้นหา (Page 1)
│           └── ProfilePage.jsx ← หน้าโปรไฟล์ (Page 2)
│
└── backend/                    ← Express + Mongoose (MVC)
    ├── server.js               ← [A] Entry point: middleware + routes + DB
    ├── .env                    ← Environment variables
    ├── package.json
    │
    ├── routes/
    │   ├── postRoutes.js       ← [B] กำหนด endpoint + เรียก controller
    │   ├── userRoutes.js
    │   └── chatRoutes.js
    │
    ├── controllers/
    │   ├── PostController.js   ← [C] Logic: รับ req → เรียก model → ส่ง res
    │   └── UserController.js
    │
    ├── models/
    │   ├── Post.js             ← [D] Mongoose schema + validation
    │   └── User.js             ← bcrypt password hashing
    │
    └── middleware/
        └── authMiddleware.js   ← [E] JWT verify → req.user
```

---

## ลำดับการทำงาน (Data Flow)

### การดึงโพสต์ทั้งหมด

```
[Browser]
  ↓ React app โหลด
[main.jsx] render App ใน #root
  ↓
[AppProvider] สร้าง state ทั้งหมด (posts=[], loading=false)
  ↓
[SearchPage] mount → เรียก usePostList() hook
  ↓
[usePosts.js] useEffect → AppContext.fetchPosts()
  ↓
[AppContext.jsx] fetchPosts() → setLoading(true) → postService.getPosts()
  ↓
[postService.js] api.get('/posts')
  ↓
[api.js] axios interceptor แนบ JWT token → ส่ง HTTP GET http://localhost:5000/api/posts
  ↓ (ข้าม network)
[server.js] รับ request → ผ่าน cors middleware
  ↓
[postRoutes.js] GET / → เรียก getPosts controller
  ↓
[PostController.js] getPosts() → Post.find(query).populate('author')
  ↓
[Post.js (Model)] query MongoDB collection "posts"
  ↓
[MongoDB] ส่งข้อมูลกลับ
  ↓
[PostController] ส่ง res.json({ success: true, data: posts })
  ↓ (HTTP Response JSON)
[api.js] axios response interceptor
  ↓
[AppContext] setPosts(res.data.data) → setLoading(false)
  ↓
[SearchPage] re-render แสดง PostCard ทุกชิ้น ✅
```

### การสร้างโพสต์ใหม่ (ต้อง login)

```
[CreatePostModal] User กรอกฟอร์ม → กด Submit
  ↓
[SearchPage] onSubmit(formData) → createPost(data) hook
  ↓
[usePosts.js] useCreatePost → postService.createPost(data)
  ↓
[api.js] interceptor แนบ Authorization: Bearer <token>
  ↓ POST /api/posts + body JSON
[postRoutes.js] POST / → protect middleware → createPost controller
  ↓
[authMiddleware.js] jwt.verify(token) → req.user = user
  ↓
[PostController.js] createPost() → Post.create({ author: req.user.id, ...data })
  ↓
[MongoDB] บันทึกโพสต์ใหม่
  ↓
[PostController] ส่ง res.status(201).json({ success: true, data: post })
  ↓
[usePosts.js] success → fetchPosts() รีเฟรชรายการ → ปิด modal ✅
```

---

## วิธีรัน

### Prerequisites
- Node.js >= 18
- MongoDB (local หรือ MongoDB Atlas)

### 1. Backend

```bash
cd backend
npm install
# แก้ไข .env ตามความเหมาะสม
npm run dev     # รันบน http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev     # รันบน http://localhost:3000
```

### 3. ทดสอบ API

```bash
# Health check
curl http://localhost:5000/api/health

# ดึงโพสต์ทั้งหมด
curl http://localhost:5000/api/posts

# สมัครสมาชิก
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","username":"test","email":"test@test.com","password":"123456"}'
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/posts | ❌ | ดึงโพสต์ทั้งหมด (filter, search, pagination) |
| GET | /api/posts/:id | ❌ | ดึงโพสต์ตาม ID |
| POST | /api/posts | ✅ | สร้างโพสต์ใหม่ |
| PUT | /api/posts/:id | ✅ | แก้ไขโพสต์ |
| DELETE | /api/posts/:id | ✅ | ลบโพสต์ |
| POST | /api/posts/:id/like | ✅ | Toggle like |
| POST | /api/users/register | ❌ | สมัครสมาชิก |
| POST | /api/users/login | ❌ | เข้าสู่ระบบ |
| GET | /api/users/me | ✅ | ดูโปรไฟล์ตัวเอง |
| PUT | /api/users/me | ✅ | แก้ไขโปรไฟล์ |
| POST | /api/users/save/:postId | ✅ | Toggle บันทึกโพสต์ |
| GET | /api/chats | ✅ | ดูรายการ chat |
| GET | /api/chats/:id/messages | ✅ | ดูข้อความ |
| POST | /api/chats/:id/messages | ✅ | ส่งข้อความ |

✅ = ต้องส่ง `Authorization: Bearer <token>` ใน header

---

## MVC Pattern ในระบบนี้

| Layer | ไฟล์ | หน้าที่ |
|-------|------|---------|
| **Model** | `models/Post.js`, `models/User.js` | กำหนด schema, validation, query DB |
| **View** | `frontend/src/pages/`, `frontend/src/components/` | แสดงผล UI ใน React |
| **Controller** | `controllers/PostController.js`, `controllers/UserController.js` | Logic: รับ request → ประมวลผล → ส่ง response |
| **Router** | `routes/postRoutes.js`, `routes/userRoutes.js` | กำหนด URL → Controller mapping |
| **Middleware** | `middleware/authMiddleware.js` | ตรวจสอบ token ก่อนถึง Controller |
| **Context (FE)** | `context/AppContext.jsx` | Global state management ฝั่ง Frontend |
| **Service (FE)** | `services/api.js`, `services/postService.js` | HTTP calls + interceptors ฝั่ง Frontend |
