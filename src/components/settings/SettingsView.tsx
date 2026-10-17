"use client";

import React, { useState } from "react";
import { User, Lock, Mail, Calendar, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { updateProfileAction, changePasswordAction } from "@/app/actions/authActions";
import { formatIndonesianDate } from "@/lib/formatters";

interface SettingsViewProps {
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    createdAt: Date;
  };
}

export function SettingsView({ user }: SettingsViewProps) {
  // Profile State
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar || "");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ success: boolean; text: string } | null>(null);

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ success: boolean; text: string } | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);

    const formData = new FormData();
    formData.append("name", name);
    if (avatar) formData.append("avatar", avatar);

    try {
      const res = await updateProfileAction(null, formData);
      if (res.success) {
        setProfileMsg({ success: true, text: "Profil berhasil diperbarui!" });
      } else {
        setProfileMsg({ success: false, text: res.message || "Gagal memperbarui profil" });
      }
    } catch {
      setProfileMsg({ success: false, text: "Terjadi kesalahan sistem" });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMsg(null);

    if (newPassword !== confirmNewPassword) {
      setPasswordMsg({ success: false, text: "Konfirmasi kata sandi baru tidak cocok" });
      setPasswordLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("currentPassword", currentPassword);
    formData.append("newPassword", newPassword);
    formData.append("confirmNewPassword", confirmNewPassword);

    try {
      const res = await changePasswordAction(null, formData);
      if (res.success) {
        setPasswordMsg({ success: true, text: "Kata sandi Anda berhasil diperbarui!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      } else {
        setPasswordMsg({ success: false, text: res.message || "Gagal mengganti kata sandi" });
      }
    } catch {
      setPasswordMsg({ success: false, text: "Terjadi kesalahan sistem" });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Account Info Banner */}
      <div className="card-fintrack p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-900 to-slate-900 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center font-bold text-2xl text-emerald-400 border border-white/10">
            {avatar ? (
              <img src={avatar} alt={user.name} className="w-full h-full rounded-2xl object-cover" />
            ) : (
              user.name.substring(0, 2).toUpperCase()
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-xs text-slate-300 mt-0.5">{user.email}</p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 mt-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>Bergabung sejak {formatIndonesianDate(user.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4" />
          <span>Akun Terverifikasi</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="card-fintrack p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-800">Informasi Pribadi</h3>
          </div>

          {profileMsg && (
            <div
              className={`p-3 text-xs font-semibold rounded-xl mb-4 ${
                profileMsg.success
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}
            >
              {profileMsg.text}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Alamat Email
              </label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
              />
              <p className="text-[11px] text-slate-400 mt-1">Email digunakan sebagai ID login utama.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                URL Foto Profil (Opsional)
              </label>
              <input
                type="url"
                placeholder="https://example.com/avatar.jpg"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
              />
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {profileLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Simpan Profil</span>
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="card-fintrack p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-800">Keamanan & Sandi</h3>
          </div>

          {passwordMsg && (
            <div
              className={`p-3 text-xs font-semibold rounded-xl mb-4 ${
                passwordMsg.success
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}
            >
              {passwordMsg.text}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Kata Sandi Saat Ini
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Kata Sandi Baru (Min. 6 Karakter)
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Konfirmasi Kata Sandi Baru
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {passwordLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Ganti Kata Sandi</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
