import { MailIcon, CalendarIcon } from "lucide-react"
import { formatDate } from "../lib/utils"

const ProfileHeader = ({user, loanCount}) => {
    return (
        <div className="card bg-base-100 shadow-sm">
            <div className="card-body gap-4 sm:flex-row sm:items-center">

                <div className="avatar avatar-placeholder">
                    <div className="size-16 rounded-full bg-primary text-primary-content">
                        <span className="text-2xl uppercase">
                            {user.username?.[0]}
                        </span>
                    </div>
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="truncate text-2xl font-bold" title={user.username}>{user.username}</h1>
                        <span className="badge badge-soft badge-primary capitalize">{user.role}</span>
                    </div>
                    <p className="mt-1 flex items-center gap-2 text-sm opacity-70">
                        <MailIcon className="size-4 shrink-0" />
                        <span className="truncate">{user.email}</span>
                    </p>
                    {user.createdAt && (
                        <p className="mt-1 flex items-center gap-2 text-sm opacity-70">
                            <CalendarIcon className="size-4 shrink-0" />
                            <span>Member since {formatDate(user.createdAt)}</span>
                        </p>
                    )}
                </div>

                <div className="stats bg-base-200">
                    <div className="stat px-6 py-3">
                        <div className="stat-title">
                            <div className="stat-value text-primary">
                                {loanCount}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default ProfileHeader
