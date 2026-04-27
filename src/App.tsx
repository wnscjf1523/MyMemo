/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Trash2, Tag, X, StickyNote, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---

type Note = {
  id: number;
  title: string;
  body: string;
  tags: string[];
  updatedAt: string;
};

// --- Constants ---

const LS_KEY = 'mymemo.notes';

const SEED_DATA: Note[] = [
  {
    id: 1,
    title: '시안 작업 가이드',
    body: 'UI/UX 디자인 시안 작업 시 준수해야 할 컬러 팔레트와 타이포그래피 가이드라인입니다.',
    tags: ['디자인', '가이드'],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: '읽어야 할 책 리스트',
    body: '클린 코드, 리팩터링 2판, 실용주의 프로그래머 등 올해 안에 꼭 읽어야 할 도서 목록.',
    tags: ['독서', '자기개발'],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: '프로젝트 아이디어',
    body: '나만의 포트폴리오 사이트 고도화, 오픈소스 기여, 새로운 프레임워크 학습 계획.',
    tags: ['업무', '개발'],
    updatedAt: new Date().toISOString(),
  },
];

// --- Main App Component ---

export default function App() {
  // State
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formBody, setFormBody] = useState('');
  const [formTags, setFormTags] = useState('');

  // Initial Load
  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to parse notes from storage', err);
        setNotes(SEED_DATA);
      }
    } else {
      setNotes(SEED_DATA);
      localStorage.setItem(LS_KEY, JSON.stringify(SEED_DATA));
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem(LS_KEY, JSON.stringify(notes));
    }
  }, [notes]);

  // Derived state: Tags
  const allTags = useMemo(() => {
    const tagMap = new Map<string, number>();
    notes.forEach((note) => {
      note.tags.forEach((tag) => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
      });
    });
    return Array.from(tagMap.entries()).sort((a, b) => b[1] - a[1]);
  }, [notes]);

  // Filtered Notes
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesSearch =
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesTag = selectedTag ? note.tags.includes(selectedTag) : true;
      return matchesSearch && matchesTag;
    });
  }, [notes, searchQuery, selectedTag]);

  // Handlers
  const handleOpenModal = (note?: Note) => {
    if (note) {
      setEditingNote(note);
      setFormTitle(note.title);
      setFormBody(note.body);
      setFormTags(note.tags.join(', '));
    } else {
      setEditingNote(null);
      setFormTitle('');
      setFormBody('');
      setFormTags('');
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingNote(null);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArr = formTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t !== '');

    if (editingNote) {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === editingNote.id
            ? {
                ...n,
                title: formTitle,
                body: formBody,
                tags: tagsArr,
                updatedAt: new Date().toISOString(),
              }
            : n
        )
      );
    } else {
      const newNote: Note = {
        id: Date.now(),
        title: formTitle,
        body: formBody,
        tags: tagsArr,
        updatedAt: new Date().toISOString(),
      };
      setNotes((prev) => [newNote, ...prev]);
    }
    handleCloseModal();
  };

  const handleDeleteNote = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (confirm('이 메모를 삭제하시겠습니까?')) {
      setNotes((prev) => prev.filter((n) => n.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9F4] text-[#3A3F33] font-sans">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-[#E0E4D9] bg-white shadow-sm flex items-center shrink-0">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#7D8C69] rounded-lg">
              <StickyNote className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#4A5043] hidden sm:block">MyMemo</h1>
          </div>

          <div className="flex flex-1 items-center justify-center px-4 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9DA68D]" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full bg-[#F0F2EB] py-2 pl-10 pr-4 text-sm outline-none transition-all focus:ring-2 focus:ring-[#7D8C69] border-none text-[#3A3F33] placeholder-[#9DA68D]"
              />
            </div>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 rounded-full bg-[#7D8C69] px-5 py-2 text-sm font-medium text-white transition-all hover:bg-[#6B7859] hover:scale-105 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Memo</span>
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl px-0 sm:px-0 lg:gap-0 min-h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <aside className="hidden w-[240px] flex-col lg:flex bg-[#F0F2EB] border-r border-[#E0E4D9] p-6">
          <div className="sticky top-24">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#9DA68D]">Filters</h2>
            <nav className="space-y-1">
              <button
                onClick={() => setSelectedTag(null)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-all ${
                  selectedTag === null ? 'bg-[#7D8C69] text-white shadow-sm font-medium' : 'text-[#5C6354] hover:bg-[#E5E9DE]'
                }`}
              >
                <span>All Notes</span>
                <span className={`text-xs ${selectedTag === null ? 'opacity-80' : 'text-[#7D8C69]'}`}>{notes.length}</span>
              </button>
            </nav>

            <h2 className="mt-8 mb-4 text-xs font-bold uppercase tracking-widest text-[#9DA68D]">Tags</h2>
            <nav className="space-y-1">
              {allTags.map(([tag, count]) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-all ${
                    selectedTag === tag ? 'bg-[#7D8C69] text-white shadow-sm font-medium' : 'text-[#5C6354] hover:bg-[#E5E9DE]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${selectedTag === tag ? 'bg-white' : 'bg-[#9DA68D]'}`} />
                    {tag}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full transition-all ${
                    selectedTag === tag ? 'bg-white/20 text-white' : 'bg-[#E5E9DE] text-[#7D8C69]'
                  }`}>{count}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 bg-[#F8F9F4] overflow-y-auto">
          {/* Mobile Tag Scroll */}
          <div className="mb-6 flex gap-2 overflow-x-auto pb-2 lg:hidden no-scrollbar">
            <button
              onClick={() => setSelectedTag(null)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                selectedTag === null ? 'bg-[#7D8C69] text-white shadow-md' : 'bg-[#F0F2EB] text-[#5C6354] hover:bg-[#E5E9DE]'
              }`}
            >
              All
            </button>
            {allTags.map(([tag]) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                  selectedTag === tag ? 'bg-[#7D8C69] text-white shadow-md' : 'bg-[#F0F2EB] text-[#5C6354] hover:bg-[#E5E9DE]'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence mode="popLayout" initial={false}>
              {filteredNotes.map((note) => (
                <motion.div
                  key={note.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  onClick={() => handleOpenModal(note)}
                  className="group relative flex flex-col h-72 cursor-pointer overflow-hidden rounded-2xl border border-[#E0E4D9] bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-[#7D8C69] hover:shadow-[#7D8C69]/10"
                >
                  <button
                    onClick={(e) => handleDeleteNote(e, note.id)}
                    className="absolute top-4 right-4 opacity-0 transition-all group-hover:opacity-100 p-2 text-[#9DA68D] hover:text-red-400 hover:bg-neutral-50 rounded-full"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <div className="mb-3">
                    <h3 className="line-clamp-1 pr-8 font-bold text-lg text-[#4A5043] leading-tight">
                      {note.title || 'Untitled'}
                    </h3>
                  </div>

                  <p className="line-clamp-5 flex-1 text-sm text-[#737A6A] leading-relaxed">
                    {note.body || 'No content...'}
                  </p>

                  <div className="mt-4 pt-4 border-t border-[#F0F2EB]">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {note.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#F0F2EB] text-[#7D8C69]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#9DA68D]">
                      <Clock className="h-3 w-3" />
                      Updated {new Date(note.updatedAt).toLocaleString('ko-KR', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredNotes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 rounded-full bg-[#F0F2EB] p-8">
                <Search className="h-12 w-12 text-[#C2C9B6]" />
              </div>
              <p className="text-[#5C6354] font-medium">No records found matching your search or filters.</p>
              {searchQuery || selectedTag ? (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedTag(null);
                  }}
                  className="mt-3 text-sm font-bold text-[#7D8C69] hover:text-[#6B7859] transition-colors"
                >
                  Clear all filters
                </button>
              ) : null}
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-[#3A3F33]/20 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-[500px] overflow-hidden rounded-[32px] bg-white shadow-2xl border border-[#E0E4D9]"
            >
              <div className="flex items-center justify-between px-8 pt-8">
                <h2 className="text-2xl font-bold text-[#4A5043]">{editingNote ? 'Edit Memo' : 'New Memo'}</h2>
                <button onClick={handleCloseModal} className="rounded-full p-2 hover:bg-[#F8F9F4] text-[#9DA68D] transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSaveNote} className="p-8">
                <div className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#9DA68D] mb-2">Title</label>
                    <input
                      type="text"
                      placeholder="Enter title..."
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full rounded-xl border-none bg-[#F8F9F4] px-4 py-3 text-sm focus:ring-2 focus:ring-[#7D8C69] outline-none text-[#3A3F33] placeholder-[#C2C9B6] transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#9DA68D] mb-2">Content</label>
                    <textarea
                      placeholder="Write your thoughts..."
                      rows={5}
                      value={formBody}
                      onChange={(e) => setFormBody(e.target.value)}
                      className="w-full resize-none rounded-xl border-none bg-[#F8F9F4] px-4 py-3 text-sm focus:ring-2 focus:ring-[#7D8C69] outline-none text-[#3A3F33] placeholder-[#C2C9B6] transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#9DA68D] mb-2">Tags (comma separated)</label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-3.5 h-4 w-4 text-[#9DA68D]" />
                      <input
                        type="text"
                        placeholder="design, study, work..."
                        value={formTags}
                        onChange={(e) => setFormTags(e.target.value)}
                        className="w-full rounded-xl border-none bg-[#F8F9F4] py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#7D8C69] outline-none text-[#3A3F33] placeholder-[#C2C9B6] transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 rounded-2xl bg-[#7D8C69] py-4 text-sm font-bold text-white shadow-lg shadow-[#7D8C69]/20 hover:bg-[#6B7859] hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Save Memo
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-8 rounded-2xl bg-[#F0F2EB] py-4 text-sm font-bold text-[#5C6354] hover:bg-[#E5E9DE] transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

