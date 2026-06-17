import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Plus, Pencil, Trash2, X, Network, MapPin, Landmark, Loader2 } from "lucide-react";
import { Button } from "~/components/common/ui/Button";
import { useGetAllHeritageNamesQuery } from "~/store/apis/heritageApi";
import {
  useGetAdminGraphNodesQuery,
  useGetAdminGraphEdgesQuery,
  useCreateGraphNodeMutation,
  useUpdateGraphNodeMutation,
  useDeleteGraphNodeMutation,
  useCreateGraphEdgeMutation,
  useDeleteGraphEdgeMutation,
} from "~/store/apis/graphAdminApi";
import MapPicker from "./MapPicker";

const NODE_TYPES = [
  { value: "dynasty", label: "Triều đại" },
  { value: "person", label: "Nhân vật" },
  { value: "enemy", label: "Đối phương" },
  { value: "event", label: "Sự kiện" },
  { value: "battle", label: "Trận chiến" },
  { value: "capital", label: "Kinh đô" },
  { value: "heritage", label: "Di sản" },
  { value: "artifact", label: "Di vật" },
];
const REL_SUGGESTIONS = ["PRECEDED", "RELATED_TO", "COMMANDED", "PART_OF", "FOUGHT_AT", "LOCATED_IN", "HAPPENED_AT"];

const field = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-heritage focus:outline-none";
const labelCls = "block text-xs font-medium text-muted-foreground mb-1";

const emptyNode = {
  id: "", name: "", type: "event", nameEn: "", year: "", yearStart: "", yearEnd: "",
  province: "", era: "", summary: "", mapPoint: false, lat: "", lng: "", heritageSlug: "",
};

function NodeModal({ open, onClose, initial, heritageOptions }) {
  const isEdit = !!initial?.id && initial.__edit;
  const [form, setForm] = useState(() => ({ ...emptyNode, ...initial }));
  const [createNode, { isLoading: creating }] = useCreateGraphNodeMutation();
  const [updateNode, { isLoading: updating }] = useUpdateGraphNodeMutation();
  if (!open) return null;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const numOrUndef = (v) => (v === "" || v == null ? undefined : Number(v));

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      type: form.type,
      nameEn: form.nameEn?.trim() || undefined,
      year: form.year?.trim() || undefined,
      yearStart: numOrUndef(form.yearStart),
      yearEnd: numOrUndef(form.yearEnd),
      province: form.province?.trim() || undefined,
      era: form.era?.trim() || undefined,
      summary: form.summary?.trim() || undefined,
      mapPoint: !!form.mapPoint,
      lat: numOrUndef(form.lat),
      lng: numOrUndef(form.lng),
      heritageSlug: form.heritageSlug || undefined,
    };
    try {
      if (isEdit) {
        await updateNode({ id: initial.id, ...payload }).unwrap();
        toast.success("Đã cập nhật node");
      } else {
        if (!/^[a-z0-9_]+$/.test(form.id)) {
          toast.error("ID chỉ gồm chữ thường, số và dấu _ (vd bach_dang_1288)");
          return;
        }
        await createNode({ id: form.id.trim(), ...payload }).unwrap();
        toast.success("Đã tạo node");
      }
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || "Lỗi lưu node");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
      <form onSubmit={submit} className="my-8 w-full max-w-2xl rounded-xl border border-border bg-card p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">{isEdit ? "Sửa node" : "Thêm node"}</h3>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-accent/20">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={labelCls}>ID {isEdit && "(không sửa)"}</label>
            <input className={field} value={form.id} disabled={isEdit}
              onChange={(e) => set("id", e.target.value)} placeholder="bach_dang_1288" />
          </div>
          <div>
            <label className={labelCls}>Loại *</label>
            <select className={field} value={form.type} onChange={(e) => set("type", e.target.value)}>
              {NODE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Tên *</label>
            <input className={field} value={form.name} onChange={(e) => set("name", e.target.value)} required />
          </div>
          <div>
            <label className={labelCls}>Tên tiếng Anh</label>
            <input className={field} value={form.nameEn} onChange={(e) => set("nameEn", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Năm (hiển thị)</label>
            <input className={field} value={form.year} onChange={(e) => set("year", e.target.value)} placeholder="1288" />
          </div>
          <div>
            <label className={labelCls}>Tỉnh / địa phương</label>
            <input className={field} value={form.province} onChange={(e) => set("province", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Năm bắt đầu</label>
            <input type="number" className={field} value={form.yearStart} onChange={(e) => set("yearStart", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Năm kết thúc</label>
            <input type="number" className={field} value={form.yearEnd} onChange={(e) => set("yearEnd", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Tóm tắt</label>
            <textarea className={field} rows={3} value={form.summary} onChange={(e) => set("summary", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Liên kết trang di tích (heritageSlug)</label>
            <select className={field} value={form.heritageSlug} onChange={(e) => set("heritageSlug", e.target.value)}>
              <option value="">— Không liên kết —</option>
              {heritageOptions.map((h) => <option key={h.slug} value={h.slug}>{h.title} ({h.slug})</option>)}
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm text-foreground sm:col-span-2">
            <input type="checkbox" checked={!!form.mapPoint} onChange={(e) => set("mapPoint", e.target.checked)} />
            Hiển thị trên bản đồ (cần có toạ độ)
          </label>

          {form.mapPoint && (
            <>
              <div>
                <label className={labelCls}>Vĩ độ (lat)</label>
                <input type="number" step="any" className={field} value={form.lat} onChange={(e) => set("lat", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Kinh độ (lng)</label>
                <input type="number" step="any" className={field} value={form.lng} onChange={(e) => set("lng", e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <MapPicker
                  value={form.lat !== "" && form.lng !== "" ? { lat: Number(form.lat), lng: Number(form.lng) } : null}
                  onPick={(lat, lng) => setForm((f) => ({ ...f, lat, lng }))}
                />
              </div>
            </>
          )}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>Huỷ</Button>
          <Button type="submit" disabled={creating || updating}>
            {(creating || updating) && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            {isEdit ? "Cập nhật" : "Tạo node"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function EdgeModal({ open, onClose, nodes }) {
  const [form, setForm] = useState({ fromId: "", toId: "", relation: "RELATED_TO" });
  const [createEdge, { isLoading }] = useCreateGraphEdgeMutation();
  if (!open) return null;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.fromId || !form.toId) return toast.error("Chọn node nguồn và đích");
    if (form.fromId === form.toId) return toast.error("Không thể nối node với chính nó");
    try {
      await createEdge({ fromId: form.fromId, toId: form.toId, relation: form.relation.trim() || "RELATED_TO" }).unwrap();
      toast.success("Đã tạo cạnh");
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || "Lỗi tạo cạnh");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4">
      <form onSubmit={submit} className="my-12 w-full max-w-lg rounded-xl border border-border bg-card p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Thêm cạnh (quan hệ)</h3>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-accent/20">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Node nguồn *</label>
            <select className={field} value={form.fromId} onChange={(e) => set("fromId", e.target.value)}>
              <option value="">— Chọn —</option>
              {nodes.map((n) => <option key={n.id} value={n.id}>{n.name} ({n.id})</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Quan hệ</label>
            <input className={field} list="rel-suggestions" value={form.relation} onChange={(e) => set("relation", e.target.value)} />
            <datalist id="rel-suggestions">
              {REL_SUGGESTIONS.map((r) => <option key={r} value={r} />)}
            </datalist>
          </div>
          <div>
            <label className={labelCls}>Node đích *</label>
            <select className={field} value={form.toId} onChange={(e) => set("toId", e.target.value)}>
              <option value="">— Chọn —</option>
              {nodes.map((n) => <option key={n.id} value={n.id}>{n.name} ({n.id})</option>)}
            </select>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>Huỷ</Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}Tạo cạnh
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function GraphManagement() {
  const [tab, setTab] = useState("nodes");
  const [nodeModal, setNodeModal] = useState(null); // null | {} | node
  const [edgeModal, setEdgeModal] = useState(false);

  const { data: nodes = [], isLoading: nodesLoading } = useGetAdminGraphNodesQuery();
  const { data: edges = [], isLoading: edgesLoading } = useGetAdminGraphEdgesQuery();
  const { data: heritageNames = [] } = useGetAllHeritageNamesQuery();
  const [deleteNode] = useDeleteGraphNodeMutation();
  const [deleteEdge] = useDeleteGraphEdgeMutation();

  const heritageOptions = useMemo(
    () => (heritageNames || [])
      .map((h) => ({ slug: h.slug || h.nameSlug, title: h.title || h.name }))
      .filter((h) => h.slug),
    [heritageNames],
  );
  const nodeName = useMemo(() => Object.fromEntries(nodes.map((n) => [n.id, n.name])), [nodes]);

  const onDeleteNode = async (n) => {
    if (!window.confirm(`Xoá node "${n.name}" và mọi cạnh liên quan?`)) return;
    try { await deleteNode(n.id).unwrap(); toast.success("Đã xoá node"); }
    catch (e) { toast.error(e?.data?.message || "Lỗi xoá"); }
  };
  const onDeleteEdge = async (ed) => {
    if (!window.confirm("Xoá cạnh này?")) return;
    try { await deleteEdge(ed.id).unwrap(); toast.success("Đã xoá cạnh"); }
    catch (e) { toast.error(e?.data?.message || "Lỗi xoá"); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <Network className="h-5 w-5 text-heritage" /> Bản đồ Lịch sử
          </h1>
          <p className="text-sm text-muted-foreground">Quản lý node (nhân vật, trận đánh, di sản…) và quan hệ trên bản đồ.</p>
        </div>
        {tab === "nodes" ? (
          <Button onClick={() => setNodeModal({})}><Plus className="mr-1.5 h-4 w-4" /> Thêm node</Button>
        ) : (
          <Button onClick={() => setEdgeModal(true)}><Plus className="mr-1.5 h-4 w-4" /> Thêm cạnh</Button>
        )}
      </div>

      <div className="flex gap-1 rounded-lg border border-border bg-card p-1 w-fit">
        {[["nodes", `Node (${nodes.length})`], ["edges", `Cạnh (${edges.length})`]].map(([k, lbl]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium ${tab === k ? "bg-heritage/15 text-heritage-dark" : "text-muted-foreground hover:text-foreground"}`}>
            {lbl}
          </button>
        ))}
      </div>

      {tab === "nodes" ? (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Tên</th><th className="px-4 py-3">Loại</th>
                <th className="px-4 py-3">Bản đồ</th><th className="px-4 py-3">Di tích</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {nodesLoading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Đang tải…</td></tr>
              ) : nodes.map((n) => (
                <tr key={n.id} className="border-b border-border/60 hover:bg-accent/5">
                  <td className="px-4 py-2.5">
                    <div className="font-medium text-foreground">{n.name}</div>
                    <div className="text-xs text-muted-foreground">{n.id}</div>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{NODE_TYPES.find((t) => t.value === n.type)?.label || n.type}</td>
                  <td className="px-4 py-2.5">{n.mapPoint ? <MapPin className="h-4 w-4 text-heritage" /> : <span className="text-muted-foreground">—</span>}</td>
                  <td className="px-4 py-2.5">{n.heritageSlug ? <span className="inline-flex items-center gap-1 text-xs text-heritage"><Landmark className="h-3 w-3" />{n.heritageSlug}</span> : <span className="text-muted-foreground">—</span>}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setNodeModal({ ...n, __edit: true })} title="Sửa"><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => onDeleteNode(n)} title="Xoá"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-xs uppercase text-muted-foreground">
              <tr><th className="px-4 py-3">Nguồn</th><th className="px-4 py-3">Quan hệ</th><th className="px-4 py-3">Đích</th><th className="px-4 py-3 text-right">Thao tác</th></tr>
            </thead>
            <tbody>
              {edgesLoading ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Đang tải…</td></tr>
              ) : edges.map((ed) => (
                <tr key={ed.id} className="border-b border-border/60 hover:bg-accent/5">
                  <td className="px-4 py-2.5 text-foreground">{nodeName[ed.fromId] || ed.fromId}</td>
                  <td className="px-4 py-2.5"><span className="rounded bg-heritage/10 px-2 py-0.5 text-xs font-medium text-heritage">{ed.relation}</span></td>
                  <td className="px-4 py-2.5 text-foreground">{nodeName[ed.toId] || ed.toId}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex justify-end">
                      <Button size="icon" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => onDeleteEdge(ed)} title="Xoá"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {nodeModal && (
        <NodeModal open onClose={() => setNodeModal(null)} initial={nodeModal} heritageOptions={heritageOptions} />
      )}
      <EdgeModal open={edgeModal} onClose={() => setEdgeModal(false)} nodes={nodes} />
    </div>
  );
}
