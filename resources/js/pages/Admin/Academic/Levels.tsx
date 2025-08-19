import { Header } from '@/components/admin/header';
import { Sidebar } from '@/components/admin/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Link, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { ArrowLeft, Plus, Save as SaveIcon, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';

interface User { name: string; email: string; user_role: string }
interface Level { id: number; key: string; name: string; sort_order: number; is_active: boolean }

export default function Levels({ user, levels = [] }: { user: User; levels?: Level[] }) {
    const [form, setForm] = useState({ key: '', name: '', sort_order: 0, is_active: true });
    const [modalOpen, setModalOpen] = useState(false);
    const [editModal, setEditModal] = useState<Level | null>(null);
    const [edited, setEdited] = useState<Record<number, Level>>(
        () => levels.reduce((acc, l) => { acc[l.id] = { ...l }; return acc; }, {} as Record<number, Level>)
    );
    const [filter, setFilter] = useState('');

    const sorted = useMemo(() => Object.values(edited).sort((a, b) => a.sort_order - b.sort_order), [edited]);
    const visible = useMemo(
        () => sorted.filter(l => `${l.key} ${l.name}`.toLowerCase().includes(filter.toLowerCase())),
        [sorted, filter]
    );

    const submit = () => {
        router.post(route('admin.academic.levels.store'), form, {
            preserveScroll: true,
            onSuccess: () => { setForm({ key: '', name: '', sort_order: 0, is_active: true }); setModalOpen(false); },
        });
    };
    const update = (level: Level) => {
        router.put(route('admin.academic.levels.update', level.id), level, { preserveScroll: true, onSuccess: () => setEditModal(null) });
    };
    const destroyLevel = (level: Level) => {
        if (confirm(`Delete ${level.name}?`)) {
            router.delete(route('admin.academic.levels.destroy', level.id), { preserveScroll: true });
        }
    };
    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />
                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <div className="mb-4">
                        <Link href={route('admin.academic.index')}>
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                                <ArrowLeft className="h-4 w-4" /> Back to Academic & Curriculum
                            </Button>
                        </Link>
                    </div>
                    <Card>
                        <CardHeader><CardTitle>Define academic levels</CardTitle></CardHeader>
                        <CardContent>
                            <div className="grid gap-6">
                                <div className="flex items-center justify-between">
                                    <div className="font-semibold">Levels</div>
                                    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                                        <DialogTrigger asChild>
                                            <Button className="flex items-center gap-2"><Plus className="h-4 w-4" /> Add Level</Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Add new level</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-3">
                                                <div>
                                                    <Label htmlFor="level-key">Key</Label>
                                                    <Input id="level-key" placeholder="e.g., senior_highschool" value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} />
                                                </div>
                                                <div>
                                                    <Label htmlFor="level-name">Name</Label>
                                                    <Input id="level-name" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                                                </div>
                                                <div>
                                                    <Label htmlFor="level-sort">Sort order</Label>
                                                    <Input id="level-sort" placeholder="0" type="number" min={0} value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
                                                </div>
                                                <label className="flex items-center gap-2 text-sm"><Checkbox checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: Boolean(v) })} /> Active</label>
                                            </div>
                                            <DialogFooter>
                                                <Button onClick={submit}>Save</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-semibold">Existing levels</h3>
                                        <div className="w-64">
                                            <Input placeholder="Search by key or name" value={filter} onChange={(e) => setFilter(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto rounded border">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 dark:bg-gray-800">
                                                <tr>
                                                    <th className="text-left p-3 w-[22%]">Key</th>
                                                    <th className="text-left p-3 w-[28%]">Name</th>
                                                    <th className="text-left p-3 w-[14%]">Sort</th>
                                                    <th className="text-left p-3 w-[14%]">Active</th>
                                                    <th className="text-left p-3">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {visible.map((lvl) => (
                                                    <tr key={lvl.id} className="border-t">
                                                        <td className="p-3 align-middle">
                                                            <Input value={edited[lvl.id].key} onChange={(e) => setEdited({ ...edited, [lvl.id]: { ...edited[lvl.id], key: e.target.value } })} />
                                                        </td>
                                                        <td className="p-3 align-middle">
                                                            <Input value={edited[lvl.id].name} onChange={(e) => setEdited({ ...edited, [lvl.id]: { ...edited[lvl.id], name: e.target.value } })} />
                                                        </td>
                                                        <td className="p-3 align-middle">
                                                            <div className="flex items-center gap-2">
                                                                <Button variant="outline" size="icon" onClick={() => setEdited({ ...edited, [lvl.id]: { ...edited[lvl.id], sort_order: Math.max(0, edited[lvl.id].sort_order - 1) } })}>
                                                                    <ArrowUp className="h-4 w-4" />
                                                                </Button>
                                                                <Input className="w-16" type="number" min={0} value={edited[lvl.id].sort_order} onChange={(e) => setEdited({ ...edited, [lvl.id]: { ...edited[lvl.id], sort_order: Number(e.target.value) } })} />
                                                                <Button variant="outline" size="icon" onClick={() => setEdited({ ...edited, [lvl.id]: { ...edited[lvl.id], sort_order: edited[lvl.id].sort_order + 1 } })}>
                                                                    <ArrowDown className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                        <td className="p-3 align-middle">
                                                            <label className="flex items-center gap-2 text-sm"><Checkbox checked={edited[lvl.id].is_active} onCheckedChange={(v) => setEdited({ ...edited, [lvl.id]: { ...edited[lvl.id], is_active: Boolean(v) } })} /> Active</label>
                                                        </td>
                                                        <td className="p-3 align-middle">
                                                            <div className="flex items-center gap-2">
                                                                <Button variant="outline" className="flex items-center gap-2" onClick={() => setEditModal(edited[lvl.id])}>Edit</Button>
                                                                <Button variant="destructive" className="flex items-center gap-2" onClick={() => destroyLevel(lvl)}><Trash2 className="h-4 w-4" /> Delete</Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {visible.length === 0 && (
                                                    <tr>
                                                        <td colSpan={5} className="p-4 text-sm text-gray-500">No levels match your search.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Edit modal */}
                    <Dialog open={!!editModal} onOpenChange={(open) => !open && setEditModal(null)}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit level</DialogTitle>
                            </DialogHeader>
                            {editModal && (
                                <div className="space-y-3">
                                    <div>
                                        <Label>Key</Label>
                                        <Input value={editModal.key} onChange={(e) => setEditModal({ ...editModal, key: e.target.value })} />
                                    </div>
                                    <div>
                                        <Label>Name</Label>
                                        <Input value={editModal.name} onChange={(e) => setEditModal({ ...editModal, name: e.target.value })} />
                                    </div>
                                    <div>
                                        <Label>Sort order</Label>
                                        <Input type="number" min={0} value={editModal.sort_order} onChange={(e) => setEditModal({ ...editModal, sort_order: Number(e.target.value) })} />
                                    </div>
                                    <label className="flex items-center gap-2 text-sm"><Checkbox checked={editModal.is_active} onCheckedChange={(v) => setEditModal({ ...editModal, is_active: Boolean(v) })} /> Active</label>
                                </div>
                            )}
                            <DialogFooter>
                                {editModal && (
                                    <Button onClick={() => update(editModal)} className="flex items-center gap-2"><SaveIcon className="h-4 w-4" /> Save</Button>
                                )}
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </main>
            </div>
        </div>
    );
}


