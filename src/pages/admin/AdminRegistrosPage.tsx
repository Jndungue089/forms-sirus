import { useState, type FormEvent } from "react";
import { useData } from "../../context/DataContext";

interface EditState {
  data: string;
  viewsTiktok: string;
  viewsYoutube: string;
  viewsFacebook: string;
  cortes: string;
  links: string;
}

export default function AdminRegistrosPage() {
  const { registros, participantes, addRegistro, updateRegistro, deleteRegistro } = useData();

  const [participanteId, setParticipanteId] = useState("");
  const [data, setData] = useState("");
  const [viewsTiktok, setViewsTiktok] = useState("");
  const [viewsYoutube, setViewsYoutube] = useState("");
  const [viewsFacebook, setViewsFacebook] = useState("");
  const [cortes, setCortes] = useState("");
  const [links, setLinks] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditState | null>(null);

  const adicionar = async (e: FormEvent) => {
    e.preventDefault();
    if (!participanteId || !data) return;
    setErro(null);
    setEnviando(true);
    try {
      await addRegistro({
        participanteId,
        data,
        viewsTiktok: Number(viewsTiktok) || 0,
        viewsYoutube: Number(viewsYoutube) || 0,
        viewsFacebook: Number(viewsFacebook) || 0,
        cortes: Number(cortes) || 0,
        links,
      });
      setParticipanteId("");
      setData("");
      setViewsTiktok("");
      setViewsYoutube("");
      setViewsFacebook("");
      setCortes("");
      setLinks("");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível adicionar o registo.");
    } finally {
      setEnviando(false);
    }
  };

  const iniciarEdicao = (id: number) => {
    const r = registros.find((x) => x.id === id);
    if (!r) return;
    setErro(null);
    setEditId(id);
    setEditForm({
      data: r.data,
      viewsTiktok: String(r.viewsTiktok),
      viewsYoutube: String(r.viewsYoutube),
      viewsFacebook: String(r.viewsFacebook),
      cortes: String(r.cortes),
      links: r.links ?? "",
    });
  };

  const cancelar = () => {
    setEditId(null);
    setEditForm(null);
  };

  const guardar = async (id: number) => {
    if (!editForm) return;
    try {
      await updateRegistro(id, {
        data: editForm.data,
        viewsTiktok: Number(editForm.viewsTiktok) || 0,
        viewsYoutube: Number(editForm.viewsYoutube) || 0,
        viewsFacebook: Number(editForm.viewsFacebook) || 0,
        cortes: Number(editForm.cortes) || 0,
        links: editForm.links,
      });
      cancelar();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível guardar o registo.");
    }
  };

  const remover = async (id: number) => {
    if (!window.confirm("Remover este registo?")) return;
    setErro(null);
    try {
      await deleteRegistro(id);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível remover o registo.");
    }
  };

  return (
    <div className="admin-section">
      <div className="admin-section-head">
        <h2>Registos</h2>
        <span className="hint">{registros.length} no total</span>
      </div>
      {erro && <p className="erro">{erro}</p>}

      <form className="admin-inline-form" onSubmit={adicionar}>
        <select value={participanteId} onChange={(e) => setParticipanteId(e.target.value)} required>
          <option value="">Participante…</option>
          {participantes.map((p) => (
            <option key={p.id} value={p.id}>
              {p.id} — {p.nome}
            </option>
          ))}
        </select>
        <input type="date" value={data} onChange={(e) => setData(e.target.value)} required />
        <input type="number" min={0} placeholder="Views TikTok" value={viewsTiktok} onChange={(e) => setViewsTiktok(e.target.value)} />
        <input type="number" min={0} placeholder="Views YouTube" value={viewsYoutube} onChange={(e) => setViewsYoutube(e.target.value)} />
        <input
          type="number"
          min={0}
          placeholder="Views Facebook"
          value={viewsFacebook}
          onChange={(e) => setViewsFacebook(e.target.value)}
        />
        <input type="number" min={0} placeholder="Cortes" value={cortes} onChange={(e) => setCortes(e.target.value)} />
        <input placeholder="Links (opcional)" value={links} onChange={(e) => setLinks(e.target.value)} />
        <button className="btn btn-secundario btn-small" type="submit" disabled={enviando}>
          {enviando ? "A adicionar…" : "Adicionar registo"}
        </button>
      </form>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Participante</th>
              <th>Data</th>
              <th>TikTok</th>
              <th>YouTube</th>
              <th>Facebook</th>
              <th>Cortes</th>
              <th>Links</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {registros.map((r) => {
              const editando = editId === r.id;
              const participante = participantes.find((p) => p.id === r.participanteId);
              return editando && editForm ? (
                <tr key={r.id} className="admin-row-editing">
                  <td data-label="ID">{r.id}</td>
                  <td data-label="Participante">{r.participanteId}</td>
                  <td data-label="Data">
                    <input value={editForm.data} onChange={(e) => setEditForm({ ...editForm, data: e.target.value })} />
                  </td>
                  <td data-label="TikTok">
                    <input
                      type="number"
                      value={editForm.viewsTiktok}
                      onChange={(e) => setEditForm({ ...editForm, viewsTiktok: e.target.value })}
                    />
                  </td>
                  <td data-label="YouTube">
                    <input
                      type="number"
                      value={editForm.viewsYoutube}
                      onChange={(e) => setEditForm({ ...editForm, viewsYoutube: e.target.value })}
                    />
                  </td>
                  <td data-label="Facebook">
                    <input
                      type="number"
                      value={editForm.viewsFacebook}
                      onChange={(e) => setEditForm({ ...editForm, viewsFacebook: e.target.value })}
                    />
                  </td>
                  <td data-label="Cortes">
                    <input type="number" value={editForm.cortes} onChange={(e) => setEditForm({ ...editForm, cortes: e.target.value })} />
                  </td>
                  <td data-label="Links">
                    <input value={editForm.links} onChange={(e) => setEditForm({ ...editForm, links: e.target.value })} />
                  </td>
                  <td data-label="Ações">
                    <div className="admin-row-actions">
                      <button className="btn btn-secundario btn-small" type="button" onClick={() => guardar(r.id)}>
                        Guardar
                      </button>
                      <button className="btn btn-secundario btn-small" type="button" onClick={cancelar}>
                        Cancelar
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={r.id}>
                  <td data-label="ID">{r.id}</td>
                  <td className="nome" data-label="Participante">
                    {participante ? `${participante.nome} (${r.participanteId})` : r.participanteId}
                  </td>
                  <td data-label="Data">{r.data}</td>
                  <td data-label="TikTok">{r.viewsTiktok.toLocaleString("pt-PT")}</td>
                  <td data-label="YouTube">{r.viewsYoutube.toLocaleString("pt-PT")}</td>
                  <td data-label="Facebook">{r.viewsFacebook.toLocaleString("pt-PT")}</td>
                  <td data-label="Cortes">{r.cortes}</td>
                  <td data-label="Links">{r.links || "—"}</td>
                  <td data-label="Ações">
                    <div className="admin-row-actions">
                      <button className="btn btn-secundario btn-small" type="button" onClick={() => iniciarEdicao(r.id)}>
                        Editar
                      </button>
                      <button className="btn btn-danger btn-small" type="button" onClick={() => remover(r.id)}>
                        Remover
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
