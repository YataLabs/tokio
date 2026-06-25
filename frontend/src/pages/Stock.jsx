import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Loader2,
  Minus,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import client from "../api/client";
import NumberInput from "../components/NumberInput";
import { getItemImageUrl } from "../utils/itemImage";
import { useToast } from "../context/ToastContext";
import ConfirmModal from "../components/ConfirmModal";
import { SkeletonBlock } from "../components/Skeleton";

const emptyForm = { name: "", sku: "", price: "", stock: "", category: "", image_url: "" };
const PAGE_SIZE = 12;


function formatPrice(value) {
  return value.toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
}

export default function Stock() {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef(null);

  async function loadItems() {
    setLoading(true);
    const res = await client.get("/items");
    setItems(res.data);
    setLoading(false);
  }

  useEffect(() => {
    (async () => {
      const res = await client.get("/items");
      setItems(res.data);
      setLoading(false);
    })();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleImageSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await client.post("/upload-image", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((prev) => ({ ...prev, image_url: res.data.url }));
    } catch {
      showToast("Failed to upload image", "error");
    } finally {
      setImageUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const payload = {
      name: form.name,
      sku: form.sku || null,
      price: parseFloat(form.price) || 0,
      stock: parseInt(form.stock) || 0,
      category: form.category || null,
      image_url: form.image_url || null,
    };
    try {
      if (editingId) {
        await client.put(`/items/${editingId}`, payload);
        showToast("Item updated successfully", "success");
      } else {
        await client.post("/items", payload);
        showToast("Item added successfully", "success");
      }
      setForm(emptyForm);
      setEditingId(null);
      setShowFormModal(false);
      loadItems();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to save item");
    }
  }

  function openAddModal() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowFormModal(true);
  }

  function startEdit(item) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      sku: item.sku || "",
      price: String(item.price),
      stock: String(item.stock),
      category: item.category || "",
      image_url: item.image_url || "",
    });
    setError("");
    setShowFormModal(true);
  }

  function closeFormModal() {
    setShowFormModal(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  function requestDelete(item) {
    setDeleteTarget(item);
  }

  async function confirmDelete() {
    const item = deleteTarget;
    setDeleteTarget(null);
    try {
      await client.delete(`/items/${item.id}`);
      showToast(`"${item.name}" deleted`, "success");
      loadItems();
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to delete item", "error");
    }
  }

  async function adjustStock(id, delta) {
    try {
      await client.post(`/items/${id}/adjust-stock`, { delta });
      loadItems();
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to adjust stock", "error");
    }
  }

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.sku || "").toLowerCase().includes(q) ||
        (item.category || "").toLowerCase().includes(q)
    );
  }, [items, search]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filteredItems.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const lowStockCount = items.filter((i) => i.stock <= 5).length;
  const totalValue = items.reduce((sum, i) => sum + i.price * i.stock, 0);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-tokio-text">Manage Stock</h1>
          <p className="text-sm text-tokio-muted mt-0.5">{items.length} items · {lowStockCount > 0 ? `${lowStockCount} low stock` : "all stocked"}</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 px-4 py-2.5 text-sm font-semibold transition shadow-lg shadow-blue-500/20"
        >
          <Plus size={16} />
          Add Item
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-tokio-panel rounded-2xl border border-tokio-border shadow-sm p-4">
          <div className="text-xs font-medium text-tokio-muted uppercase tracking-wider mb-1">Total Items</div>
          <div className="text-2xl font-bold text-tokio-text">{items.length}</div>
        </div>
        <div className={`rounded-2xl border shadow-sm p-4 ${lowStockCount > 0 ? "bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30" : "bg-tokio-panel border-tokio-border"}`}>
          <div className={`text-xs font-medium uppercase tracking-wider mb-1 ${lowStockCount > 0 ? "text-red-400" : "text-tokio-muted"}`}>Low Stock</div>
          <div className={`text-2xl font-bold ${lowStockCount > 0 ? "text-red-600" : "text-tokio-text"}`}>{lowStockCount}</div>
        </div>
        <div className="bg-tokio-panel rounded-2xl border border-tokio-border shadow-sm p-4">
          <div className="text-xs font-medium text-tokio-muted uppercase tracking-wider mb-1">Inventory Value</div>
          <div className="text-2xl font-bold text-tokio-text text-ellipsis overflow-hidden whitespace-nowrap">{formatPrice(totalValue)}</div>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-tokio-muted" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, SKU, or category..."
            className="w-full rounded-xl bg-tokio-panel border border-tokio-border text-tokio-text placeholder:text-tokio-muted pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 shadow-sm"
          />
        </div>
        <span className="text-sm text-tokio-muted shrink-0">
          {filteredItems.length} result{filteredItems.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Card grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonBlock key={i} className="h-52" />)}
        </div>
      ) : pageItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-tokio-muted">
          <Package size={48} className="mb-3 opacity-30" />
          <p className="text-base font-medium">
            {items.length === 0 ? "No items yet. Add your first item." : "No items match your search."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {pageItems.map((item) => {
            const isLow = item.stock <= 5;
            return (
              <div key={item.id} className="bg-tokio-panel rounded-2xl border border-tokio-border shadow-sm overflow-hidden flex flex-col">
                {/* Image area */}
                <div className="relative h-28 overflow-hidden">
                  <img
                    src={getItemImageUrl(item)}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <span className={`absolute top-3 left-3 text-[11px] font-semibold px-2.5 py-1 rounded-lg ${
                    isLow ? "bg-red-600 text-white" : "bg-tokio-navy text-white"
                  }`}>
                    {isLow && <AlertTriangle size={10} className="inline mr-1 -mt-0.5" />}
                    {item.stock} Stock
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="font-bold text-tokio-text text-sm leading-tight mb-0.5">{item.name}</div>
                  <div className="flex items-center gap-2 mb-3">
                    {item.category && (
                      <span className="text-[11px] bg-tokio-bg text-tokio-muted px-2 py-0.5 rounded-full font-medium">{item.category}</span>
                    )}
                    {item.sku && (
                      <span className="text-[11px] text-tokio-muted">{item.sku}</span>
                    )}
                  </div>
                  <div className="text-base font-bold text-tokio-text mb-4">{formatPrice(item.price)}</div>

                  {/* Stock adjust row */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <button
                      onClick={() => adjustStock(item.id, -1)}
                      disabled={item.stock <= 0}
                      className="w-8 h-8 rounded-lg border border-tokio-border text-tokio-text flex items-center justify-center hover:bg-tokio-bg disabled:opacity-40 transition"
                      title="Remove 1"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="flex-1 text-center text-sm font-bold text-tokio-text">{item.stock}</span>
                    <button
                      onClick={() => adjustStock(item.id, 1)}
                      className="w-8 h-8 rounded-lg border border-tokio-border text-tokio-text flex items-center justify-center hover:bg-tokio-bg transition"
                      title="Add 1"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  {/* Edit / Delete */}
                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => startEdit(item)}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-tokio-border py-2 text-xs font-medium text-tokio-muted hover:bg-tokio-bg hover:text-tokio-text transition"
                    >
                      <Pencil size={13} />
                      Edit
                    </button>
                    <button
                      onClick={() => requestDelete(item)}
                      className="flex items-center justify-center w-9 h-9 rounded-xl border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-900/10 dark:hover:bg-red-900/20 transition"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && filteredItems.length > PAGE_SIZE && (
        <div className="flex items-center justify-between mt-6 text-sm">
          <span className="text-tokio-muted">Page {currentPage} of {totalPages}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="flex items-center gap-1 rounded-xl border border-tokio-border bg-tokio-panel text-tokio-muted px-3.5 py-2 hover:bg-tokio-bg transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              <ChevronLeft size={15} />
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="flex items-center gap-1 rounded-xl border border-tokio-border bg-tokio-panel text-tokio-muted px-3.5 py-2 hover:bg-tokio-bg transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              Next
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-tokio-panel border border-tokio-border shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-tokio-text">{editingId ? "Update Item" : "Add Item"}</h2>
              <button onClick={closeFormModal} className="rounded-xl border border-tokio-border p-1.5 text-tokio-muted hover:bg-tokio-bg transition">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image upload */}
              <div>
                <label className="block text-xs font-medium text-tokio-muted mb-1.5">Product Image</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={imageUploading}
                  className="w-full h-28 rounded-xl border-2 border-dashed border-tokio-border hover:border-blue-400 bg-tokio-bg flex flex-col items-center justify-center gap-2 transition overflow-hidden relative"
                >
                  {imageUploading ? (
                    <Loader2 size={24} className="animate-spin text-tokio-muted" />
                  ) : form.image_url ? (
                    <img
                      src={getItemImageUrl({ image_url: form.image_url, name: form.name, id: editingId })}
                      alt="preview"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <ImagePlus size={22} className="text-tokio-muted" />
                      <span className="text-xs text-tokio-muted">Click to upload image</span>
                    </>
                  )}
                  {form.image_url && !imageUploading && (
                    <span className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-lg">
                      Click to change
                    </span>
                  )}
                </button>
                {form.image_url && (
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, image_url: "" }))}
                    className="mt-1.5 text-xs text-red-500 hover:text-red-600"
                  >
                    Remove image
                  </button>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-tokio-muted mb-1.5">Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl bg-tokio-bg border border-tokio-border text-tokio-text px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-tokio-muted mb-1.5">SKU</label>
                  <input
                    name="sku"
                    value={form.sku}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-tokio-bg border border-tokio-border text-tokio-text px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-tokio-muted mb-1.5">Category</label>
                  <input
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-tokio-bg border border-tokio-border text-tokio-text px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-tokio-muted mb-1.5">Price</label>
                  <NumberInput
                    value={form.price}
                    onChange={(v) => setForm({ ...form, price: v })}
                    required
                    className="w-full rounded-xl bg-tokio-bg border border-tokio-border text-tokio-text px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-tokio-muted mb-1.5">Stock</label>
                  <NumberInput
                    value={form.stock}
                    onChange={(v) => setForm({ ...form, stock: v })}
                    required
                    className="w-full rounded-xl bg-tokio-bg border border-tokio-border text-tokio-text px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                  />
                </div>
              </div>
              {error && (
                <p className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertTriangle size={16} className="shrink-0" />
                  {error}
                </p>
              )}
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={closeFormModal} className="flex-1 rounded-xl border border-tokio-border text-tokio-muted px-4 py-2.5 text-sm font-medium hover:bg-tokio-bg transition">
                  Cancel
                </button>
                <button type="submit" className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 px-4 py-2.5 text-sm font-semibold transition shadow-lg shadow-blue-500/20">
                  <Plus size={16} />
                  {editingId ? "Update Item" : "Add Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete item"
        message={deleteTarget ? `Are you sure you want to delete "${deleteTarget.name}"? This cannot be undone.` : ""}
        confirmLabel="Delete"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
