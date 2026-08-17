'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react'
import { adminLogin } from '@/lib/admin/actions'
import { loginSchema, type LoginFormData } from '@/lib/admin/schemas'

export function AdminLoginClient() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null)
    const result = await adminLogin(data.email, data.password)
    if (result.error) {
      setServerError(result.error)
    } else {
      router.push('/admin')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-[#0E0D0B] flex items-center justify-center p-4" dir="rtl">
      {/* Subtle ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-[#C8A96A]/6 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-[#1A1916] border border-[#C8A96A]/15 rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8 flex flex-col items-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 overflow-hidden">
              <img
                src="/masar-logo.png"
                alt="شعار مسار"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-[#F0E6D3] font-sans">لوحة تحكم مسار</h1>
            <p className="text-[#888] text-sm mt-1">تسجيل الدخول للمتابعة</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm text-[#C0B090] font-medium">البريد الإلكتروني</label>
              <div className="relative">
                <Mail size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666]" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="admin@masar.studio"
                  autoComplete="email"
                  className="w-full pr-10 pl-4 py-3 bg-[#0E0D0B] border border-[#333] rounded-xl text-[#F0E6D3] placeholder-[#555] text-sm focus:outline-none focus:border-[#C8A96A]/50 focus:ring-1 focus:ring-[#C8A96A]/30 transition-all"
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm text-[#C0B090] font-medium">كلمة المرور</label>
              <div className="relative">
                <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666]" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pr-10 pl-10 py-3 bg-[#0E0D0B] border border-[#333] rounded-xl text-[#F0E6D3] placeholder-[#555] text-sm focus:outline-none focus:border-[#C8A96A]/50 focus:ring-1 focus:ring-[#C8A96A]/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-[#C8A96A] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.password.message}
                </p>
              )}
            </div>

            {/* Server error */}
            {serverError && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-red-950/40 border border-red-800/40 rounded-xl text-red-400 text-sm"
              >
                <AlertCircle size={14} className="flex-shrink-0" />
                {serverError}
              </motion.div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#C8A96A] hover:bg-[#d4b87a] disabled:opacity-50 disabled:cursor-not-allowed text-[#0E0D0B] font-bold rounded-xl transition-all duration-200 text-sm tracking-wide"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  جاري تسجيل الدخول...
                </span>
              ) : 'تسجيل الدخول'}
            </button>
          </form>

          <p className="text-center text-[#555] text-xs mt-6">
            مسار — لوحة الإدارة الداخلية
          </p>
        </div>
      </motion.div>
    </div>
  )
}
