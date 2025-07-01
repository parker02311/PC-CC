import Link from "next/link";

export default function CoasterConverter() {
    return (
        <div>
            <main className="container mx-auto px-4 py-8 max-w-2xl flex-1">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-ctp-text mb-2">Error 404</h1>
                    <p className="text-ctp-subtext1">This is a single page website, <Link className="text-ctp-mauve hover:text-ctp-pink transition-all" href="/">click here to return</Link></p>
                </div>
            </main>
        </div>
    )
}
