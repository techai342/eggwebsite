import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import { AppShell } from '../components/AppNavigation';
import '../rawafiles.css';

/**
 * ChangePasswordPage: High-fidelity Security Credentials Management
 * Exact fidelity to Alkram Meta Eggs _ Change Password.html with branding updated to "AL Rehman Meta Eggs".
 * Features:
 * - AppShell wrapper with responsive 480px canvas, AppHeader and sticky AppBottomNav
 * - Security Settings header card with 256-Bit SSL badge and back button
 * - Main 3D password card with floating lock illustration and diagonal shine sweep
 * - 3 Password fields with lead icons:
 *     1. Current Password (fa-lock-open)
 *     2. New Password (fa-key)
 *     3. Confirm Password (fa-shield-halved)
 * - Independent interactive eye toggles (fa-eye / fa-eye-slash) for all three fields
 * - Gradient 3D submit button with checkmark icon and loading feedback
 * - Footer trust info: "Your security and digital assets are fully protected"
 * - Integration with useFarm().changePassword() and toast feedback
 */
export default function ChangePasswordPage() {
  const { changePassword, showToast, navigateTo } = useFarm();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('error', 'All three password fields are required.');
      return;
    }

    if (newPassword.length < 6) {
      showToast('error', 'New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('error', 'New password and confirm password do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = changePassword(currentPassword, newPassword, confirmPassword);
      if (res.success) {
        setStatusMessage({ type: 'success', text: res.message });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setStatusMessage({ type: 'error', text: res.message });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update password.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell currentRoute="/change-password" title="SECURITY SETTINGS" showBack={true}>
      <div className="px-3.5 pt-3 pb-6 flex flex-col justify-start">
        {/* 1. Header Bar with Back Button & Security Icon */}
        <div className="card-farm-3d p-3 mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigateTo('/dashboard')}
              className="w-8 h-8 rounded-xl bg-[#f0f5eb] border border-[#c2d9bf] text-[#153d2b] flex items-center justify-center text-xs active:scale-95 transition-all shadow-2xs hover:bg-[#e4ede0]"
              title="Return to Dashboard"
              aria-label="Return to Dashboard"
            >
              <i className="fa-solid fa-arrow-left"></i>
            </button>
            <div>
              <h2 className="font-manrope font-black text-xs text-[#0d2c20] uppercase tracking-wide leading-tight">
                Security Settings
              </h2>
              <span className="text-[7.5px] font-bold text-slate-400 tracking-wider uppercase block mt-0.5">
                Update Account Password
              </span>
            </div>
          </div>

          {/* 256-Bit Shield Badge */}
          <div className="inline-flex items-center gap-1 bg-[#eef5e6] border border-[#16a34a]/30 text-[#15803d] text-[7.5px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
            <i className="fa-solid fa-shield-halved text-[8px]"></i>
            <span>256-Bit SSL</span>
          </div>
        </div>

        {/* 2. Main 3D Password Form Card */}
        <div className="card-farm-3d p-4 relative bg-white">
          {/* Diagonal Shine Sweep Overlay */}
          <div className="shine-sweep"></div>

          {/* Card Header Illustration Row */}
          <div className="flex items-center gap-3 pb-3 mb-3 border-b border-[#f0f5ee] relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#f0f4ea] to-[#e0edd7] border border-[#c2d9bf] flex items-center justify-center text-xl text-[#15803d] shadow-inner anim-float flex-shrink-0">
              <i className="fa-solid fa-lock"></i>
            </div>
            <div>
              <h3 className="font-manrope font-black text-xs text-[#0d2c20] uppercase tracking-wide">
                Change Your Password
              </h3>
              <p className="text-[8.5px] font-semibold text-slate-400 mt-0.5 leading-tight">
                Create a strong, unique password to safeguard your farming assets.
              </p>
            </div>
          </div>

          {/* Inline Feedback Banner */}
          {statusMessage && (
            <div
              className={`mb-3 p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 relative z-10 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-700'
              }`}
            >
              <i
                className={`fa-solid ${
                  statusMessage.type === 'success' ? 'fa-circle-check text-emerald-600' : 'fa-circle-exclamation text-rose-500'
                }`}
              ></i>
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 relative z-10" autoComplete="off">
            {/* 1. Current Password */}
            <div>
              <label
                htmlFor="current_password"
                className="block text-[8px] font-black text-[#153d2b] uppercase tracking-wider mb-1 pl-0.5"
              >
                Current Password
              </label>
              <div className="relative">
                <i className="fa-solid fa-lock-open absolute left-3.5 top-1/2 -translate-y-1/2 text-[#15803d] text-xs pointer-events-none"></i>
                <input
                  type={showCurrent ? 'text' : 'password'}
                  id="current_password"
                  name="current_password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="input-farm w-full py-2.5 pl-9 pr-10 text-xs font-semibold text-slate-800 placeholder-slate-400"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#153d2b] text-xs"
                  aria-label="Toggle Current Password Visibility"
                >
                  <i className={`fa-solid ${showCurrent ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            {/* 2. New Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-[8px] font-black text-[#153d2b] uppercase tracking-wider mb-1 pl-0.5"
              >
                New Password
              </label>
              <div className="relative">
                <i className="fa-solid fa-key absolute left-3.5 top-1/2 -translate-y-1/2 text-[#15803d] text-xs pointer-events-none"></i>
                <input
                  type={showNew ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="input-farm w-full py-2.5 pl-9 pr-10 text-xs font-semibold text-slate-800 placeholder-slate-400"
                  placeholder="Enter new password (min 6 characters)"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#153d2b] text-xs"
                  aria-label="Toggle New Password Visibility"
                >
                  <i className={`fa-solid ${showNew ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            {/* 3. Confirm Password */}
            <div>
              <label
                htmlFor="password_confirmation"
                className="block text-[8px] font-black text-[#153d2b] uppercase tracking-wider mb-1 pl-0.5"
              >
                Confirm Password
              </label>
              <div className="relative">
                <i className="fa-solid fa-shield-halved absolute left-3.5 top-1/2 -translate-y-1/2 text-[#15803d] text-xs pointer-events-none"></i>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  id="password_confirmation"
                  name="password_confirmation"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="input-farm w-full py-2.5 pl-9 pr-10 text-xs font-semibold text-slate-800 placeholder-slate-400"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#153d2b] text-xs"
                  aria-label="Toggle Confirm Password Visibility"
                >
                  <i className={`fa-solid ${showConfirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            {/* 3D Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 bg-gradient-to-r from-[#153d2b] via-[#0d2c20] to-[#153d2b] hover:from-[#0d2c20] hover:to-[#082013] text-[#c9f36a] border border-[#c9f36a]/40 text-xs font-manrope font-black py-3 rounded-xl shadow-[0_4px_14px_rgba(21,61,43,0.25)] active:scale-95 transition-all flex justify-center items-center gap-2 cursor-pointer uppercase tracking-wider"
            >
              <i className={`fa-solid ${isSubmitting ? 'fa-circle-notch fa-spin text-xs' : 'fa-circle-check text-xs'}`}></i>
              <span>{isSubmitting ? 'Updating Password...' : 'Update Password'}</span>
            </button>
          </form>
        </div>

        {/* Footer Trust Info */}
        <div className="text-center mt-5">
          <p className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
            <i className="fa-solid fa-shield-halved text-[#15803d]"></i>
            <span>Your security and digital assets are fully protected</span>
          </p>
        </div>
      </div>
    </AppShell>
  );
}
