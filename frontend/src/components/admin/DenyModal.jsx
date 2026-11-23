import { useEffect, useRef, useState } from "react";

const DenyModal = ({ request, submitting, onSubmit, onClose }) => {
    const dialogRef = useRef(null);
    const [reason, setReason] = useState("");

    useEffect(() => {
        dialogRef.current?.showModal();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!submitting) onSubmit(reason.trim());
    };

    return (
        <dialog ref={dialogRef} className="modal" onClose={onClose}>
            <div className="modal-box">
                <h3 className="text-lg font-bold">Deny {request.type} request</h3>
                <p className="mt-1 text-sm opacity-70">
                    {request.user?.username ?? "This user"} will be notified. A reason is optional, but it helps.
                </p>

                <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
                    <textarea
                        className="textarea w-full"
                        rows={3}
                        maxLength={200}
                        placeholder="Reason (optional)"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                    <span className="text-right text-xs opacity-50">{reason.length}/200</span>

                    <div className="modal-action mt-0">
                        <button type="button" className="btn btn-ghost" onClick={() => dialogRef.current?.close()}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-error" disabled={submitting}>
                            {submitting
                                ? <span className="loading loading-spinner loading-sm"></span>
                                : "Deny request"
                            }
                        </button>
                    </div>
                </form>
            </div>

            <form method="dialog" className="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>
    );
};

export default DenyModal;