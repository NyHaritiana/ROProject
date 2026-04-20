import React from "react";

function Dateplustard({ tasks, durees, successeurs, finProjet }) {
  
  if (!tasks || !durees || !successeurs) {
    return <div className="p-4 text-red-500">Erreur : Données manquantes pour Dateplustard</div>;
  }

  const parseSuccesseurs = (succStr) => {
    if (!succStr || succStr === "-" || succStr === "" || succStr === "F") {
      return [];
    }
    return succStr.split("");
  };

  /**
   * DATES AU PLUS TARD (Backward Pass)
   * 
   * Principe : 
   * - On part de F avec valeur = finProjet
   * - Pour chaque tâche : 
   *   - Date de début au plus tard = min( Date de début au plus tard des successeurs ) - durée
   *   - Date de fin au plus tard = Date de début au plus tard + durée
   * 
   * Dans l'affichage :
   * - Haut-gauche = Date de début au plus tard
   * - Bas-gauche = Date de fin au plus tard
   */
  const calculDatesPlusTard = () => {
    const debutTard = {}; // Date de début (Haut-gauche)
    const finTard = {};   // Date de fin (Bas-gauche)
    
    // Étape 1 : Initialiser les tâches sans successeur
    tasks.forEach((task, i) => {
      const succs = parseSuccesseurs(successeurs[i]);
      if (succs.length === 0) {
        // Tâche sans successeur : sa fin = finProjet
        finTard[task] = finProjet;
        debutTard[task] = finProjet - durees[i];
      }
    });
    
    // Étape 2 : Propager vers l'arrière
    let changed = true;
    while (changed) {
      changed = false;
      
      for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        if (debutTard[task] !== undefined) continue;
        
        const succs = parseSuccesseurs(successeurs[i]);
        if (succs.length === 0) continue;
        
        // Vérifier si tous les successeurs sont calculés
        let allSuccCalculated = true;
        let minDebutTard = Infinity;
        
        for (const succ of succs) {
          if (debutTard[succ] === undefined) {
            allSuccCalculated = false;
            break;
          }
          // On prend le minimum des dates de début des successeurs
          minDebutTard = Math.min(minDebutTard, debutTard[succ]);
        }
        
        if (allSuccCalculated && minDebutTard !== Infinity) {
          // Date de début = min(date de début des successeurs) - durée
          debutTard[task] = minDebutTard - durees[i];
          // Date de fin = date de début + durée
          finTard[task] = debutTard[task] + durees[i];
          changed = true;
        }
      }
    }
    
    return { debutTard, finTard };
  };

  const { debutTard, finTard } = calculDatesPlusTard();
  
  // Ordre d'affichage selon les dates de début
  const tasksWithDates = tasks.map(t => ({ 
    task: t, 
    debutTard: debutTard[t] !== undefined ? debutTard[t] : 0,
    finTard: finTard[t] !== undefined ? finTard[t] : 0
  }));
  tasksWithDates.sort((a, b) => a.debutTard - b.debutTard);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Dates au plus tard</h2>
      <div className="flex flex-wrap gap-4 bg-white items-start">
        
        {/* PREMIÈRE CASE : D */}
        <MiniTable
          topLeft={0}
          topRight="D"
          bottomLeft={0}
          bottomRight={
            <div className="flex justify-between gap-2 text-[9px]">
              <span>a</span>
              <span>7</span>
            </div>
          }
        />
        
        {/* Affichage des tâches */}
        {tasksWithDates.map(({ task: t }) => {
          const idx = tasks.indexOf(t);
          const succs = parseSuccesseurs(successeurs[idx]);
          
          let displayContent;
          if (succs.length === 0) {
            displayContent = (
              <div className="flex justify-between gap-2 text-[9px]">
                <span>F</span>
                <span>{durees[idx]}</span>
              </div>
            );
          } else {
            displayContent = succs.map((succ, i) => {
              const succIdx = tasks.indexOf(succ);
              const dureeSucc = succIdx >= 0 ? durees[succIdx] : 0;
              return (
                <div key={i} className="flex justify-between gap-2 text-[9px]">
                  <span>{succ}</span>
                  <span>{dureeSucc}</span>
                </div>
              );
            });
          }
          
          return (
            <MiniTable
              key={t}
              topLeft={Math.round(debutTard[t])}   // Haut-gauche = Date de début
              topRight={t}
              bottomLeft={Math.round(finTard[t])}   // Bas-gauche = Date de fin
              bottomRight={displayContent}
            />
          );
        })}
      </div>
    </div>
  );
}

function MiniTable({ topLeft, topRight, bottomLeft, bottomRight }) {
  return (
    <table className="border-collapse border border-black min-w-24">
      <tbody>
        <tr>
          <td className="border border-black px-2 py-1 text-red-600 font-bold text-center w-12">
            {topLeft !== undefined && !isNaN(topLeft) ? topLeft : "?"}
          </td>
          <td className="border border-black px-4 py-1 text-center font-medium min-w-12">
            {topRight}
          </td>
        </tr>
        <tr>
          <td className="border border-black px-2 py-1 text-red-600 font-bold text-center">
            {bottomLeft !== undefined && !isNaN(bottomLeft) ? bottomLeft : "?"}
          </td>
          <td className="border border-black px-2 py-1 text-left text-[10px] leading-tight min-w-16">
            {bottomRight}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export default Dateplustard;