import { useState, useEffect } from 'react'
import { Header } from '@/components/header/Header'
import { Aside } from '@/components/aside/Aside'
import { Contents } from '@/components/contents/Contents'
import GuestbookForm from './GuestbookForm'
import GuestbookList from './GuestbookList'
import { LuMessageSquare, LuPencilLine } from 'react-icons/lu'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/context/ToastContext'
import { useSeoMeta } from '@/hooks/useSeoMeta'

export const Guestbook = () => {
	const [showForm, setShowForm] = useState(false)
	const [entryCount, setEntryCount] = useState<number | null>(null)
	const { t } = useTranslation()
	const { showToast } = useToast()
	useSeoMeta({ title: "Guestbook", description: "김건호 포트폴리오 방명록 — 방문 소감이나 메시지를 남겨주세요", url: "/guestbook" })

	useEffect(() => {
		if (!showForm) return
		const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowForm(false) }
		document.addEventListener('keydown', onKey)
		return () => document.removeEventListener('keydown', onKey)
	}, [showForm])

	return (
		<>
			<Header />
			<Aside />
			<Contents className="select-none">
				<article className="flex flex-col h-full sm:py-4 py-2 md:px-0 px-2 relative gap-3 overflow-hidden">

					{/* 상단 헤더 바 */}
					<div className="relative max-w-5xl mx-auto w-full rounded-xl overflow-hidden border border-white/8 shrink-0">
						<div className="absolute inset-0 bg-linear-to-br from-[#0d1117] via-[#111115] to-[#0d0d14]" />
						<div
							className="absolute inset-0 opacity-[0.03]"
							style={{
								backgroundImage: 'linear-gradient(rgba(0,153,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,153,255,1) 1px, transparent 1px)',
								backgroundSize: '36px 36px',
							}}
						/>
						<div className="pointer-events-none absolute -top-16 -left-16 w-64 h-64 bg-primary/12 rounded-full blur-3xl" />

						<div className="relative flex items-center justify-between px-5 py-4 gap-4">
							<div className="flex items-center gap-3.5">
								<div className="relative shrink-0">
									<div className="p-2.5 rounded-xl bg-primary/15 border border-primary/28 shadow-lg shadow-primary/10">
										<LuMessageSquare className="sm:w-6 sm:h-6 w-5 h-5 text-primary" />
									</div>
									<div className="absolute inset-0 rounded-xl bg-primary/20 blur-md -z-10 scale-110" />
								</div>
								<div>
									<h1 className="text-[clamp(1rem,2.5vw,1.35rem)] font-extrabold tracking-tight bg-linear-to-r from-white via-white/95 to-white/55 bg-clip-text text-transparent">
										{t("pages.guestbook.title")}
									</h1>
									<p className="text-xs text-white/32 mt-0.5 hidden sm:block">
										{t("pages.guestbook.subtitle")}
									</p>
								</div>
							</div>

							<div className="flex items-center gap-3 shrink-0">
								{entryCount !== null && (
									<div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/8 border border-primary/16">
										<span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
										<span className="text-xs font-semibold text-primary/85">
											{t("pages.guestbook.entryCount", { count: entryCount })}
										</span>
									</div>
								)}
								<button
									onClick={() => setShowForm(!showForm)}
									className="group cursor-pointer relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl sm:px-4 sm:py-2 px-3 py-1.5 text-sm font-bold transition-all duration-200 text-white bg-linear-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-400 hover:scale-105 active:scale-95 shadow-md shadow-primary/20 focus:outline-none"
								>
									<LuPencilLine className="w-3.5 h-3.5 shrink-0" />
									<span className="hidden sm:inline">{showForm ? t("pages.guestbook.close") : t("pages.guestbook.write")}</span>
									<div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-600" />
								</button>
							</div>
						</div>
					</div>

					{/* 게시판 목록 */}
					<div className="m-auto w-full flex-1 max-w-5xl overflow-hidden">
						<GuestbookList
							handleToggleForm={() => setShowForm(true)}
							onSuccess={(m) => showToast(m)}
							onCountChange={setEntryCount}
						/>
					</div>

					{/* 글쓰기 폼 모달 */}
					{showForm && (
						<>
							<div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
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
