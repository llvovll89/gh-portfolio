import { useState } from 'react'
import { Header } from '@/components/header/Header'
import { Aside } from '@/components/aside/Aside'
import { Contents } from '@/components/contents/Contents'
import GuestbookForm from './GuestbookForm'
import GuestbookList from './GuestbookList'
import { FiMessageSquare } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import { FaPencil } from 'react-icons/fa6'

export const Guestbook = () => {
	const [showForm, setShowForm] = useState(false)
	const [toast, setToast] = useState<{ msg: string; visible: boolean }>({ msg: '', visible: false })
	const { t } = useTranslation();

	const handleToggleForm = () => {
		setShowForm(!showForm)
	};

	const showToast = (msg: string) => {
		setToast({ msg, visible: true })
		setTimeout(() => setToast((s) => ({ ...s, visible: false })), 3000)
	}

	return (
		<>
			<Header />
			<Aside />
			<Contents className="select-none">
				<article className="flex flex-col h-[calc(100vh-8rem)] sm:py-4 py-1 md:px-0 px-2 relative">
					<div className="flex items-center justify-between max-w-5xl mx-auto w-full">
						<div className="flex items-center gap-3 mb-3">
							<div className="p-2 bg-primary/10 rounded-lg">
								<FiMessageSquare className="w-8 h-8 text-primary" />
							</div>
							<h1 className="text-[clamp(1.8rem,3vw,2.5rem)] font-extrabold tracking-tight text-white/90">
								{t("pages.guestbook.title")}
							</h1>
						</div>
						<div className="flex items-center gap-2">
							<button
								onClick={handleToggleForm}
								className="group cursor-pointer relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl px-6 py-3 text-sm md:text-base font-bold transition-all duration-300 bg-linear-to-r from-primary via-blue-500 to-cyan-400 text-white shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2"
							>
								<FaPencil className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
								{showForm ? '폼 닫기' : '방명록 등록'}
								<div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
							</button>
						</div>
					</div>

					<div className="space-y-6 p-4 m-auto overflow-y-auto scrolls w-full h-full max-w-5xl">
						<GuestbookList handleToggleForm={handleToggleForm} onSuccess={(m) => showToast(m)} />
					</div>

					{showForm && (
						<>
							<div className="fixed inset-0 bg-black/40 z-40" onClick={() => setShowForm(false)} />
							<div className="fixed left-0 right-0 bottom-0 z-50 md:inset-0 md:flex md:items-center md:justify-center">
								<div className="mx-auto w-full max-w-xl md:relative md:translate-y-0 transform transition-transform duration-300 md:rounded-2xl">
									<div className="md:mx-0 md:my-0">
										<div className="md:hidden">
											<div className="fixed left-0 right-0 bottom-0 z-50">
												<div className="p-4 rounded-t-2xl shadow-xl">
													<GuestbookForm handleToggleForm={handleToggleForm} onSubmitted={(m) => { setShowForm(false); if (m) showToast(m) }} />
												</div>
											</div>
										</div>
										<div className="hidden md:block">
											<div className="mx-auto p-4">
												<GuestbookForm handleToggleForm={handleToggleForm} onSubmitted={(m) => { setShowForm(false); if (m) showToast(m) }} />
											</div>
										</div>
									</div>
								</div>
							</div>
						</>
					)}
					{toast.visible && (
						<div className="fixed left-1/2 -translate-x-1/2 top-6 z-60">
							<div className="px-4 py-2 bg-primary text-white rounded-md shadow-md animate-in slide-in-from-top">
								{toast.msg}
							</div>
						</div>
					)}
				</article>
			</Contents>
		</>
	)
}

export default Guestbook
