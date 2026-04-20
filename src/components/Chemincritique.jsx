import React from "react";

function Chemincritique({ tasks, durees, antecedents, finProjet }) {
  
  // Fonction pour parser les antécédents
  const parseAntecedents = (antStr) => {
    if (antStr === "-" || antStr === "" || antStr === "D") {
      return [];
    }
    return antStr.split(/\s+/);
  };

  // Calcul des dates au plus tôt
  const calculDatesPlusTot = () => {
    const hautGauche = {};
    
    const successors = {};
    const remainingDeps = {};
    
    tasks.forEach((task, i) => {
      const ants = parseAntecedents(antecedents[i]);
      
      if (ants.length === 0) {
        remainingDeps[task] = 1;
        if (!successors["_DEBUT_"]) successors["_DEBUT_"] = [];
        successors["_DEBUT_"].push(task);
      } else {
        remainingDeps[task] = ants.length;
        ants.forEach(ant => {
          if (!successors[ant]) successors[ant] = [];
          successors[ant].push(task);
        });
      }
    });
    
    const queue = ["_DEBUT_"];
    const processed = new Set();
    const hautGaucheAnt = { _DEBUT_: 0 };
    
    while (queue.length > 0) {
      const current = queue.shift();
      if (processed.has(current)) continue;
      
      if (current !== "_DEBUT_") {
        const idx = tasks.indexOf(current);
        const ants = parseAntecedents(antecedents[idx]);
        
        let maxVal = 0;
        if (ants.length === 0) {
          maxVal = 0;
        } else {
          for (const ant of ants) {
            const val = (hautGaucheAnt[ant] || 0) + durees[tasks.indexOf(ant)];
            maxVal = Math.max(maxVal, val);
          }
        }
        
        hautGauche[current] = maxVal;
        hautGaucheAnt[current] = maxVal;
      }
      
      processed.add(current);
      
      if (successors[current]) {
        for (const succ of successors[current]) {
          remainingDeps[succ]--;
          if (remainingDeps[succ] === 0 && !processed.has(succ)) {
            queue.push(succ);
          }
        }
      }
    }
    
    return { hautGauche };
  };

  const { hautGauche } = calculDatesPlusTot();
  
  // Calculer le chemin critique en remontant de F vers D
  const trouverCheminCritique = () => {
    const chemin = [];
    let currentValue = finProjet;
    
    // Tant qu'on n'a pas atteint le début
    while (currentValue > 0) {
      let trouve = false;
      
      // Chercher la tâche dont la date de fin = currentValue
      for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        const finTache = hautGauche[task] + durees[i];
        
        if (Math.abs(finTache - currentValue) < 0.1) {
          // Vérifier que cette tâche est dans le chemin
          // Pour la première itération (F), on prend la tâche qui finit à finProjet
          if (chemin.length === 0 || hautGauche[task] === currentValue - durees[i]) {
            chemin.unshift(task);
            currentValue = hautGauche[task];
            trouve = true;
            break;
          }
        }
      }
      
      if (!trouve) break;
    }
    
    // Ajouter D au début et F à la fin
    return ["D", ...chemin, "F"];
  };
  
  const cheminCritique = trouverCheminCritique();
  
  // Durées correspondant au chemin critique
  const dureesChemin = cheminCritique.map((node, index) => {
    if (node === "D" || node === "F") return 0;
    // Pour la dernière flèche (vers F), la durée est celle de la dernière tâche
    if (index === cheminCritique.length - 2) {
      const idx = tasks.indexOf(node);
      return idx >= 0 ? durees[idx] : 0;
    }
    const idx = tasks.indexOf(node);
    return idx >= 0 ? durees[idx] : 0;
  });

  // Afficher le chemin critique pour debug
  console.log("Chemin critique:", cheminCritique);
  console.log("Durées:", dureesChemin);

  return (
    <div className="p-6 overflow-x-auto">
      <h2 className="text-xl font-bold mb-4">Chemin critique</h2>
      <div className="flex items-center flex-wrap">
        {cheminCritique.map((node, index) => (
          <div key={index} className="flex items-center">
            {/* Cercle */}
            <div className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-dashed border-black">
              {node}
            </div>
            {/* Flèche + durée */}
            {index < cheminCritique.length - 1 && (
              <div className="relative flex items-center mx-2">
                {/* Durée au-dessus */}
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm">
                  {dureesChemin[index]}
                </span>
                {/* Ligne */}
                <div className="w-8 h-0.5 bg-red-500"></div>
                {/* Pointe */}
                <div className="w-0 h-0 border-l-[6px] border-l-red-500 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Chemincritique;