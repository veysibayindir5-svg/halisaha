// Admin layout - minimal, auth handled per-page client-side

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
