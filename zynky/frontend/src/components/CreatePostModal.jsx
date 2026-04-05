// ============================================================
//  src/components/CreatePostModal.jsx  — VIEW (Form Modal)
//
//  หน้าที่: ฟอร์มสร้างโพสต์ใหม่
//  Props: onClose, onSubmit (async function)
//  ใครเรียกใช้: SearchPage
//
//  ลำดับการทำงาน:
//    User กรอกฟอร์ม → กด Submit
//    → onSubmit(formData) [ส่งไปจาก SearchPage]
//    → useCreatePost() hook → postService.createPost()
//    → POST /api/posts → PostController.createPost()
//    → บันทึกใน MongoDB → ส่ง response กลับ → ปิด modal
// ============================================================

import { useState } from 'react';

const CATEGORIES = [
  { value: 'travel', label: 'ท่องเที่ยว' },
  { value: 'photography', label: 'ถ่ายภาพ' },
  { value: 'cooking', label: 'อาหาร' },
  { value: 'fitness', label: 'ฟิตเนส' },
  { value: 'entertainment', label: 'ความบันเทิง' },
  { value: 'wellness', label: 'สุขภาพ' },
  { value: 'other', label: 'อื่นๆ' },
];

const CreatePostModal = ({ onClose, onSubmit }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    priceType: 'ต่อคน',
    category: 'travel',
    tags: '',
    available: '',
    time: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.price) {
      setError('กรุณากรอกข้อมูลที่จำเป็น (ชื่อ, รายละเอียด, ราคา)');
      return;
    }
    setSubmitting(true);
    setError('');
    const ok = await onSubmit({
      ...form,
      price: Number(form.price),
      // แปลง tags string "ท่องเที่ยว,เชียงใหม่" → array ["ท่องเที่ยว", "เชียงใหม่"]
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    });
    if (ok) onClose();
    else setError('ไม่สามารถสร้างโพสต์ได้ กรุณาลองใหม่');
    setSubmitting(false);
  };

  const inputClass = "w-full bg-gray-700 border border-gray-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-teal-400 transition-colors";

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl max-w-lg w-full p-6 border border-teal-500/30 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-teal-300">
            <i className="fas fa-plus-circle mr-2" />สร้างโพสต์ใหม่
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <i className="fas fa-times text-xl" />
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-300 text-sm px-3 py-2 rounded-xl mb-4">
            <i className="fas fa-exclamation-triangle mr-1" />{error}
          </div>
        )}

        {/* Form fields */}
        <div className="space-y-4">
          <div>
            <label className="text-gray-400 text-xs mb-1 block">ชื่อบริการ *</label>
            <input className={inputClass} value={form.title} onChange={set('title')} placeholder="เช่น Travel Deal - ทัวร์เชียงใหม่" />
          </div>

          <div>
            <label className="text-gray-400 text-xs mb-1 block">รายละเอียด *</label>
            <textarea className={inputClass} rows={3} value={form.description} onChange={set('description')} placeholder="อธิบายบริการของคุณ..." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-400 text-xs mb-1 block">ราคา (บาท) *</label>
              <input className={inputClass} type="number" value={form.price} onChange={set('price')} placeholder="0" />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">หน่วย</label>
              <input className={inputClass} value={form.priceType} onChange={set('priceType')} placeholder="ต่อคน" />
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-xs mb-1 block">หมวดหมู่</label>
            <select className={inputClass} value={form.category} onChange={set('category')}>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          <div>
            <label className="text-gray-400 text-xs mb-1 block">แท็ก (คั่นด้วย ,)</label>
            <input className={inputClass} value={form.tags} onChange={set('tags')} placeholder="ท่องเที่ยว,เชียงใหม่,ทัวร์" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-400 text-xs mb-1 block">วันที่ว่าง</label>
              <input className={inputClass} value={form.available} onChange={set('available')} placeholder="Mon, Aug 17" />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">เวลา</label>
              <input className={inputClass} value={form.time} onChange={set('time')} placeholder="09:00 - 21:00" />
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full mt-5 py-3 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-white font-bold rounded-xl transition-all"
        >
          {submitting
            ? <><i className="fas fa-spinner fa-spin mr-2" />กำลังสร้าง...</>
            : <><i className="fas fa-paper-plane mr-2" />โพสต์เลย</>}
        </button>
      </div>
    </div>
  );
};

export default CreatePostModal;
