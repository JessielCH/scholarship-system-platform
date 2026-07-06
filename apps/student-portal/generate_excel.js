const xlsx = require('xlsx');

const faculty = "Artes"; // Todas de la misma facultad

const data = [];
for (let i = 1; i <= 10; i++) {
  let promedio = 6.0;
  let vuln = 30.0;
  
  if (i <= 2) {
    // Excellence (top 20% since there are 10 students, 10% is 1, maybe wait. top 10% of 10 is 1. So 1 student gets excellence!)
    promedio = 9.9;
    vuln = 10.0;
  } else if (i <= 5) {
    // Vulnerability (vuln >= 80)
    promedio = 7.5;
    vuln = 85.0;
  } else {
    // Neither (Sin beca)
    promedio = 6.5;
    vuln = 40.0;
  }

  data.push({
    ID: `UID-${i.toString().padStart(6, '0')}`,
    Email: `student_${i}@uce.edu.ec`,
    Nombres: `Juan ${i}`,
    Apellidos: `Pérez ${i}`,
    Facultad: faculty,
    Semestre: (i % 8) + 3, // Empezar en semestre 3 para que no sean descartados
    Promedio: promedio,
    PuntajeVulnerabilidad: vuln
  });
}

const wb = xlsx.utils.book_new();
const ws = xlsx.utils.json_to_sheet(data);
xlsx.utils.book_append_sheet(wb, ws, "Estudiantes");

xlsx.writeFile(wb, "estudiantes_00001_00010_v2.xlsx");
console.log("Excel file generated: estudiantes_00001_00010_v2.xlsx");
