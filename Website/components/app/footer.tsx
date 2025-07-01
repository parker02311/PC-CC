export default function Footer() {
    return (
        <footer className="border-t border-ctp-surface0 bg-ctp-mantle mt-auto">
            <div className="container mx-auto px-4 py-4">
                <div className="text-center space-y-2">
                    <div className="text-sm text-ctp-subtext1">
                        <div className="flex justify-center gap-4">
                            <span>
                                Made With <span className="animate-pulse">❤️</span> <a target="_blank" href="https://parker02311.redon.tech" className="text-ctp-mauve text-shadow-[0_0_10px] text-shadow-ctp-mauve/50 hover:text-ctp-pink hover:text-shadow-ctp-pink/50 transition-all">Parker</a>
                            </span>
                            <span>
                                Original Converter Code by <a target="_blank" href="https://github.com/Distantz" className="text-ctp-mauve hover:text-ctp-pink transition-all">Distantz</a>
                            </span>
                        </div>
                        <p className="text-xs mt-1">
                            PC:CC is not affiliated with Planet Coaster 2 or Frontier Developments.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}