import { useState, useEffect } from 'react';
import { Plus, Search, Library, Heart, ListFilter, ArrowRight, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { usePlaylistStore } from '../../stores/playlistStore';
import { useAuthStore } from '../../stores/authStore';
import { CreatePlaylistModal } from '../ui/CreatePlaylistModal';
import { EditPlaylistModal } from '../ui/EditPlaylistModal';
import { DeleteConfirmModal } from '../ui/DeleteConfirmModal';
import type { Playlist } from '../../types';

interface SidebarProps {
    onPlaylistSelect: (playlist: Playlist) => void;
    selectedPlaylistId: string | null;
}

export function Sidebar({ onPlaylistSelect, selectedPlaylistId }: SidebarProps) {
    const { playlists, createPlaylist, updatePlaylist, deletePlaylist, fetchPlaylists, isSyncing } = usePlaylistStore();
    const { user, openAuthModal } = useAuthStore();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedPlaylistForEdit, setSelectedPlaylistForEdit] = useState<Playlist | null>(null);
    const [showMenuForPlaylist, setShowMenuForPlaylist] = useState<string | null>(null);

    // Fetch playlists when component mounts or when user changes
    useEffect(() => {
        fetchPlaylists();
    }, [user, fetchPlaylists]);

    const handleCreatePlaylistClick = () => {
        // ถ้ายังไม่ login ให้เปิด auth modal
        if (!user) {
            openAuthModal('login');
            return;
        }
        // เปิด modal สำหรับกรอกชื่อ playlist
        setIsCreateModalOpen(true);
    };

    const handleCreatePlaylist = async (name: string, description?: string) => {
        await createPlaylist(name, description);
        setIsCreateModalOpen(false);
    };

    const handleEditClick = (playlist: Playlist, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedPlaylistForEdit(playlist);
        setIsEditModalOpen(true);
        setShowMenuForPlaylist(null);
    };

    const handleDeleteClick = (playlist: Playlist, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedPlaylistForEdit(playlist);
        setIsDeleteModalOpen(true);
        setShowMenuForPlaylist(null);
    };

    const handleSaveEdit = async (name: string, description?: string) => {
        if (selectedPlaylistForEdit) {
            await updatePlaylist(selectedPlaylistForEdit.id, { name, description });
            setIsEditModalOpen(false);
            setSelectedPlaylistForEdit(null);
        }
    };

    const handleConfirmDelete = async () => {
        if (selectedPlaylistForEdit) {
            await deletePlaylist(selectedPlaylistForEdit.id);
            setIsDeleteModalOpen(false);
            setSelectedPlaylistForEdit(null);
            // ถ้า playlist ที่ลบคือ playlist ที่กำลังเลือกอยู่ ให้ clear selection
            if (selectedPlaylistId === selectedPlaylistForEdit.id) {
                onPlaylistSelect(playlists.find(p => p.id === 'playlist_liked')!);
            }
        }
    };

    return (
        <aside className="flex h-full w-[300px] flex-col gap-2">
            {/* Library */}
            <div className="flex flex-1 flex-col rounded-lg bg-[#121212] overflow-hidden">
                {/* Header */}
                <div className="p-4 pb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[var(--color-spotify-light-gray)] hover:text-white transition-colors cursor-pointer">
                        <Library className="h-6 w-6" />
                        <span className="font-bold">คอลเลกชันของคุณ</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={handleCreatePlaylistClick}
                            className="rounded-full p-2 text-[var(--color-spotify-light-gray)] hover:text-white hover:bg-[var(--color-spotify-gray)] transition-all"
                            title="สร้างเพลย์ลิสต์"
                        >
                            <Plus className="h-5 w-5" />
                        </button>
                        <button 
                            className="rounded-full p-2 text-[var(--color-spotify-light-gray)] hover:text-white hover:bg-[var(--color-spotify-gray)] transition-all"
                            title="ขยายคอลเลกชัน"
                        >
                            <ArrowRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Filter Tags */}
                <div className="px-4 pb-2 flex gap-2">
                    <button className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-black">
                        เพลย์ลิสต์
                    </button>
                    <button className="rounded-full bg-[var(--color-spotify-gray)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#3e3e3e] transition-colors">
                        ศิลปิน
                    </button>
                </div>

                {/* Search and Sort */}
                <div className="px-4 py-2 flex items-center justify-between">
                    <button 
                        className="p-2 text-[var(--color-spotify-light-gray)] hover:text-white transition-colors"
                        title="ค้นหาในคอลเลกชัน"
                    >
                        <Search className="h-4 w-4" />
                    </button>
                    <button 
                        className="flex items-center gap-1 text-sm text-[var(--color-spotify-light-gray)] hover:text-white transition-colors"
                        title="เรียงลำดับ"
                    >
                        <span>เล่นล่าสุด</span>
                        <ListFilter className="h-4 w-4" />
                    </button>
                </div>

                {/* Playlist List */}
                <div className="flex-1 overflow-y-auto px-2 pb-2">
                    {/* Liked Songs - Pinned */}
                    <div
                        className={`flex cursor-pointer items-center gap-3 rounded-md p-2 transition-colors ${selectedPlaylistId === 'playlist_liked'
                            ? 'bg-[var(--color-spotify-gray)]'
                            : 'hover:bg-[var(--color-spotify-gray)]'
                            }`}
                        onClick={() => onPlaylistSelect(playlists.find(p => p.id === 'playlist_liked')!)}
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded bg-gradient-to-br from-[#450af5] to-[#c4efd9]">
                            <Heart className="h-5 w-5 text-white" fill="white" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <p className="truncate font-medium text-white">เพลงที่ถูกใจ</p>
                                <span className="text-[var(--color-spotify-green)]">📌</span>
                            </div>
                            <p className="truncate text-sm text-[var(--color-spotify-light-gray)]">
                                เพลย์ลิสต์ • {playlists.find(p => p.id === 'playlist_liked')?.songCount || 5} เพลง
                            </p>
                        </div>
                    </div>

                    {/* User Created Playlists */}
                    {playlists
                        .filter(p => p.id !== 'playlist_liked')
                        .map(playlist => (
                            <div
                                key={playlist.id}
                                className={`group relative flex cursor-pointer items-center gap-3 rounded-md p-2 transition-colors ${selectedPlaylistId === playlist.id
                                    ? 'bg-[var(--color-spotify-gray)]'
                                    : 'hover:bg-[var(--color-spotify-gray)]'
                                    }`}
                                onClick={() => onPlaylistSelect(playlist)}
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded bg-[var(--color-spotify-gray)]">
                                    <svg className="h-6 w-6 text-[var(--color-spotify-light-gray)]" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M6 3h15v15.167a3.5 3.5 0 11-3.5-3.5H19V5H8v13.167a3.5 3.5 0 11-3.5-3.5H6V3zm0 13.667H4.5a1.5 1.5 0 101.5 1.5v-1.5zm13 0h-1.5a1.5 1.5 0 101.5 1.5v-1.5z"/>
                                    </svg>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-medium text-white">{playlist.name}</p>
                                    <p className="truncate text-sm text-[var(--color-spotify-light-gray)]">
                                        เพลย์ลิสต์ • {playlist.songCount} เพลง
                                    </p>
                                </div>

                                {/* Menu Button */}
                                <div className="relative">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowMenuForPlaylist(showMenuForPlaylist === playlist.id ? null : playlist.id);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 rounded-full p-2 text-[var(--color-spotify-light-gray)] hover:text-white hover:bg-[#3e3e3e] transition-all"
                                    >
                                        <MoreHorizontal className="h-5 w-5" />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {showMenuForPlaylist === playlist.id && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-[100]"
                                                onClick={() => setShowMenuForPlaylist(null)}
                                            />
                                            <div className="absolute right-0 top-full mt-1 z-[101] w-48 rounded-md bg-[#282828] py-1 shadow-xl">
                                                <button
                                                    onClick={(e) => handleEditClick(playlist, e)}
                                                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-white hover:bg-[#3e3e3e] transition-colors"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                    แก้ไขเพลย์ลิสต์
                                                </button>
                                                <button
                                                    onClick={(e) => handleDeleteClick(playlist, e)}
                                                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-[#3e3e3e] transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    ลบเพลย์ลิสต์
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                </div>
            </div>

            {/* Create Playlist Modal */}
            <CreatePlaylistModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreate={handleCreatePlaylist}
                isLoading={isSyncing}
            />

            {/* Edit Playlist Modal */}
            <EditPlaylistModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedPlaylistForEdit(null);
                }}
                onSave={handleSaveEdit}
                playlistName={selectedPlaylistForEdit?.name || ''}
                playlistDescription={selectedPlaylistForEdit?.description}
                isLoading={isSyncing}
            />

            {/* Delete Confirm Modal */}
            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedPlaylistForEdit(null);
                }}
                onConfirm={handleConfirmDelete}
                playlistName={selectedPlaylistForEdit?.name || ''}
                isLoading={isSyncing}
            />
        </aside>
    );
}
