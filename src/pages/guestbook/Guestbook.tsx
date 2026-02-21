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
	const { t } = useTranslation()

	const showToast = (msg: string) => {
		setToast({ msg, visible: true })
		setTimeout(() => setToast((s) => ({ ...s, visible: false })), 3000)
	}

	return (
		<>
			<Header />
			<Aside />
			<Contents className="select-none">
				<article className="flex flex-col h-[calc(100vh-8rem)] sm:py-4 py-1 md:px-0 px-2 relative gap-3">
					{/* Page Header */}
					<div className="flex items-center justify-between max-w-5xl mx-auto w-full">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-primary/10 rounded-lg">
								<FiMessageSquare className="sm:w-7 sm:h-7 w-5 h-5 text-primary" />
							</div>
							<h1 className="text-[clamp(1.1rem,2vw,1.4rem)] font-extrabold tracking-tight text-white/90">
								{t("pages.guestbook.title")}
							</h1>
						</div>
						<button
							onClick={() => setShowForm(!showForm)}
							className="group cursor-pointer relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl sm:px-5 sm:py-2.5 px-3.5 py-2 text-sm font-bold transition-all duration-300 bg-linear-to-r from-primary via-blue-500 to-cyan-400 text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-105 active:scale-95 focus:outline-none"
						>
							<FaPencil className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5" />
							<span className="hidden sm:inline">{showForm ? '폼 닫기' : '방명록 등록'}</span>
							<span className="sm:hidden">{showForm ? '닫기' : '등록'}</span>
							<div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
						</button>
					</div>

					{/* List */}
					<div className="sm:p-4 p-2 m-auto overflow-y-auto scrolls w-full h-full max-w-5xl">
						<GuestbookList handleToggleForm={() => setShowForm(true)} onSuccess={(m) => showToast(m)} />
					</div>

					{/* Create Form Modal */}
					{showForm && (
						<>
							<div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
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

					{/* Toast */}
					{toast.visible && (
						<div className="fixed left-1/2 -translate-x-1/2 top-6 z-60">
							<div className="px-5 py-2.5 bg-primary text-white rounded-xl shadow-xl text-sm font-medium animate-in slide-in-from-top duration-200">
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
