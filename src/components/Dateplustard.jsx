import React from "react";

/**
 * Dateplustard — Dates au plus tard (Backward Pass)
 *
 * Structure MiniTable exacte du document :
 *   ┌──────────────┬─────────────────┐
 *   │ topLeft      │ topRight        │
 *   │ (DPT début)  │ (nom tâche)     │
 *   ├──────────────┼─────────────────┤
 *   │ DPT_debut(S1)│ S1  durée(X)    │  ← une ligne par successeur
 *   │ DPT_debut(S2)│ S2  durée(X)    │
 *   │ DPT_debut(S3)│ S3  durée(X)    │
 *   └──────────────┴─────────────────┘
 *
 * topLeft  = min(DPT_debut de chaque successeur) - durée(X)
 * bottomLeft par ligne = DPT_debut(successeur_i)
 * bottomRight par ligne = nom(successeur_i)  +  durée(X)
 *
 * Vérification : bottomLeft_ligne_i - durée(X) = topLeft  [si successeur unique ou min]
 */

function Dateplustard({ tasks, durees, successeurs, finProjet }) {
  if (!tasks || !durees || !successeurs) {
    return (
      <div className="p-4 text-red-500">
        Erreur : Données manquantes pour Dateplustard
      </div>
    );
  }

  // successeurs[i] = chaîne collée "b", "egh", "F"
  const parseSuccesseurs = (succStr) => {
    if (!succStr || succStr === "-" || succStr === "") return [];
    return succStr.split("");
  };

  // ─── Backward Pass ──────────────────────────────────────────────────────────
  const calculDatesPlusTard = () => {
    const debutTard = {};

    // Nœud fictif F : date de début = finProjet
    debutTard["F"] = finProjet;

    let changed = true;
    let iterations = 0;
    while (changed && iterations < 1000) {
      changed = false;
      iterations++;

      for (let i = tasks.length - 1; i >= 0; i--) {
        const task = tasks[i];
        if (debutTard[task] !== undefined) continue;

        const succs = parseSuccesseurs(successeurs[i]);
        if (succs.length === 0) continue;
        if (!succs.every(s => debutTard[s] !== undefined)) continue;

        // DPT début = min(DPT début des successeurs) - durée propre
        const minSuccDebut = Math.min(...succs.map(s => debutTard[s]));
        debutTard[task] = minSuccDebut - durees[i];
        changed = true;
      }
    }

    return debutTard;
  };

  const debutTard = calculDatesPlusTard();

  // ─── Ordre d'affichage : DPT début croissant ────────────────────────────────
  const ordered = [...tasks].sort(
    (a, b) => (debutTard[a] ?? 0) - (debutTard[b] ?? 0)
  );

  // ─── MiniTable multi-lignes ──────────────────────────────────────────────────
  // Chaque successeur = une ligne dans bottomLeft ET bottomRight
  const buildRows = (taskName) => {
    const idx   = tasks.indexOf(taskName);
    const duree = durees[idx];
    const succs = parseSuccesseurs(successeurs[idx]);

    // Tâche finale → successeur fictif F
    const succList = succs.length > 0 ? succs : ["F"];

    return succList.map(s => ({
      bottomLeft:  debutTard[s] !== undefined ? debutTard[s] : finProjet,
      succLabel:   s,
      dureeLabel:  duree,
    }));
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 text-blue-700">
        Dates au plus tard
      </h2>
      <div className="flex flex-wrap gap-4 items-start">

        {/* ── Nœud fictif D ── */}
        <MultiRowTable
          topLeft={0}
          topRight="D"
          rows={[{ bottomLeft: 0, succLabel: ordered[0] ?? "a", dureeLabel: 0 }]}
        />

        {/* ── Tâches ── */}
        {ordered.map((task) => {
          const debut = debutTard[task];
          const rows  = buildRows(task);

          return (
            <MultiRowTable
              key={task}
              topLeft={debut !== undefined ? Math.round(debut) : "?"}
              topRight={task}
              rows={rows}
            />
          );
        })}

      </div>
    </div>
  );
}

// ─── MultiRowTable ────────────────────────────────────────────────────────────
// topLeft  = valeur rouge unique en haut à gauche (sur toute la hauteur)
// topRight = nom de la tâche
// rows     = tableau de { bottomLeft, succLabel, dureeLabel }
//            chaque entrée = une ligne dans la partie basse
function MultiRowTable({ topLeft, topRight, rows }) {
  return (
    <table className="border-collapse border border-black min-w-24">
      <tbody>
        {/* Ligne du haut : topLeft | topRight */}
        <tr>
          <td className="border border-black px-2 py-1 text-red-600 font-bold text-center w-12 text-sm">
            {topLeft}
          </td>
          <td className="border border-black px-4 py-1 text-center font-bold min-w-12">
            {topRight}
          </td>
        </tr>
        {/* Lignes du bas : une par successeur */}
        {rows.map((row, i) => (
          <tr key={i}>
            <td className="border border-black px-2 py-1 text-red-600 font-bold text-center text-sm">
              {row.bottomLeft}
            </td>
            <td className="border border-black px-2 py-1 text-[10px] leading-tight min-w-16">
              <div className="flex justify-between gap-2">
                <span className="font-semibold">{row.succLabel}</span>
                <span>{row.dureeLabel}</span>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default Dateplustard;