"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  FolderOpen,
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Tag,
  Search,
  Check,
  Sparkles,
  ChevronRight,
  Info,
  Layers,
  FileText,
  Receipt,
  GraduationCap,
  Plane,
  Home,
  Smartphone,
  SlidersHorizontal,
  Share2,
  Copy,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import { formatRupiah, formatIndonesianDate } from "@/lib/formatters";
import {
  createPlanAction,
  updatePlanAction,
  deletePlanAction,
  createPlanItemAction,
  updatePlanItemAction,
  deletePlanItemAction,
} from "@/app/actions/planActions";

export interface FormattedPlanItem {
  id: string;
  planId: string;
  title: string;
  category: string;
  estimated: number;
  actual: number;
  status: "UNPAID" | "PARTIAL" | "PAID";
  notes?: string | null;
}

export interface FormattedPlan {
  id: string;
  title: string;
  description?: string | null;
  targetDate?: string | null;
  status: "PLANNING" | "ONGOING" | "COMPLETED";
  targetBudget?: number | null;
  items: FormattedPlanItem[];
  createdAt: string;
}

interface PlanManagerProps {
  initialPlans: FormattedPlan[];
}

export interface PlanTemplateItem {
  title: string;
  category: string;
  estimated: number;
  notes?: string;
}

export interface PlanTemplate {
  id: string;
  name: string;
  iconName: "Receipt" | "GraduationCap" | "Plane" | "Home" | "Smartphone";
  keywords: string[];
  description: string;
  categories: string[];
  items: PlanTemplateItem[];
}

export const PLAN_TEMPLATES: Record<string, PlanTemplate> = {
  reimburse: {
    id: "reimburse",
    name: "Reimburse / Klaim Biaya",
    iconName: "Receipt",
    keywords: ["reimburse", "klaim", "rembes", "talangan", "penggantian", "papah", "ayah", "mama", "ibu", "kantor"],
    description: "Item talangan atau klaim biaya seperti bensin, makan, belanja, dan operasional",
    categories: [
      "Transport & Bensin",
      "Konsumsi & Makan",
      "Belanja Kebutuhan",
      "Kesehatan & Obat",
      "Operasional",
      "Lain-lain",
    ],
    items: [
      { title: "Bensin & Tol / Transportasi", category: "Transport & Bensin", estimated: 150000, notes: "Nota SPBU / struk tol" },
      { title: "Makan & Minum", category: "Konsumsi & Makan", estimated: 100000, notes: "Struk resto / cafe" },
      { title: "Belanja Barang / Perlengkapan", category: "Belanja Kebutuhan", estimated: 250000, notes: "Struk belanja toko / supermarket" },
      { title: "Obat & Apotek / Medis", category: "Kesehatan & Obat", estimated: 75000, notes: "Struk apotek" },
      { title: "Parkir & Karcis Retribusi", category: "Transport & Bensin", estimated: 20000, notes: "Karcis parkir resmi" },
      { title: "Servis Kendaraan / Cuci Mobil", category: "Operasional", estimated: 150000, notes: "Kuitansi bengkel / cuci" },
    ],
  },
  wisuda: {
    id: "wisuda",
    name: "Persiapan Wisuda",
    iconName: "GraduationCap",
    keywords: ["wisuda", "yudisium", "kelulusan", "sidang", "skripsi", "kuliah"],
    description: "Kebutuhan kebaya, makeup MUA, foto studio, dan syukuran wisuda",
    categories: [
      "Busana & Makeup",
      "Dokumentasi & Foto",
      "Administrasi & Kampus",
      "Akomodasi & Transport",
      "Konsumsi & Syukuran",
      "Buket & Hadiah",
      "Lain-lain",
    ],
    items: [
      { title: "Pendaftaran & Wisuda Kampus", category: "Administrasi & Kampus", estimated: 750000, notes: "Biaya toga & ijazah resmi kampus" },
      { title: "Sewa Kebaya / Jas / Toga", category: "Busana & Makeup", estimated: 350000, notes: "Fitting seminggu sebelum acara" },
      { title: "Makeup & Hairdo / Hijabdo", category: "Busana & Makeup", estimated: 350000, notes: "Booking MUA subuh hari H" },
      { title: "Foto Studio Wisuda & Cetak Bingkai", category: "Dokumentasi & Foto", estimated: 450000, notes: "Paket foto wisudawan + keluarga" },
      { title: "Buket Bunga / Plakat / Selempang", category: "Buket & Hadiah", estimated: 150000, notes: "Selempang gelar & buket foto" },
      { title: "Konsumsi / Makan Syukuran Keluarga", category: "Konsumsi & Syukuran", estimated: 500000, notes: "Makan siang setelah prosesi wisuda" },
    ],
  },
  liburan: {
    id: "liburan",
    name: "Liburan & Travelling",
    iconName: "Plane",
    keywords: ["liburan", "jalan", "trip", "travel", "healing", "vacation", "wisata"],
    description: "Tiket transportasi PP, penginapan hotel, kuliner, dan oleh-oleh",
    categories: [
      "Transportasi",
      "Penginapan & Hotel",
      "Kuliner & Makan",
      "Tiket Wisata",
      "Belanja & Oleh-oleh",
      "Lain-lain",
    ],
    items: [
      { title: "Tiket Transportasi (Pesawat/Kereta)", category: "Transportasi", estimated: 800000, notes: "Tiket PP" },
      { title: "Penginapan / Hotel / Villa", category: "Penginapan & Hotel", estimated: 700000, notes: "Sewa kamar" },
      { title: "Kuliner & Makan Harian", category: "Kuliner & Makan", estimated: 400000, notes: "Makan selama trip" },
      { title: "Tiket Masuk Objek Wisata", category: "Tiket Wisata", estimated: 250000, notes: "Tiket masuk & wahana" },
      { title: "Oleh-oleh & Souvenir Khas", category: "Belanja & Oleh-oleh", estimated: 200000, notes: "Bawaan untuk keluarga/teman" },
    ],
  },
  pindahan: {
    id: "pindahan",
    name: "Pindahan Kost / Kontrakan",
    iconName: "Home",
    keywords: ["kost", "kos", "kontrakan", "pindah", "rumah", "kamar"],
    description: "Sewa kost, jasa angkut barang, perabot kamar, dan alat dapur",
    categories: [
      "Sewa Tempat",
      "Jasa Angkut",
      "Perlengkapan Kamar",
      "Kebersihan & Mandi",
      "Dapur & Elektronik",
      "Lain-lain",
    ],
    items: [
      { title: "Sewa Kost / Kontrakan Bulan Pertama", category: "Sewa Tempat", estimated: 1200000, notes: "Uang sewa / DP" },
      { title: "Jasa Angkut Barang / Sewa Pikap", category: "Jasa Angkut", estimated: 300000, notes: "Ongkos angkut" },
      { title: "Perlengkapan Tidur (Sprei, Bantal)", category: "Perlengkapan Kamar", estimated: 250000, notes: "" },
      { title: "Peralatan Mandi & Kebersihan", category: "Kebersihan & Mandi", estimated: 100000, notes: "Sapu, pel, ember, keset" },
      { title: "Galon Air, Dispenser & Rice Cooker", category: "Dapur & Elektronik", estimated: 350000, notes: "Kebutuhan harian anak kost" },
    ],
  },
  gadget: {
    id: "gadget",
    name: "Beli Gadget & Setup",
    iconName: "Smartphone",
    keywords: ["gadget", "hp", "laptop", "pc", "komputer", "ipad", "tablet", "iphone", "samsung"],
    description: "Perangkat elektronik baru, aksesoris, charger, dan proteksi",
    categories: [
      "Perangkat Utama",
      "Aksesoris & Proteksi",
      "Charger & Kabel",
      "Audio & TWS",
      "Tas & Sleeve",
      "Lain-lain",
    ],
    items: [
      { title: "Perangkat Utama (HP / Laptop)", category: "Perangkat Utama", estimated: 4500000, notes: "Unit perangkat resmi" },
      { title: "Casing & Tempered Glass", category: "Aksesoris & Proteksi", estimated: 150000, notes: "Pelindung bodi & layar" },
      { title: "Charger & Kabel Fast Charging", category: "Charger & Kabel", estimated: 250000, notes: "Adaptor original" },
      { title: "TWS / Earphone Bluetooth", category: "Audio & TWS", estimated: 350000, notes: "" },
      { title: "Tas Laptop / Pouch Organizer", category: "Tas & Sleeve", estimated: 150000, notes: "" },
    ],
  },
};

function getSuggestedTemplate(planTitle: string): PlanTemplate {
  const lower = planTitle.toLowerCase();
  for (const tpl of Object.values(PLAN_TEMPLATES)) {
    if (tpl.keywords.some((k) => lower.includes(k))) {
      return tpl;
    }
  }
  return PLAN_TEMPLATES.wisuda;
}

function TemplateIcon({ iconName, className = "w-4 h-4" }: { iconName: string; className?: string }) {
  switch (iconName) {
    case "Receipt":
      return <Receipt className={className} />;
    case "GraduationCap":
      return <GraduationCap className={className} />;
    case "Plane":
      return <Plane className={className} />;
    case "Home":
      return <Home className={className} />;
    case "Smartphone":
      return <Smartphone className={className} />;
    default:
      return <Sparkles className={className} />;
  }
}

function WhatsAppIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.122.553 4.114 1.517 5.845l-1.517 5.543 5.727-1.501c1.674.914 3.593 1.433 5.63 1.433 6.627 0 12-5.373 12-12 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

export function PlanManager({ initialPlans }: PlanManagerProps) {
  const router = useRouter();
  const [plans, setPlans] = useState<FormattedPlan[]>(initialPlans);

  useEffect(() => {
    setPlans(initialPlans);
  }, [initialPlans]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  // Filter & Search inside detail view
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Plan Modals
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<FormattedPlan | null>(null);
  const [planTitle, setPlanTitle] = useState("");
  const [planDesc, setPlanDesc] = useState("");
  const [planDate, setPlanDate] = useState("");
  const [planTargetBudget, setPlanTargetBudget] = useState("");
  const [planStatus, setPlanStatus] = useState<"PLANNING" | "ONGOING" | "COMPLETED">("PLANNING");

  // Item Modals
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [waPhoneNumber, setWaPhoneNumber] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [editingItem, setEditingItem] = useState<FormattedPlanItem | null>(null);
  const [itemTitle, setItemTitle] = useState("");
  const [itemCategory, setItemCategory] = useState("Lain-lain");
  const [itemEstimated, setItemEstimated] = useState("");
  const [itemActual, setItemActual] = useState("");
  const [itemStatus, setItemStatus] = useState<"UNPAID" | "PARTIAL" | "PAID">("UNPAID");
  const [itemNotes, setItemNotes] = useState("");

  // Loading & error state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApplyingTemplate, setIsApplyingTemplate] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedPlan = useMemo(
    () => plans.find((p) => p.id === selectedPlanId) || null,
    [plans, selectedPlanId]
  );

  const suggestedTemplate = useMemo(() => {
    return selectedPlan ? getSuggestedTemplate(selectedPlan.title) : PLAN_TEMPLATES.reimburse;
  }, [selectedPlan]);

  const [previewTemplate, setPreviewTemplate] = useState<PlanTemplate>(PLAN_TEMPLATES.reimburse);

  // Overall statistics for all plans
  const totalAllPlansEstimated = useMemo(() => {
    return plans.reduce((acc, p) => acc + p.items.reduce((sum, item) => sum + item.estimated, 0), 0);
  }, [plans]);

  const totalAllPlansActual = useMemo(() => {
    return plans.reduce((acc, p) => acc + p.items.reduce((sum, item) => sum + item.actual, 0), 0);
  }, [plans]);

  // Active plan stats
  const activePlanStats = useMemo(() => {
    if (!selectedPlan) return null;
    const totalEst = selectedPlan.items.reduce((sum, i) => sum + i.estimated, 0);
    const totalAct = selectedPlan.items.reduce((sum, i) => sum + i.actual, 0);
    const remaining = Math.max(0, totalEst - totalAct);
    const paidCount = selectedPlan.items.filter((i) => i.status === "PAID").length;
    const partialCount = selectedPlan.items.filter((i) => i.status === "PARTIAL").length;
    const totalCount = selectedPlan.items.length;
    const pct = totalEst > 0 ? Math.min(100, Math.round((totalAct / totalEst) * 100)) : 0;

    return {
      totalEstimated: totalEst,
      totalActual: totalAct,
      remaining,
      paidCount,
      partialCount,
      totalCount,
      pct,
    };
  }, [selectedPlan]);

  // Categories available in selected plan
  const planCategories = useMemo(() => {
    if (!selectedPlan) return [];
    const set = new Set<string>();
    selectedPlan.items.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set);
  }, [selectedPlan]);

  // Filtered items
  const filteredItems = useMemo(() => {
    if (!selectedPlan) return [];
    return selectedPlan.items.filter((item) => {
      const matchSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory = categoryFilter === "ALL" || item.category === categoryFilter;
      const matchStatus = statusFilter === "ALL" || item.status === statusFilter;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [selectedPlan, searchQuery, categoryFilter, statusFilter]);

  // --- PLAN HANDLERS ---
  const handleOpenCreatePlan = () => {
    setEditingPlan(null);
    setPlanTitle("");
    setPlanDesc("");
    setPlanDate("");
    setPlanTargetBudget("");
    setPlanStatus("PLANNING");
    setErrorMessage(null);
    setIsPlanModalOpen(true);
  };

  const handleOpenEditPlan = (plan: FormattedPlan) => {
    setEditingPlan(plan);
    setPlanTitle(plan.title);
    setPlanDesc(plan.description || "");
    setPlanDate(plan.targetDate ? plan.targetDate.split("T")[0] : "");
    setPlanTargetBudget(plan.targetBudget ? plan.targetBudget.toString() : "");
    setPlanStatus(plan.status);
    setErrorMessage(null);
    setIsPlanModalOpen(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planTitle.trim()) {
      setErrorMessage("Judul rencana wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const budgetNum = planTargetBudget ? parseFloat(planTargetBudget) : null;
      if (editingPlan) {
        const res = await updatePlanAction(editingPlan.id, {
          title: planTitle,
          description: planDesc || null,
          targetDate: planDate || null,
          targetBudget: budgetNum,
          status: planStatus,
        });

        if (!res.success) {
          setErrorMessage(res.message || "Gagal memperbarui rencana.");
          setIsSubmitting(false);
          return;
        }

        setPlans((prev) =>
          prev.map((p) =>
            p.id === editingPlan.id
              ? {
                  ...p,
                  title: planTitle,
                  description: planDesc || null,
                  targetDate: planDate ? new Date(planDate).toISOString() : null,
                  targetBudget: budgetNum,
                  status: planStatus,
                }
              : p
          )
        );
      } else {
        const res = await createPlanAction({
          title: planTitle,
          description: planDesc || null,
          targetDate: planDate || null,
          targetBudget: budgetNum,
          status: planStatus,
        });

        if (!res.success) {
          setErrorMessage(res.message || "Gagal membuat rencana.");
          setIsSubmitting(false);
          return;
        }

        if (res.data) {
          const newPlan: FormattedPlan = {
            id: res.data.id,
            title: res.data.title,
            description: res.data.description,
            targetDate: res.data.targetDate ? new Date(res.data.targetDate).toISOString() : null,
            status: res.data.status,
            targetBudget: res.data.targetBudget ? Number(res.data.targetBudget) : null,
            items: [],
            createdAt: new Date().toISOString(),
          };
          setPlans((prev) => [newPlan, ...prev]);
          setSelectedPlanId(newPlan.id);
        }
      }

      router.refresh();
      setIsPlanModalOpen(false);
    } catch {
      setErrorMessage("Terjadi kesalahan teknis.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePlan = async (id: string, title: string) => {
    if (!confirm(`Yakin ingin menghapus rencana "${title}" beserta semua rincian kebutuhannya?`)) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await deletePlanAction(id);
      if (res.success) {
        setPlans((prev) => prev.filter((p) => p.id !== id));
        if (selectedPlanId === id) {
          setSelectedPlanId(null);
        }
      } else {
        alert(res.message || "Gagal menghapus rencana.");
      }
    } catch {
      alert("Terjadi kesalahan teknis.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- ITEM HANDLERS ---
  const handleOpenAddItem = () => {
    setEditingItem(null);
    setItemTitle("");
    setItemCategory(suggestedTemplate.categories[0] || "Lain-lain");
    setItemEstimated("");
    setItemActual("");
    setItemStatus("UNPAID");
    setItemNotes("");
    setErrorMessage(null);
    setIsItemModalOpen(true);
  };

  const handleOpenEditItem = (item: FormattedPlanItem) => {
    setEditingItem(item);
    setItemTitle(item.title);
    setItemCategory(item.category || "Lain-lain");
    setItemEstimated(item.estimated.toString());
    setItemActual(item.actual.toString());
    setItemStatus(item.status);
    setItemNotes(item.notes || "");
    setErrorMessage(null);
    setIsItemModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanId) return;

    if (!itemTitle.trim()) {
      setErrorMessage("Nama kebutuhan wajib diisi.");
      return;
    }

    const estNum = parseFloat(itemEstimated);
    if (isNaN(estNum) || estNum <= 0) {
      setErrorMessage("Estimasi biaya harus berupa angka lebih dari 0.");
      return;
    }

    const actNum = itemActual ? parseFloat(itemActual) : 0;
    if (isNaN(actNum) || actNum < 0) {
      setErrorMessage("Nominal terbayar/aktual tidak valid.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (editingItem) {
        const res = await updatePlanItemAction(editingItem.id, {
          title: itemTitle,
          category: itemCategory,
          estimated: estNum,
          actual: actNum,
          status: itemStatus,
          notes: itemNotes || null,
        });

        if (!res.success) {
          setErrorMessage(res.message || "Gagal memperbarui item.");
          setIsSubmitting(false);
          return;
        }

        setPlans((prev) =>
          prev.map((p) => {
            if (p.id !== selectedPlanId) return p;
            return {
              ...p,
              items: p.items.map((i) =>
                i.id === editingItem.id
                  ? {
                      ...i,
                      title: itemTitle,
                      category: itemCategory,
                      estimated: estNum,
                      actual: actNum,
                      status: itemStatus,
                      notes: itemNotes || null,
                    }
                  : i
              ),
            };
          })
        );
      } else {
        const res = await createPlanItemAction({
          planId: selectedPlanId,
          title: itemTitle,
          category: itemCategory,
          estimated: estNum,
          actual: actNum,
          status: itemStatus,
          notes: itemNotes || null,
        });

        if (!res.success) {
          setErrorMessage(res.message || "Gagal menambahkan item.");
          setIsSubmitting(false);
          return;
        }

        if (res.data) {
          const newItem: FormattedPlanItem = {
            id: res.data.id,
            planId: res.data.planId,
            title: res.data.title,
            category: res.data.category || "Lain-lain",
            estimated: res.data.estimated,
            actual: res.data.actual,
            status: res.data.status,
            notes: res.data.notes,
          };

          setPlans((prev) =>
            prev.map((p) => {
              if (p.id !== selectedPlanId) return p;
              return {
                ...p,
                items: [newItem, ...p.items],
              };
            })
          );
        }
      }

      router.refresh();
      setIsItemModalOpen(false);
    } catch {
      setErrorMessage("Terjadi kesalahan teknis.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (itemId: string, title: string) => {
    if (!selectedPlanId) return;
    if (!confirm(`Hapus kebutuhan "${title}"?`)) return;

    try {
      const res = await deletePlanItemAction(itemId);
      if (res.success) {
        setPlans((prev) =>
          prev.map((p) => {
            if (p.id !== selectedPlanId) return p;
            return {
              ...p,
              items: p.items.filter((i) => i.id !== itemId),
            };
          })
        );
      } else {
        alert(res.message || "Gagal menghapus item.");
      }
    } catch {
      alert("Terjadi kesalahan teknis.");
    }
  };

  const handleQuickStatusChange = async (
    item: FormattedPlanItem,
    newStatus: "UNPAID" | "PARTIAL" | "PAID"
  ) => {
    if (!selectedPlanId) return;

    let newActual = item.actual;
    if (newStatus === "PAID" && item.actual < item.estimated) {
      newActual = item.estimated;
    } else if (newStatus === "UNPAID") {
      newActual = 0;
    }

    try {
      const res = await updatePlanItemAction(item.id, {
        status: newStatus,
        actual: newActual,
      });

      if (res.success) {
        setPlans((prev) =>
          prev.map((p) => {
            if (p.id !== selectedPlanId) return p;
            return {
              ...p,
              items: p.items.map((i) =>
                i.id === item.id ? { ...i, status: newStatus, actual: newActual } : i
              ),
            };
          })
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyTemplate = async (templateToApply?: PlanTemplate) => {
    if (!selectedPlanId) return;
    const target = templateToApply || suggestedTemplate;
    if (!confirm(`Tambahkan ${target.items.length} kebutuhan standar dari template "${target.name}" ke dalam rencana ini?`)) return;

    setIsApplyingTemplate(true);
    try {
      const addedItems: FormattedPlanItem[] = [];
      for (const item of target.items) {
        const res = await createPlanItemAction({
          planId: selectedPlanId,
          title: item.title,
          category: item.category,
          estimated: item.estimated,
          actual: 0,
          status: "UNPAID",
          notes: item.notes,
        });

        if (res.success && res.data) {
          addedItems.push({
            id: res.data.id,
            planId: res.data.planId,
            title: res.data.title,
            category: res.data.category || "Lain-lain",
            estimated: res.data.estimated,
            actual: res.data.actual,
            status: res.data.status,
            notes: res.data.notes,
          });
        }
      }

      setPlans((prev) =>
        prev.map((p) => {
          if (p.id !== selectedPlanId) return p;
          return {
            ...p,
            items: [...p.items, ...addedItems],
          };
        })
      );
      setIsTemplatePickerOpen(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Gagal memuat template kebutuhan.");
    } finally {
      setIsApplyingTemplate(false);
    }
  };

  const generateWhatsAppMessage = () => {
    if (!selectedPlan || !activePlanStats) return "";

    const dateStr = selectedPlan.targetDate
      ? formatIndonesianDate(selectedPlan.targetDate)
      : new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date());

    let text = `📋 *Rincian Rencana: ${selectedPlan.title}*\n`;
    if (selectedPlan.description) {
      text += `📝 ${selectedPlan.description}\n`;
    }
    text += `📅 Tanggal: ${dateStr}\n\n`;

    text += `*Daftar Kebutuhan:*\n`;
    if (selectedPlan.items.length === 0) {
      text += `_(Belum ada item kebutuhan)_\n`;
    } else {
      selectedPlan.items.forEach((item, index) => {
        const statusText =
          item.status === "PAID"
            ? "✅ Lunas"
            : item.status === "PARTIAL"
            ? `⏳ DP: ${formatRupiah(item.actual)}`
            : "❌ Belum Bayar";

        text += `${index + 1}. *${item.title}* [${item.category || "Lain-lain"}]\n`;
        text += `   • Estimasi: ${formatRupiah(item.estimated)} (${statusText})\n`;
        if (item.notes) {
          text += `   • Catatan: ${item.notes}\n`;
        }
      });
    }

    text += `\n━━━━━━━━━━━━━━━━━━━━\n`;
    text += `💰 *Total Estimasi Biaya:* ${formatRupiah(activePlanStats.totalEstimated)}\n`;
    text += `💳 *Sudah Terbayar / DP:* ${formatRupiah(activePlanStats.totalActual)}\n`;
    text += `⏳ *Sisa Kebutuhan Dana:* ${formatRupiah(activePlanStats.remaining)}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━\n`;
    text += `_Dicatat rapi via FinTrack_ 🚀`;

    return text;
  };

  const handleSendToWhatsApp = () => {
    const message = generateWhatsAppMessage();
    let url = "";
    const cleanPhone = waPhoneNumber.replace(/\D/g, "");
    if (cleanPhone) {
      const finalPhone = cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone;
      url = `https://api.whatsapp.com/send?phone=${finalPhone}&text=${encodeURIComponent(message)}`;
    } else {
      url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    }
    window.open(url, "_blank");
  };

  const handleCopyText = async () => {
    const message = generateWhatsAppMessage();
    await navigator.clipboard.writeText(message);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  // -------------------------------------------------------------
  // RENDER: DETAIL VIEW FOR SELECTED PLAN
  // -------------------------------------------------------------
  if (selectedPlan && activePlanStats) {
    return (
      <div className="space-y-6">
        {/* Top Navigation & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-start gap-3">
            <button
              onClick={() => setSelectedPlanId(null)}
              className="mt-1 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
              title="Kembali ke Daftar Rencana"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {selectedPlan.title}
                </h1>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                    selectedPlan.status === "COMPLETED"
                      ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800"
                      : selectedPlan.status === "ONGOING"
                      ? "bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 border border-teal-300 dark:border-teal-800"
                      : "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800"
                  }`}
                >
                  {selectedPlan.status === "COMPLETED"
                    ? "Selesai"
                    : selectedPlan.status === "ONGOING"
                    ? "Sedang Berjalan"
                    : "Perencanaan"}
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {selectedPlan.description || "Rencana estimasi dan alokasi biaya pengeluaran"}
                {selectedPlan.targetDate && (
                  <span className="ml-2 inline-flex items-center text-teal-600 dark:text-teal-400 font-medium">
                    <Calendar className="w-3.5 h-3.5 mr-1" />
                    Target: {formatIndonesianDate(selectedPlan.targetDate)}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsWhatsAppModalOpen(true)}
              className="inline-flex items-center px-3.5 py-2 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition cursor-pointer"
              title="Kirim atau salin rincian ke WhatsApp"
            >
              <Share2 className="w-4 h-4 mr-1.5" />
              Kirim ke WA
            </button>
            <button
              onClick={() => handleOpenEditPlan(selectedPlan)}
              className="inline-flex items-center px-3.5 py-2 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              <Pencil className="w-4 h-4 mr-1.5 text-slate-500" />
              Edit Rencana
            </button>
            <button
              onClick={handleOpenAddItem}
              className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Tambah Kebutuhan
            </button>
          </div>
        </div>

        {/* 4 Big Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Estimasi */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <span>Total Estimasi Biaya</span>
              <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
              {formatRupiah(activePlanStats.totalEstimated)}
            </div>
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <span>Dari total {activePlanStats.totalCount} item kebutuhan</span>
            </div>
          </div>

          {/* Card 2: Sudah Dibayar / DP */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <span>Sudah Dibayar / DP</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {formatRupiah(activePlanStats.totalActual)}
            </div>
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <span>{activePlanStats.pct}% dari total estimasi</span>
            </div>
          </div>

          {/* Card 3: Sisa Dana yang Dibutuhkan */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <span>Sisa Dana Dibutuhkan</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-black text-amber-600 dark:text-amber-400">
              {formatRupiah(activePlanStats.remaining)}
            </div>
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {activePlanStats.remaining === 0 ? "Semua biaya telah terlunasi!" : "Kekurangan dana yang perlu disiapkan"}
            </div>
          </div>

          {/* Card 4: Kesiapan Checklist */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <span>Kesiapan Item</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
              {activePlanStats.paidCount} / {activePlanStats.totalCount}
            </div>
            <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-teal-600 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${activePlanStats.totalCount > 0 ? (activePlanStats.paidCount / activePlanStats.totalCount) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Toolbar: Search, Filters, & Preset button */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari kebutuhan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="py-1.5 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="ALL">Semua Kategori ({selectedPlan.items.length})</option>
              {planCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1.5 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="ALL">Semua Status</option>
              <option value="UNPAID">Belum Bayar</option>
              <option value="PARTIAL">DP / Sebagian</option>
              <option value="PAID">Lunas</option>
            </select>
          </div>

          {/* Quick Preset Action if items are low */}
          {selectedPlan.items.length === 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handleApplyTemplate(suggestedTemplate)}
                disabled={isApplyingTemplate}
                className="inline-flex items-center text-xs px-3.5 py-2 font-semibold rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900/60 transition cursor-pointer"
                title={`Pakai template default untuk "${selectedPlan.title}"`}
              >
                <TemplateIcon iconName={suggestedTemplate.iconName} className="w-3.5 h-3.5 mr-1.5 text-teal-600 dark:text-teal-400" />
                {isApplyingTemplate ? "Memuat..." : `Gunakan Template ${suggestedTemplate.name}`}
              </button>
              <button
                onClick={() => {
                  setPreviewTemplate(suggestedTemplate);
                  setIsTemplatePickerOpen(true);
                }}
                className="inline-flex items-center text-xs px-3 py-2 font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                <SlidersHorizontal className="w-3 h-3 mr-1.5 text-slate-400" />
                Pilih Template Lain...
              </button>
            </div>
          )}
        </div>

        {/* Items Table / List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          {filteredItems.length === 0 ? (
            <div className="p-12 text-center">
              <FolderOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                Belum ada rincian kebutuhan
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                Tambahkan item kebutuhan untuk rencana <span className="font-semibold text-slate-700 dark:text-slate-200">&quot;{selectedPlan.title}&quot;</span> atau gunakan template siap pakai agar lebih cepat.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                <button
                  onClick={handleOpenAddItem}
                  className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Tambah Kebutuhan Manual
                </button>
                {selectedPlan.items.length === 0 && (
                  <>
                    <button
                      onClick={() => handleApplyTemplate(suggestedTemplate)}
                      disabled={isApplyingTemplate}
                      className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 transition"
                    >
                      <TemplateIcon iconName={suggestedTemplate.iconName} className="w-4 h-4 mr-1.5 text-teal-600 dark:text-teal-400" />
                      Pakai Template {suggestedTemplate.name}
                    </button>
                    <button
                      onClick={() => {
                        setPreviewTemplate(suggestedTemplate);
                        setIsTemplatePickerOpen(true);
                      }}
                      className="inline-flex items-center px-3.5 py-2 text-sm font-medium rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                      Pilihan Template Lain
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Nama Kebutuhan</th>
                    <th className="py-3.5 px-4">Kategori</th>
                    <th className="py-3.5 px-4 text-right">Estimasi</th>
                    <th className="py-3.5 px-4 text-right">Terbayar / DP</th>
                    <th className="py-3.5 px-4 text-right">Sisa Bayar</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {filteredItems.map((item) => {
                    const diff = Math.max(0, item.estimated - item.actual);
                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition group"
                      >
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-900 dark:text-white">
                            {item.title}
                          </div>
                          {item.notes && (
                            <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                              {item.notes}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            <Tag className="w-3 h-3 mr-1 text-slate-400" />
                            {item.category || "Lain-lain"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-medium text-slate-800 dark:text-slate-200">
                          {formatRupiah(item.estimated)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatRupiah(item.actual)}
                        </td>
                        <td className="py-3.5 px-4 text-right text-xs font-medium text-slate-500 dark:text-slate-400">
                          {diff === 0 ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                              Lunas
                            </span>
                          ) : (
                            formatRupiah(diff)
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() =>
                                handleQuickStatusChange(
                                  item,
                                  item.status === "PAID"
                                    ? "UNPAID"
                                    : item.status === "PARTIAL"
                                    ? "PAID"
                                    : "PARTIAL"
                                )
                              }
                              className={`text-xs px-2.5 py-1 rounded-full font-semibold transition cursor-pointer border ${
                                item.status === "PAID"
                                  ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                                  : item.status === "PARTIAL"
                                  ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200"
                              }`}
                              title="Klik untuk ubah status cepat"
                            >
                              {item.status === "PAID" ? (
                                <span className="flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Lunas
                                </span>
                              ) : item.status === "PARTIAL" ? (
                                <span>DP / Sebagian</span>
                              ) : (
                                <span>Belum Bayar</span>
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleOpenEditItem(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                              title="Edit item"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id, item.title)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                              title="Hapus item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MODAL: ADD / EDIT ITEM */}
        {isItemModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingItem ? "Edit Kebutuhan" : "Tambah Kebutuhan Baru"}
                </h3>
                <button
                  onClick={() => setIsItemModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  &times;
                </button>
              </div>

              {errorMessage && (
                <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSaveItem} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Kebutuhan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={suggestedTemplate.items[0]?.title ? `Contoh: ${suggestedTemplate.items[0].title}` : "Contoh: Bensin & Tol"}
                    value={itemTitle}
                    onChange={(e) => setItemTitle(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kategori / Kelompok
                  </label>
                  <input
                    type="text"
                    placeholder={suggestedTemplate.categories[0] ? `Contoh: ${suggestedTemplate.categories[0]}` : "Contoh: Transport"}
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  {/* Category Chips */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {suggestedTemplate.categories.map((cat) => (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => setItemCategory(cat)}
                        className={`text-[11px] px-2 py-0.5 rounded-lg border transition cursor-pointer ${
                          itemCategory === cat
                            ? "bg-teal-50 dark:bg-teal-950 border-teal-500 text-teal-700 dark:text-teal-300 font-semibold"
                            : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Estimasi Biaya (Rp) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="Contoh: 350000"
                      value={itemEstimated}
                      onChange={(e) => setItemEstimated(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Sudah Dibayar / DP (Rp)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={itemActual}
                      onChange={(e) => {
                        const val = e.target.value;
                        setItemActual(val);
                        const est = parseFloat(itemEstimated) || 0;
                        const act = parseFloat(val) || 0;
                        if (act >= est && est > 0) {
                          setItemStatus("PAID");
                        } else if (act > 0) {
                          setItemStatus("PARTIAL");
                        } else {
                          setItemStatus("UNPAID");
                        }
                      }}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status Pembayaran
                  </label>
                  <select
                    value={itemStatus}
                    onChange={(e) => setItemStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="UNPAID">Belum Dibayar</option>
                    <option value="PARTIAL">Bayar Sebagian / DP</option>
                    <option value="PAID">Lunas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Catatan Tambahan (Opsional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: DP 100rb di Vendor X, sisa H-1 saat ambil pakaian"
                    value={itemNotes}
                    onChange={(e) => setItemNotes(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsItemModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-semibold rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition disabled:opacity-50"
                  >
                    {isSubmitting ? "Menyimpan..." : "Simpan Kebutuhan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: WHATSAPP SHARE */}
        {isWhatsAppModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              {/* WhatsApp Gradient Header */}
              <div className="bg-linear-to-r from-emerald-600 via-teal-600 to-emerald-700 px-6 py-4.5 text-white flex items-center justify-between shrink-0 shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 pointer-events-none">
                  <WhatsAppIcon className="w-36 h-36" />
                </div>
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
                    <WhatsAppIcon className="w-6 h-6 fill-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                      Bagikan ke WhatsApp
                    </h3>
                    <p className="text-xs text-emerald-100 font-medium">
                      Kirim rincian biaya &amp; reimbursement dengan rapi
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsWhatsAppModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-lg transition relative z-10 cursor-pointer"
                  title="Tutup"
                >
                  &times;
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="p-6 overflow-y-auto space-y-4 text-left">
                {/* Recipient Phone Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Nomor WhatsApp Tujuan (Opsional)
                    </label>
                    <span className="text-[11px] text-slate-400">Bisa dikosongkan</span>
                  </div>
                  <div className="relative flex rounded-2xl shadow-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500">
                    <span className="inline-flex items-center px-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 border-r border-slate-200 dark:border-slate-700 select-none">
                      🇮🇩 +62
                    </span>
                    <input
                      type="text"
                      placeholder="8123456789 atau kosongkan"
                      value={waPhoneNumber}
                      onChange={(e) => setWaPhoneNumber(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                    />
                    {waPhoneNumber && (
                      <button
                        type="button"
                        onClick={() => setWaPhoneNumber("")}
                        className="px-3 text-slate-400 hover:text-slate-600 text-xs font-bold"
                      >
                        Hapus
                      </button>
                    )}
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setWaPhoneNumber("")}
                      className={`text-[11px] px-2.5 py-1 rounded-xl font-medium border transition cursor-pointer ${
                        !waPhoneNumber
                          ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-semibold"
                          : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                      }`}
                    >
                      💬 Pilih Chat di WA
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const input = prompt("Masukkan nomor WhatsApp Papah (contoh: 08123456789):", waPhoneNumber);
                        if (input !== null) setWaPhoneNumber(input.trim());
                      }}
                      className="text-[11px] px-2.5 py-1 rounded-xl font-medium bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 transition cursor-pointer"
                    >
                      👨 Nomor Papah
                    </button>
                  </div>
                </div>

                {/* WhatsApp Chat Bubble Mockup */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Pratinjau Chat WhatsApp:
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyText}
                      className="inline-flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 cursor-pointer"
                    >
                      {isCopied ? (
                        <span className="flex items-center text-emerald-600 font-bold">
                          <Check className="w-3.5 h-3.5 mr-1" /> Tersalin!
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Copy className="w-3.5 h-3.5 mr-1" /> Salin Teks
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Realistic WhatsApp Background with Chat Bubble */}
                  <div className="rounded-2xl p-4 bg-[#efeae2] dark:bg-[#0b141a] border border-slate-300 dark:border-slate-800 shadow-inner relative overflow-hidden">
                    {/* Speech Bubble */}
                    <div className="bg-[#d9fdd3] dark:bg-[#005c4b] text-slate-900 dark:text-slate-100 p-3.5 rounded-2xl rounded-tr-xs shadow-xs text-xs font-sans leading-relaxed border border-emerald-200/60 dark:border-emerald-800/40 relative">
                      {/* Bubble Content */}
                      <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1 mb-1">
                        📋 {selectedPlan.title}
                      </div>
                      {selectedPlan.description && (
                        <div className="text-slate-600 dark:text-emerald-100 text-[11px] mb-2 italic">
                          📝 {selectedPlan.description}
                        </div>
                      )}
                      <div className="text-[11px] text-slate-500 dark:text-emerald-200 mb-2.5">
                        📅 {selectedPlan.targetDate ? formatIndonesianDate(selectedPlan.targetDate) : formatIndonesianDate(new Date())}
                      </div>

                      {/* Items List Preview */}
                      <div className="border-t border-emerald-300/50 dark:border-emerald-700/50 pt-2 space-y-1.5">
                        <div className="font-bold text-[11px] uppercase tracking-wider text-slate-700 dark:text-emerald-100">
                          Daftar Kebutuhan ({selectedPlan.items.length}):
                        </div>
                        {selectedPlan.items.length === 0 ? (
                          <div className="italic text-slate-500 text-[11px]">Belum ada item kebutuhan</div>
                        ) : (
                          selectedPlan.items.slice(0, 5).map((item, idx) => (
                            <div key={item.id} className="flex items-start justify-between gap-2 text-[11px]">
                              <span className="text-slate-800 dark:text-slate-200">
                                {idx + 1}. {item.title}
                              </span>
                              <span className="font-semibold shrink-0 text-slate-900 dark:text-white">
                                {formatRupiah(item.estimated)}
                                <span className={`ml-1 text-[9px] px-1.5 py-0.2 rounded-md ${
                                  item.status === "PAID"
                                    ? "bg-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100 font-bold"
                                    : item.status === "PARTIAL"
                                    ? "bg-amber-200 text-amber-900 dark:bg-amber-800 dark:text-amber-100 font-bold"
                                    : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                                }`}>
                                  {item.status === "PAID" ? "Lunas" : item.status === "PARTIAL" ? "DP" : "Belum"}
                                </span>
                              </span>
                            </div>
                          ))
                        )}
                        {selectedPlan.items.length > 5 && (
                          <div className="text-[10px] text-slate-500 dark:text-emerald-200 italic pt-0.5">
                            ... dan {selectedPlan.items.length - 5} item lainnya
                          </div>
                        )}
                      </div>

                      {/* Total Box Inside Bubble */}
                      <div className="mt-3 pt-2.5 border-t border-emerald-300/60 dark:border-emerald-700/60 space-y-1">
                        <div className="flex justify-between font-bold text-xs">
                          <span>Total Estimasi Biaya:</span>
                          <span className="text-slate-900 dark:text-white font-black">{formatRupiah(activePlanStats.totalEstimated)}</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-emerald-800 dark:text-emerald-200">
                          <span>Sudah Dibayar / DP:</span>
                          <span className="font-semibold">{formatRupiah(activePlanStats.totalActual)}</span>
                        </div>
                        <div className="flex justify-between text-[11px] font-bold text-amber-800 dark:text-amber-300">
                          <span>Sisa Kebutuhan Dana:</span>
                          <span>{formatRupiah(activePlanStats.remaining)}</span>
                        </div>
                      </div>

                      {/* Fake WhatsApp Timestamp and Blue Checks */}
                      <div className="mt-2 text-right text-[10px] text-slate-400 dark:text-emerald-200 flex items-center justify-end gap-1">
                        <span>{new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>
                        <span className="text-sky-500 font-bold text-xs tracking-tighter">✓✓</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyText}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 font-semibold text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                  {isCopied ? "Tersalin ke Clipboard!" : "Salin Teks Lengkap"}
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsWhatsAppModalOpen(false)}
                    className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold rounded-2xl text-slate-500 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleSendToWhatsApp}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs shadow-md shadow-emerald-500/20 hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <WhatsAppIcon className="w-4 h-4 fill-white" />
                    Buka di WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: TEMPLATE PICKER */}
        {isTemplatePickerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-teal-600" />
                    Pilih Template Kebutuhan
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Pilih template otomatis yang sesuai dengan rencana &quot;{selectedPlan.title}&quot;
                  </p>
                </div>
                <button
                  onClick={() => setIsTemplatePickerOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold"
                >
                  &times;
                </button>
              </div>

              {/* Template selection chips */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
                {Object.values(PLAN_TEMPLATES).map((tpl) => {
                  const isSelected = previewTemplate.id === tpl.id;
                  return (
                    <button
                      type="button"
                      key={tpl.id}
                      onClick={() => setPreviewTemplate(tpl)}
                      className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "bg-teal-50 dark:bg-teal-950/60 border-teal-500 ring-2 ring-teal-500/20"
                          : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            isSelected
                              ? "bg-teal-600 text-white"
                              : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                          }`}
                        >
                          <TemplateIcon iconName={tpl.iconName} className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                          {tpl.name}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {tpl.items.length} item kebutuhan
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Preview of items inside selected template */}
              <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Rincian Item Template: {previewTemplate.name}
                  </span>
                  <span className="text-xs text-teal-600 dark:text-teal-400 font-semibold">
                    Total: {formatRupiah(previewTemplate.items.reduce((s, i) => s + i.estimated, 0))}
                  </span>
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {previewTemplate.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {item.title}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{item.category}</div>
                      </div>
                      <div className="font-semibold text-slate-700 dark:text-slate-300">
                        {formatRupiah(item.estimated)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTemplatePickerOpen(false)}
                  className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyTemplate(previewTemplate)}
                  disabled={isApplyingTemplate}
                  className="px-5 py-2 text-sm font-semibold rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {isApplyingTemplate ? "Memproses..." : `Gunakan Template ${previewTemplate.name}`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: OVERVIEW OF ALL PLANS
  // -------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="p-6 rounded-3xl bg-linear-to-r from-teal-700 via-teal-800 to-slate-900 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-teal-500/20 text-teal-200 border border-teal-400/30 mb-3 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5" />
              Event & Financial Planner
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Rencana Biaya & Kebutuhan Acara
            </h1>
            <p className="text-teal-100/90 text-sm mt-2 leading-relaxed">
              Kalkulasikan seluruh rincian biaya wisuda, event khusus, atau target pengeluaran besar lainnya agar tidak ada pos pengeluaran yang terlewat.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleOpenCreatePlan}
              className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-white text-teal-800 hover:bg-teal-50 font-bold text-sm shadow-md transition cursor-pointer"
            >
              <Plus className="w-5 h-5 mr-2 text-teal-700" />
              Buat Rencana Baru
            </button>
          </div>
        </div>

        {/* Global Summary Badge */}
        {plans.length > 0 && (
          <div className="mt-6 pt-5 border-t border-teal-600/40 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-teal-200/80">Total Rencana Aktif</span>
              <p className="text-lg font-bold text-white mt-0.5">{plans.length} Rencana</p>
            </div>
            <div>
              <span className="text-teal-200/80">Akumulasi Estimasi Kebutuhan</span>
              <p className="text-lg font-bold text-white mt-0.5">
                {formatRupiah(totalAllPlansEstimated)}
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-teal-200/80">Sudah Dibayar / Disiapkan</span>
              <p className="text-lg font-bold text-teal-300 mt-0.5">
                {formatRupiah(totalAllPlansActual)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Plan Cards Grid */}
      {plans.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs">
          <FolderOpen className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            Belum ada rencana biaya
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            Mulai buat rencana baru seperti &quot;Wisuda 2026&quot; untuk menghitung perkiraan seluruh biaya mulai dari kebaya, fotografer, hingga syukuran.
          </p>
          <button
            onClick={handleOpenCreatePlan}
            className="mt-5 inline-flex items-center px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-sm transition"
          >
            <Plus className="w-4 h-4 mr-2" />
            Buat Rencana Wisuda Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const totalEst = plan.items.reduce((s, i) => s + i.estimated, 0);
            const totalAct = plan.items.reduce((s, i) => s + i.actual, 0);
            const remaining = Math.max(0, totalEst - totalAct);
            const pct = totalEst > 0 ? Math.min(100, Math.round((totalAct / totalEst) * 100)) : 0;
            const paidCount = plan.items.filter((i) => i.status === "PAID").length;

            return (
              <div
                key={plan.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        plan.status === "COMPLETED"
                          ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300"
                          : plan.status === "ONGOING"
                          ? "bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 border border-teal-300"
                          : "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300"
                      }`}
                    >
                      {plan.status === "COMPLETED"
                        ? "Selesai"
                        : plan.status === "ONGOING"
                        ? "Berjalan"
                        : "Perencanaan"}
                    </span>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditPlan(plan);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-teal-600 transition"
                        title="Edit rencana"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePlan(plan.id, plan.title);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition"
                        title="Hapus rencana"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-1">
                    {plan.title}
                  </h3>
                  {plan.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {plan.description}
                    </p>
                  )}

                  {plan.targetDate && (
                    <div className="mt-3 flex items-center text-xs text-slate-500 dark:text-slate-400">
                      <Calendar className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
                      {formatIndonesianDate(plan.targetDate)}
                    </div>
                  )}

                  {/* Financial Metrics */}
                  <div className="mt-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Total Estimasi:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatRupiah(totalEst)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Sudah Dibayar:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {formatRupiah(totalAct)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-slate-500 dark:text-slate-400">Sisa Kebutuhan:</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">
                        {formatRupiah(remaining)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="pt-2">
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>Realisasi Dana</span>
                        <span className="font-semibold text-slate-600 dark:text-slate-300">
                          {pct}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-teal-600 h-full rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {paidCount}/{plan.items.length} item lunas
                  </span>
                  <button
                    onClick={() => setSelectedPlanId(plan.id)}
                    className="inline-flex items-center text-xs font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 group-hover:translate-x-0.5 transition cursor-pointer"
                  >
                    Buka Rincian <ChevronRight className="w-4 h-4 ml-0.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: CREATE / EDIT PLAN */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingPlan ? "Edit Rencana" : "Buat Rencana Biaya Baru"}
              </h3>
              <button
                onClick={() => setIsPlanModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                &times;
              </button>
            </div>

            {errorMessage && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSavePlan} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Rencana <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Wisuda Sarjana 2026"
                  value={planTitle}
                  onChange={(e) => setPlanTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi / Catatan Rencana
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Estimasi pengeluaran kebaya, toga, foto studio, dan makan keluarga"
                  value={planDesc}
                  onChange={(e) => setPlanDesc(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Tanggal Acara
                  </label>
                  <input
                    type="date"
                    value={planDate}
                    onChange={(e) => setPlanDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status Rencana
                  </label>
                  <select
                    value={planStatus}
                    onChange={(e) => setPlanStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="PLANNING">Perencanaan</option>
                    <option value="ONGOING">Sedang Berjalan</option>
                    <option value="COMPLETED">Selesai</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Plafon / Target Batas Budget (Opsional)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Contoh: 5000000"
                  value={planTargetBudget}
                  onChange={(e) => setPlanTargetBudget(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlanModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-semibold rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Rencana"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
