import React, { useRef, useState } from 'react';
import { Camera, Trash2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

/**
 * ProfileImageUploader
 * ─────────────────────
 * A reusable component that shows the current profile photo (Cloudinary URL
 * or DiceBear fallback), lets the user click to upload a new image, and
 * exposes a delete button.
 *
 * Props:
 *   size        - 'sm' | 'md' | 'lg'  (default 'md')
 *   editable    - bool (default true) – show camera/delete controls
 *   className   - extra Tailwind classes for the wrapper
 */
export default function ProfileImageUploader({
    size = 'md',
    editable = true,
    className = '',
}) {
    const { user, uploadProfileImage, deleteProfileImage, getAvatarUrl } = useAuth();
    const fileInputRef = useRef(null);

    const [status, setStatus] = useState('idle'); // 'idle' | 'uploading' | 'success' | 'error'
    const [message, setMessage] = useState('');
    const [preview, setPreview] = useState(null);   // local preview URL

    // Dimension map
    const sizeMap = {
        sm: { wrapper: 'w-14 h-14', icon: 'w-4 h-4', camera: 'w-5 h-5 p-1', text: 'text-xs' },
        md: { wrapper: 'w-24 h-24', icon: 'w-6 h-6', camera: 'w-7 h-7 p-1.5', text: 'text-sm' },
        lg: { wrapper: 'w-32 h-32', icon: 'w-8 h-8', camera: 'w-9 h-9 p-2', text: 'text-base' },
    };
    const dim = sizeMap[size] || sizeMap.md;

    const avatarSrc = preview || getAvatarUrl();
    const hasCustom = !!(user?.profileImage?.url);

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show local preview immediately
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        setStatus('uploading');
        setMessage('');

        const result = await uploadProfileImage(file);

        URL.revokeObjectURL(objectUrl); // free memory
        setPreview(null);

        if (result.success) {
            setStatus('success');
            setMessage('Profile photo updated!');
        } else {
            setStatus('error');
            setMessage(result.message || 'Upload failed. Try again.');
        }

        // Clear status after 3 s
        setTimeout(() => { setStatus('idle'); setMessage(''); }, 3500);

        // Reset file input so the same file can be re-selected
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDelete = async () => {
        if (!hasCustom) return;
        setStatus('uploading');
        setMessage('');
        const result = await deleteProfileImage();
        if (result.success) {
            setStatus('success');
            setMessage('Photo removed.');
        } else {
            setStatus('error');
            setMessage(result.message || 'Delete failed.');
        }
        setTimeout(() => { setStatus('idle'); setMessage(''); }, 3000);
    };

    return (
        <div className={`flex flex-col items-center gap-3 ${className}`}>
            {/* Avatar ring */}
            <div className="relative group">
                <div
                    className={`${dim.wrapper} rounded-full overflow-hidden ring-4 ring-white shadow-lg bg-gradient-to-tr from-brand-600 to-indigo-600 shrink-0`}
                >
                    <img
                        src={avatarSrc}
                        alt={user?.name || 'Profile'}
                        className="w-full h-full object-cover"
                    />

                    {/* Uploading spinner overlay */}
                    {status === 'uploading' && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                            <Loader2 className={`${dim.icon} text-white animate-spin`} />
                        </div>
                    )}
                </div>

                {/* Camera button (hover or always visible on touch) */}
                {editable && status !== 'uploading' && (
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        title="Change photo"
                        className={`absolute bottom-0 right-0 ${dim.camera} bg-brand-600 hover:bg-brand-700 text-white rounded-full shadow-md transition-all ring-2 ring-white`}
                    >
                        <Camera className="w-full h-full" />
                    </button>
                )}
            </div>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
            />

            {/* Action buttons */}
            {editable && (
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={status === 'uploading'}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${dim.text} font-semibold bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors disabled:opacity-50`}
                    >
                        {status === 'uploading' ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <Camera className="w-3.5 h-3.5" />
                        )}
                        {status === 'uploading' ? 'Uploading…' : 'Change Photo'}
                    </button>

                    {hasCustom && status !== 'uploading' && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${dim.text} font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors`}
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            Remove
                        </button>
                    )}
                </div>
            )}

            {/* Status feedback */}
            {message && (
                <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${dim.text} font-medium ${status === 'success'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-red-50 text-red-600'
                        }`}
                >
                    {status === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                        <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    {message}
                </div>
            )}
        </div>
    );
}
