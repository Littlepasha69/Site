document.getElementById("dierQuiz").addEventListener("submit", function (e) {
  e.preventDefault();

  const antwoorden = ["vraag1", "vraag2", "vraag3", "vraag4", "vraag5"];
  const scores = {
    windvos: 0,
    stormpanter: 0,
    raaf: 0,
    maanhert: 0,
    zwaluw: 0,
  };

  antwoorden.forEach((vraag) => {
    const gekozen = document.querySelector(`input[name="${vraag}"]:checked`);
    if (gekozen) {
      scores[gekozen.value]++;
    }
  });

  const ingevuld = antwoorden.every((vraag) =>
    document.querySelector(`input[name="${vraag}"]:checked`)
  );

  if (!ingevuld) {
    alert("Beantwoord eerst alle vijf vragen.");
    return;
  }

  // Meest gekozen dier zoeken
  const dier = Object.entries(scores).reduce((a, b) => (b[1] > a[1] ? b : a))[0];

  const dierNamen = {
    windvos: "Windvos",
    stormpanter: "Stormpanter",
    raaf: "Groene Raaf",
    maanhert: "Maanhert",
    zwaluw: "Zwaluwmens",
  };

  const dierGeslacht = {
    windvos: "Windvos",
    stormpanter: "Stormpanter",
    raaf: "Raaf",
    maanhert: "Hert",
    zwaluw: "Zwaluw",
  };

  document.getElementById("dierNaam").textContent = dierNamen[dier];
  document.getElementById("dierGeslacht").textContent = dierGeslacht[dier];
  document.getElementById("resultaat").style.display = "block";
  document.getElementById("resultaat").scrollIntoView({ behavior: "smooth", block: "center" });
});
