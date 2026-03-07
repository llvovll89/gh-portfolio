export type GuestbookEntry = {
    id: string
    name: string
    message: string
    pwHash: string
    createdAt?: { toDate: () => Date }
}
