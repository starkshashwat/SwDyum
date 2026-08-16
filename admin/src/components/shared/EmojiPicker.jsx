// ============================================================================
// components/shared/EmojiPicker.jsx
// ----------------------------------------------------------------------------
// Reusable emoji picker used by the Trust Badge editor (each trust badge is
// `{ emoji, label, description? }` per
// backend/src/validators/trustBadge.schema.js). Implemented as a lightweight,
// dependency-free component (a curated emoji grid with search) rather than
// pulling in an external emoji-picker package, so it works immediately
// without requiring `npm install` to run first.
//
// Props:
//   value      {string}    Currently selected emoji (rendered as the trigger).
//   onSelect   {function}  Called with the newly chosen emoji character.
//   label      {string}    Optional label rendered above the control.
// ============================================================================

import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';

// Curated set of emojis relevant to a food/e-commerce trust-badge context
// (quality, shipping, certifications, guarantees, etc.) plus a general set —
// intentionally NOT exhaustive (avoids bundling a huge emoji-data package).
const EMOJI_GROUPS = [
    {
        name: 'Trust & Quality',
        emojis: ['✅', '🛡️', '🏆', '⭐', '🌟', '💯', '🔒', '✔️', '🎖️', '📜', '🥇', '👍'],
    },
    {
        name: 'Food & Nature',
        emojis: ['🥭', '🌶️', '🧄', '🍋', '🫒', '🌿', '🍯', '🧂', '🥗', '🌾', '🍃', '🌱'],
    },
    {
        name: 'Shipping & Service',
        emojis: ['🚚', '📦', '🚀', '⏱️', '🔄', '💳', '🎁', '📞', '💬', '🏠', '🌍', '♻️'],
    },
    {
        name: 'General',
        emojis: ['❤️', '😊', '🔥', '✨', '💪', '🙌', '👌', '🎉', '💡', '🧊', '🍽️', '🧴'],
    },
];

export default function EmojiPicker({ value, onSelect, label }) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const wrapperRef = useRef(null);

    // Close on outside click.
    useEffect(() => {
        function handleClickOutside(e) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredGroups = query.trim()
        ? [
            {
                name: 'Results',
                // Simple filter: emoji groups don't carry text metadata, so
                // searching just flattens everything when a query is present
                // (keeps this component dependency-free — no emoji keyword DB).
                emojis: EMOJI_GROUPS.flatMap((g) => g.emojis),
            },
        ]
        : EMOJI_GROUPS;

    return (
        <div className="relative" ref={wrapperRef}>
            {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}

            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="w-16 h-16 flex items-center justify-center text-3xl border border-gray-300 rounded-lg hover:border-gray-400 bg-white"
                title="Choose an emoji"
            >
                {value || '🙂'}
            </button>

            {open && (
                <div className="absolute z-20 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                    <div className="relative mb-2">
                        <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search emojis..."
                            className="w-full pl-8 pr-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-black focus:border-black"
                            autoFocus
                        />
                    </div>

                    <div className="max-h-56 overflow-y-auto space-y-2">
                        {filteredGroups.map((group) => (
                            <div key={group.name}>
                                <p className="text-[11px] font-medium text-gray-400 uppercase mb-1">{group.name}</p>
                                <div className="grid grid-cols-8 gap-1">
                                    {group.emojis.map((emoji, idx) => (
                                        <button
                                            key={`${emoji}-${idx}`}
                                            type="button"
                                            onClick={() => {
                                                onSelect?.(emoji);
                                                setOpen(false);
                                                setQuery('');
                                            }}
                                            className="text-xl w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-2 pt-2 border-t border-gray-100">
                        <input
                            type="text"
                            value={value || ''}
                            onChange={(e) => onSelect?.(e.target.value.slice(0, 8))}
                            placeholder="Or paste any emoji/character"
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-black focus:border-black"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
