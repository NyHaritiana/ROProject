import React, { useEffect } from "react";

function Dateplustot({ tasks, durees, antecedents, onFinProjet }) {
  const parseAntecedents = (antStr) => {
    if (antStr === "-" || antStr === "" || antStr === "D") {
      return [];
    }
    const cleaned = antStr.replace(/[, ]/g, "");
    return cleaned.split("");
  };

  const calculDates = () => {
    const hautGauche = {};
    const finReelle = {};

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
        ants.forEach((ant) => {
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
        finReelle[current] = maxVal + durees[idx];
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

    return { hautGauche, finReelle };
  };

  const { hautGauche, finReelle } = calculDates();

  // CORRECTION: Détecter les tâches finales par structure (sans successeurs)
  const allAntecedents = new Set();
  tasks.forEach((task, i) => {
    parseAntecedents(antecedents[i]).forEach((a) => allAntecedents.add(a));
  });
  const lastTasks = tasks.filter((t) => !allAntecedents.has(t));

  // finProjet = max des fins des tâches finales
  const finProjet = Math.max(...lastTasks.map((t) => finReelle[t] || 0));

  useEffect(() => {
    if (onFinProjet) {
      onFinProjet(finProjet);
    }
  }, [finProjet, onFinProjet]);

  // Ordre d'affichage
  const tasksWithDates = tasks.map((t) => ({ task: t, debut: hautGauche[t] || 0 }));
  tasksWithDates.sort((a, b) => a.debut - b.debut);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Dates au plus tôt</h2>
      <div className="flex flex-wrap gap-4 bg-white items-start">
        {tasksWithDates.map(({ task: t }) => {
          const idx = tasks.indexOf(t);
          const ants = parseAntecedents(antecedents[idx]);

          let displayContent;
          let displayBottomLeft;

          if (ants.length === 0) {
            displayBottomLeft = (
              <div className="text-[9px] text-center">0</div>
            );
            displayContent = (
              <div className="flex justify-between gap-2 text-[9px]">
                <span>D</span>
                <span>0</span>
              </div>
            );
          } else {
            displayBottomLeft = ants.map((ant, i) => (
              <div key={i} className="text-[9px] text-center">
                {hautGauche[ant] || 0}
              </div>
            ));
            displayContent = ants.map((ant, i) => {
              const antIdx = tasks.indexOf(ant);
              const dureeAnt = antIdx >= 0 ? durees[antIdx] : 0;
              return (
                <div key={i} className="flex justify-between gap-2 text-[9px]">
                  <span>{ant}</span>
                  <span>{dureeAnt}</span>
                </div>
              );
            });
          }

          return (
            <MiniTable
              key={t}
              topLeft={hautGauche[t]}
              topRight={t}
              bottomLeft={displayBottomLeft}
              bottomRight={displayContent}
            />
          );
        })}

        {/* Case F : toutes les tâches sans successeurs */}
        {lastTasks.length > 0 && (
          <MiniTable
            topLeft={finProjet}
            topRight="F"
            bottomLeft={
              <div className="text-xs">
                {lastTasks.map((t, i) => (
                  <div key={i} className="flex justify-center text-[9px]">
                    {hautGauche[t] || 0}
                  </div>
                ))}
              </div>
            }
            bottomRight={
              <div className="text-xs">
                {lastTasks.map((t, i) => {
                  const idx = tasks.indexOf(t);
                  return (
                    <div key={i} className="flex justify-between gap-2 text-[9px]">
                      <span>{t}</span>
                      <span>{durees[idx]}</span>
                    </div>
                  );
                })}
              </div>
            }
          />
        )}
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
            {topLeft !== undefined ? topLeft : "?"}
          </td>
          <td className="border border-black px-4 py-1 text-center font-medium min-w-12">
            {topRight}
          </td>
        </tr>
        <tr>
          <td className="border border-black px-2 py-1 text-red-600 font-bold text-center align-top">
            {bottomLeft !== undefined ? bottomLeft : "?"}
          </td>
          <td className="border border-black px-2 py-1 text-left text-[10px] leading-tight min-w-16">
            {bottomRight}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export default Dateplustot;