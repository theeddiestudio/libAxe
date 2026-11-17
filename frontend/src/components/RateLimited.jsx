import { ZapIcon } from "lucide-react"

const RateLimited = () => (
    <div className="mx-auto mt-8 max-w-6xl px-4">
        <div className="flex items-center gap-6 rounded-3xl bg-base-300 px-8 py-6">
            <div className="rounded-full bg-base-200 p-3">
                <ZapIcon className="size-10" />
            </div>
            <div>
                <h1 className="text-2xl font-bold">
                    Too Many Requests
                </h1>
                <h2 className="text-lg font-semibold tracking-tight">
                    You have reached the rate limit.
                </h2>
                <h3 className="text-md">
                    Try again later for the best experience.
                </h3>
            </div>
        </div>
    </div>
)

export default RateLimited
