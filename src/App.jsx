import './App.css'
import Chemincritique from './components/Chemincritique'
import Dateplustard from './components/Dateplustard'
import Dateplustot from './components/Dateplustot'
import Navbar from './components/Navbar'
import Ordonnancement from './components/Ordonnancement'
import { useState } from 'react'

function App() {

  const tasks = [
    "a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v"
  ];

  const durees = [
    7,7,15,30,45,15,45,60,20,30,30,15,30,15,30,15,15,15,30,7,4,2
  ];

  const antecedents = [
    "-", "a", "b", "c", "d", "e", "d", "d", "h", "i", "f", "k",
    "g j l", "m", "n", "m", "o", "q", "q", "p", "r t", "s t"
  ];

  // Fonction pour parser les antécédents
  const parseAntecedents = (antStr) => {
    if (antStr === "-" || antStr === "" || antStr === "D") {
      return [];
    }
    return antStr.split(/\s+/);
  };

  // Calcul des successeurs
  const calculSuccesseurs = () => {
    const successeurs = {};
    tasks.forEach(task => { successeurs[task] = []; });
    
    tasks.forEach((task, i) => {
      const ants = parseAntecedents(antecedents[i]);
      ants.forEach(ant => {
        if (successeurs[ant]) {
          successeurs[ant].push(task);
        }
      });
    });
    
    return tasks.map(t => successeurs[t].join("") || "-");
  };
  
  const successeurs = calculSuccesseurs();

  // Calcul de la fin du projet (date au plus tôt)
  const [finProjet, setFinProjet] = useState(0);

  // Fonction pour récupérer la fin du projet depuis Dateplustot
  const handleFinProjet = (fin) => {
    setFinProjet(fin);
  };

  return (
    <>
      <Navbar />
      <Ordonnancement 
        tasks={tasks} 
        durees={durees} 
        antecedents={antecedents} 
      />
      <Dateplustot 
        tasks={tasks} 
        durees={durees} 
        antecedents={antecedents}
        onFinProjet={handleFinProjet}
      />
      <Dateplustard 
        tasks={tasks} 
        durees={durees} 
        successeurs={successeurs}
        finProjet={finProjet}
      />
      <Chemincritique 
        tasks={tasks} 
        durees={durees} 
        antecedents={antecedents}
        finProjet={finProjet}
      />
    </>
  )
}

export default App