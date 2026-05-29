import './App.css'
import Chemincritique from './components/Chemincritique'
import Dateplustard from './components/Dateplustard'
import Dateplustot from './components/Dateplustot'
import Navbar from './components/Navbar'
import Ordonnancement from './components/Ordonnancement'
import { useState, useMemo } from 'react'

// =========================
// PARSER ANTÉCÉDENTS
// Hors du composant → stable, aucune dépendance useMemo nécessaire
// "a b" → ["a", "b"] / "-" ou "D" → []
// =========================
function parseAntecedents(antStr) {
  if (!antStr || antStr === "-" || antStr === "D") return [];
  return antStr.trim().split(/\s+/);
}

function App() {

  // =========================
  // DONNÉES SAISIES PAR USER
  // =========================
  const [data, setData] = useState([]);

  // =========================
  // FORMULAIRE
  // =========================
  const [task, setTask]           = useState("");
  const [duree, setDuree]         = useState("");
  const [antecedent, setAntecedent] = useState("");

  // =========================
  // AJOUTER UNE TÂCHE
  // =========================
  const handleAddTask = () => {
    if (!task || !duree) {
      alert("Remplissez les champs");
      return;
    }
    setData([...data, {
      task,
      duree: Number(duree),
      antecedent: antecedent.trim() || "-"
    }]);
    setTask("");
    setDuree("");
    setAntecedent("");
  };

  // =========================
  // EXTRACTION DES TABLEAUX
  // Dérivation simple — pas de useMemo (calcul léger)
  // =========================
  const tasks       = data.map(item => item.task);
  const durees      = data.map(item => item.duree);
  const antecedents = data.map(item => item.antecedent);

  // =========================
  // SUCCESSEURS
  // Travaille directement sur `data` → dépendance [data] propre
  // Résultat : tableau de strings collées ex: "egh", ou "F" si tâche finale
  // =========================
  const successeurs = useMemo(() => {
    const succMap = {};
    data.forEach(item => { succMap[item.task] = []; });

    data.forEach(item => {
      parseAntecedents(item.antecedent).forEach(ant => {
        if (succMap[ant] !== undefined) {
          succMap[ant].push(item.task);
        }
      });
    });

    return data.map(item =>
      succMap[item.task].length > 0 ? succMap[item.task].join("") : "F"
    );
  }, [data]);

  // =========================
  // FIN PROJET (forward pass)
  // Travaille directement sur `data` → dépendance [data] propre
  // =========================
  const finProjet = useMemo(() => {
    if (data.length === 0) return 0;

    const finTot = {};

    // Tâches sans antécédent : commencent à 0
    data.forEach(item => {
      if (parseAntecedents(item.antecedent).length === 0) {
        finTot[item.task] = item.duree;
      }
    });

    let changed = true;
    let iter = 0;
    while (changed && iter < 1000) {
      changed = false;
      iter++;
      data.forEach(item => {
        if (finTot[item.task] !== undefined) return;
        const ants = parseAntecedents(item.antecedent);
        if (ants.length === 0) return;
        if (!ants.every(a => finTot[a] !== undefined)) return;
        finTot[item.task] = Math.max(...ants.map(a => finTot[a])) + item.duree;
        changed = true;
      });
    }

    return Math.max(0, ...Object.values(finTot));
  }, [data]);

  // =========================
  // NAVIGATION
  // =========================
  const [activeTab, setActiveTab] = useState(0);

  return (
    <>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* ================= FORMULAIRE ================= */}
      <div className="p-4 flex flex-col gap-3">
        <input
          type="text"
          placeholder="Tâche"
          value={task}
          onChange={e => setTask(e.target.value)}
          className="border p-2"
        />
        <input
          type="number"
          placeholder="Durée"
          value={duree}
          onChange={e => setDuree(e.target.value)}
          className="border p-2"
        />
        <input
          type="text"
          placeholder="Antécédents ex: a b"
          value={antecedent}
          onChange={e => setAntecedent(e.target.value)}
          className="border p-2"
        />
        <button onClick={handleAddTask} className="bg-blue-500 text-white p-2">
          Ajouter
        </button>
      </div>

      {/* ================= TABLEAU ================= */}
      <Ordonnancement
        tasks={tasks}
        durees={durees}
        antecedents={antecedents}
      />

      {activeTab === 1 && (
        <Dateplustot
          tasks={tasks}
          durees={durees}
          antecedents={antecedents}
          onFinProjet={() => {}}
        />
      )}

      {activeTab === 2 && (
        <Dateplustard
          tasks={tasks}
          durees={durees}
          successeurs={successeurs}
          finProjet={finProjet}
        />
      )}

      {activeTab === 3 && (
        <Chemincritique
          tasks={tasks}
          durees={durees}
          antecedents={antecedents}
          finProjet={finProjet}
        />
      )}
    </>
  );
}

export default App;