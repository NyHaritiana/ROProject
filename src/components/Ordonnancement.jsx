import React from "react";

function Ordonnancement({ tasks, durees, antecedents }) {
  
  // Fonction pour parser les antécédents (gère les espaces comme "g j l")
  const parseAntecedents = (antStr) => {
    if (antStr === "-" || antStr === "" || antStr === "D") {
      return [];
    }
    // Sépare par les espaces
    return antStr.split(/\s+/);
  };

  // Calcul des successeurs à partir des antécédents
  const calculSuccesseurs = () => {
    // Initialiser un objet pour stocker les successeurs
    const successeurs = {};
    
    // Initialiser toutes les tâches avec un tableau vide
    tasks.forEach(task => {
      successeurs[task] = [];
    });
    
    // Pour chaque tâche, ajouter la tâche courante comme successeur de ses antécédents
    tasks.forEach((task, i) => {
      const ants = parseAntecedents(antecedents[i]);
      ants.forEach(ant => {
        if (successeurs[ant]) {
          successeurs[ant].push(task);
        }
      });
    });
    
    // Convertir en chaîne de caractères pour l'affichage
    return tasks.map(t => successeurs[t].join("") || "-");
  };
  
  const successeursList = calculSuccesseurs();

  return (
    <div className="p-4 overflow-x-auto">
      <table className="border border-black">
        <thead>
          <tr className="bg-blue-600 text-white">
            <th className="border px-3 py-2">Tâche</th>
            {tasks.map((t, i) => (
              <th key={i} className="border px-3 py-2">{t}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {/* Ligne 1 : Durée */}
          <tr className="bg-gray-100">
            <td className="border px-3 py-2 font-bold">Durée</td>
            {durees.map((d, i) => (
              <td key={i} className="border px-3 py-2 text-center">{d}</td>
            ))}
          </tr>

          {/* Ligne 2 : T.ant. (antécédents) */}
          <tr className="bg-gray-200">
            <td className="border px-3 py-2 font-bold">T.ant.</td>
            {antecedents.map((a, i) => (
              <td key={i} className="border px-3 py-2 text-center">{a}</td>
            ))}
          </tr>

          {/* Ligne 3 : T.succ. (successeurs) - NOUVEAU */}
          <tr className="bg-green-100">
            <td className="border px-3 py-2 font-bold">T.succ.</td>
            {successeursList.map((s, i) => (
              <td key={i} className="border px-3 py-2 text-center">{s}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default Ordonnancement;