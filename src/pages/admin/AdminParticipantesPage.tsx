import { useState } from "react";
import { useData } from "../../context/DataContext";
import type { Participante } from "../../data";

interface EditState {
  nome: string;
  idade: string;
  tiktok: string;
  youtube: string;
  facebook: string;
  status: Participante["status"];
  senha: string;
  vitorias: string;
  melhorPosicao: string;
}

export default function AdminParticipantesPage() {
  const { participantes, historico, updateParticipante, deleteParticipante, updateHistorico } = useData();
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<EditState | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const iniciarEdicao = (p: Participante) => {
    const h = historico[p.id];
    setEditId(p.id);
    setErro(null);
    setForm({
      nome: p.nome,
      idade: String(p.idade),
      tiktok: p.tiktok,
      youtube: p.youtube,
      facebook: p.facebook,
      status: p.status,
      senha: "",
      vitorias: String(h?.vitorias ?? 0),
      melhorPosicao: h?.melhorPosicao != null ? String(h.melhorPosicao) : "",
    });
  };

  const cancelar = () => {
    setEditId(null);
    setForm(null);
  };

  const guardar = async (id: string) => {
    if (!form) return;
    setSalvando(true);
    setErro(null);
    try {
      await updateParticipante(id, {
        nome: form.nome,
        idade: Number(form.idade),
        tiktok: form.tiktok,
        youtube: form.youtube,
        facebook: form.facebook,
        status: form.status,
        ...(form.senha ? { senha: form.senha } : {}),
      });
      await updateHistorico(id, {
        vitorias: Number(form.vitorias) || 0,
        melhorPosicao: form.melhorPosicao.trim() === "" ? null : Number(form.melhorPosicao),
      });
      cancelar();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível guardar as alterações.");
    } finally {
      setSalvando(false);
    }
  };

  const remover = async (id: string) => {
    if (!window.confirm(`Remover o participante ${id}? Esta ação também remove os seus registos.`)) return;
    setErro(null);
    try {
      await deleteParticipante(id);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível remover o participante.");
    }
  };

  return (
    <div className="admin-section">
      <div className="admin-section-head">
        <h2>Participantes</h2>
        <span className="hint">{participantes.length} no total</span>
      </div>
      {erro && <p className="erro">{erro}</p>}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Idade</th>
              <th>TikTok</th>
              <th>YouTube</th>
              <th>Facebook</th>
              <th>Status</th>
              <th>Vitórias</th>
              <th>Melhor pos.</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {participantes.map((p) => {
              const editando = editId === p.id;
              const h = historico[p.id];
              return editando && form ? (
                <tr key={p.id} className="admin-row-editing">
                  <td data-label="ID">{p.id}</td>
                  <td data-label="Nome">
                    <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
                  </td>
                  <td data-label="Idade">
                    <input type="number" value={form.idade} onChange={(e) => setForm({ ...form, idade: e.target.value })} />
                  </td>
                  <td data-label="TikTok">
                    <input value={form.tiktok} onChange={(e) => setForm({ ...form, tiktok: e.target.value })} />
                  </td>
                  <td data-label="YouTube">
                    <input value={form.youtube} onChange={(e) => setForm({ ...form, youtube: e.target.value })} />
                  </td>
                  <td data-label="Facebook">
                    <input value={form.facebook} onChange={(e) => setForm({ ...form, facebook: e.target.value })} />
                  </td>
                  <td data-label="Status">
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value as Participante["status"] })}
                    >
                      <option value="Ativo">Ativo</option>
                      <option value="Inativo">Inativo</option>
                    </select>
                  </td>
                  <td data-label="Vitórias">
                    <input type="number" value={form.vitorias} onChange={(e) => setForm({ ...form, vitorias: e.target.value })} />
                  </td>
                  <td data-label="Melhor pos.">
                    <input
                      type="number"
                      value={form.melhorPosicao}
                      onChange={(e) => setForm({ ...form, melhorPosicao: e.target.value })}
                    />
                  </td>
                  <td data-label="Ações">
                    <div className="admin-row-actions">
                      <input
                        className="admin-senha-input"
                        type="password"
                        placeholder="Nova senha (opcional)"
                        value={form.senha}
                        onChange={(e) => setForm({ ...form, senha: e.target.value })}
                      />
                      <button className="btn btn-secundario btn-small" type="button" onClick={() => guardar(p.id)} disabled={salvando}>
                        Guardar
                      </button>
                      <button className="btn btn-secundario btn-small" type="button" onClick={cancelar}>
                        Cancelar
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={p.id}>
                  <td data-label="ID">{p.id}</td>
                  <td className="nome" data-label="Nome">
                    {p.nome}
                  </td>
                  <td data-label="Idade">{p.idade}</td>
                  <td data-label="TikTok">{p.tiktok}</td>
                  <td data-label="YouTube">{p.youtube}</td>
                  <td data-label="Facebook">{p.facebook}</td>
                  <td data-label="Status">
                    <span className={`badge${p.status === "Inativo" ? " badge-fechado" : ""}`}>{p.status}</span>
                  </td>
                  <td data-label="Vitórias">{h?.vitorias ?? 0}</td>
                  <td data-label="Melhor pos.">{h?.melhorPosicao != null ? `${h.melhorPosicao}º` : "—"}</td>
                  <td data-label="Ações">
                    <div className="admin-row-actions">
                      <button className="btn btn-secundario btn-small" type="button" onClick={() => iniciarEdicao(p)}>
                        Editar
                      </button>
                      <button className="btn btn-danger btn-small" type="button" onClick={() => remover(p.id)}>
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
