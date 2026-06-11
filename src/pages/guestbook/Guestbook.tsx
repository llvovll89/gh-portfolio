import { useState, useEffect } from 'react'
import { Header } from '@/components/header/Header'
import { Aside } from '@/components/aside/Aside'
import { Contents } from '@/components/contents/Contents'
import GuestbookForm from './GuestbookForm'
import GuestbookList from './GuestbookList'
import { FiMessageSquare } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import { FaPencil } from 'react-icons/fa6'
import { useToast } from '@/context/ToastContext'
import { useSeoMeta } from '@/hooks/useSeoMeta'

export const Guestbook = () => {
	const [showForm, setShowForm] = useState(false)
	const [entryCount, setEntryCount] = useState<number | null>(null)
	const { t } = useTranslation()
	const { showToast } = useToast()
	useSeoMeta({ title: "Guestbook", description: "김건호 포트폴리오 방명록 — 방문 소감이나 메시지를 남겨주세요", url: "/guestbook" })

	useEffect(() => {
		if (!showForm) return;
		const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowForm(false); };
		document.addEventListener('keydown', onKey);
		return () => document.removeEventListener('keydown', onKey);
	}, [showForm]);

	return (
		<>
			<Header />
			<Aside />
			<Contents className="select-none">
				<article className="flex flex-col h-full sm:py-4 py-2 md:px-0 px-2 relative gap-3 overflow-hidden">

					{/* Hero Header */}
					<div className="relative max-w-5xl mx-auto w-full rounded-2xl overflow-hidden border border-white/8 bg-[#111115]">
						{/* Ambient orbs */}
						<div className="pointer-events-none absolute -top-16 -left-16 w-56 h-56 bg-primary/10 rounded-full blur-3xl" />
						<div className="pointer-events-none absolute -bottom-12 right-8 w-40 h-40 bg-blue-500/6 rounded-full blur-2xl" />

						<div className="relative flex items-center justify-between px-5 py-4 gap-4">
							<div className="flex items-center gap-4">
								<div className="p-2.5 rounded-xl bg-primary/15 border border-primary/25 shadow-lg shadow-primary/10">
									<FiMessageSquare className="sm:w-6 sm:h-6 w-5 h-5 text-primary" />
								</div>
								<div>
									<h1 className="text-[clamp(1rem,2vw,1.3rem)] font-extrabold tracking-tight text-white/95">
										{t("pages.guestbook.title")}
									</h1>
									<p className="text-xs text-white/35 mt-0.5 hidden sm:block">
										{t("pages.guestbook.subtitle")}
									</p>
								</div>
							</div>

							<div className="flex items-center gap-3 shrink-0">
								{entryCount !== null && (
									<div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/8">
										<span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
										<span className="text-xs text-white/50 font-medium">{t("pages.guestbook.entryCount", { count: entryCount })}</span>
									</div>
								)}
								<button
									onClick={() => setShowForm(!showForm)}
									className="group cursor-pointer relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl sm:px-5 sm:py-2.5 px-3.5 py-2 text-sm font-bold transition-all duration-300 text-white bg-primary hover:scale-105 active:scale-95 focus:outline-none"
								>
									<FaPencil className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5" />
									<span className="hidden sm:inline">{showForm ? t("pages.guestbook.close") : t("pages.guestbook.write")}</span>
									<div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
								</button>
							</div>
						</div>
					</div>

					{/* List */}
					<div className="m-auto w-full flex-1 max-w-5xl overflow-hidden">
						<GuestbookList
							handleToggleForm={() => setShowForm(true)}
							onSuccess={(m) => showToast(m)}
							onCountChange={setEntryCount}
						/>
					</div>

					{/* Create Form Modal */}
					{showForm && (
						<>
							<div className="fixed inset-0 bg-black/55 z-40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
							<div className="fixed left-0 right-0 bottom-0 z-50 md:inset-0 md:flex md:items-center md:justify-center md:p-4">
								<div className="w-full md:max-w-xl animate-in slide-in-from-bottom md:zoom-in-95 duration-200">
									<GuestbookForm
										handleToggleForm={() => setShowForm(false)}
										onSubmitted={(m) => { setShowForm(false); if (m) showToast(m) }}
									/>
								</div>
							</div>
						</>
					)}

				</article>
			</Contents>
		</>
	)
}

export default Guestbook
