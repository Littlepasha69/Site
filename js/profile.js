(function () {
  const data = window.BEAST_QUIZ;
  const empty = document.querySelector('[data-profile-empty]');
  const content = document.querySelector('[data-profile-content]');
  if (!data || !empty || !content) return;

  const profileKey = 'onwijze-profile-v1';
  const trackKey = 'menslab-progress-v3';
  const routeMap = {
    'Brein & zenuwstelsel': ['onderwerpen/hersenen.html', 'Duik het brein in', 'Van zenuwstelsel tot bewust waarnemen.'],
    'Emoties & herstel': ['onderwerpen/emotieregulatie.html', 'Volg een emotie', 'Wat gebeurt er tussen prikkel, betekenis en reactie?'],
    'Leren & veranderen': ['onderwerpen/neuroplasticiteit.html', 'Onderzoek verandering', 'Wat kan bewegen — en wat vraagt tijd en context?'],
    'Relaties & hechting': ['onderwerpen/hechting.html', 'Kijk tussen twee mensen', 'Nabijheid, afstand en wat er samen ontstaat.'],
    'Bewustzijn & metafysica': ['onderwerpen/bewustzijn.html', 'Open het moeilijke raadsel', 'Wetenschap, filosofie en wat nog werkelijk openligt.'],
    'Persoonlijke verhalen': ['denkstukken.html', 'Lees van binnenuit', 'Ervaringen die geen bewijs spelen, maar wel iets zichtbaar maken.'],
    'Zelfonderzoek': ['menslab.html#reflectie', 'Trek een onderzoeksvraag', 'Geen score. Wel een vraag die even mag meelopen.'],
    'Community bouwen': ['jouw-bijdrage.html', 'Draag iets bij', 'Voeg een ervaring, vraag of gevonden spoor toe.']
  };

  function readJson(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || 'null');
      return value ?? fallback;
    } catch (_) { return fallback; }
  }

  const profile = readJson(profileKey, null);
  const beast = data.beasts.find(item => item.id === profile?.beastId);
  if (!profile || profile.version !== 1 || !beast) {
    empty.hidden = false;
    content.hidden = true;
    return;
  }

  empty.hidden = true;
  content.hidden = false;
  const image = document.querySelector('[data-profile-image]');
  image.src = beast.image || `images/beasts/${beast.id}.jpg`;
  image.alt = `Illustratie van ${beast.name}, ${beast.archetype.toLowerCase()}`;
  document.querySelector('[data-profile-world]').textContent = beast.world;
  document.querySelector('[data-profile-name]').textContent = profile.name;
  document.querySelector('[data-profile-beast]').textContent = beast.name;
  document.querySelector('[data-profile-archetype]').textContent = beast.archetype;
  document.querySelector('[data-profile-intro]').textContent = profile.intro || 'Ik ben hier om te onderzoeken wat beweegt, schuurt en nog niet helemaal te begrijpen valt.';
  document.querySelector('[data-profile-updated]').textContent = `Lokaal bijgewerkt op ${new Intl.DateTimeFormat('nl-BE', { day:'numeric', month:'long', year:'numeric' }).format(new Date(profile.updatedAt || profile.createdAt))}`;
  document.querySelector('[data-profile-interests]').replaceChildren(...(profile.interests || []).map(interest => {
    const tag = document.createElement('span');
    tag.textContent = interest;
    return tag;
  }));

  document.querySelector('[data-profile-mirror-title]').textContent = `${beast.name}, ${beast.archetype.toLowerCase()}`;
  document.querySelector('[data-profile-motto]').textContent = `“${beast.motto}”`;
  document.querySelector('[data-profile-strength]').textContent = beast.strength;
  document.querySelector('[data-profile-pitfall]').textContent = beast.pitfall;
  document.querySelector('[data-profile-role]').textContent = beast.role;

  const kindredRoot = document.querySelector('[data-profile-kindred]');
  const kindred = (profile.kindred || []).map(match => ({ ...match, beast:data.beasts.find(item => item.id === match.id) })).filter(match => match.beast);
  if (kindred.length) {
    document.querySelector('[data-profile-kindred-section]').hidden = false;
    kindredRoot.replaceChildren(...kindred.map(match => {
      const article = document.createElement('article');
      const img = document.createElement('img');
      img.src = match.beast.image || `images/beasts/${match.beast.id}.jpg`;
      img.alt = '';
      const copy = document.createElement('div');
      const small = document.createElement('span');
      small.textContent = `${match.affinity}% verwantschap`;
      const title = document.createElement('strong');
      title.textContent = match.beast.name;
      const text = document.createElement('p');
      text.textContent = match.beast.archetype;
      copy.append(small, title, text);
      article.append(img, copy);
      return article;
    }));
  }

  const chosenRoutes = (profile.interests || []).map(interest => ({ interest, route:routeMap[interest] })).filter(item => item.route).slice(0, 3);
  if (!chosenRoutes.length) chosenRoutes.push({ interest:'Vrije ingang', route:['onderwerpen.html', 'Graaf in de Atlas', 'Kies zelf welke vraag vandaag een poort wordt.'] });
  document.querySelector('[data-profile-routes]').replaceChildren(...chosenRoutes.map((item, index) => {
    const link = document.createElement('a');
    link.href = item.route[0];
    const number = document.createElement('span');
    number.textContent = `0${index + 1} · ${item.interest}`;
    const title = document.createElement('strong');
    title.textContent = item.route[1];
    const text = document.createElement('p');
    text.textContent = item.route[2];
    const open = document.createElement('small');
    open.textContent = 'Open deze poort →';
    link.append(number, title, text, open);
    return link;
  }));

  const track = readJson(trackKey, {});
  const footprints = readJson('onwijze-atlas-footprints-v1', []);
  const reading = readJson('onwijze-reading-history-v1', []);
  const lab = Array.isArray(track.labSnapshots) ? track.labSnapshots : [];
  const quizzes = Array.isArray(track.quizSnapshots) ? track.quizSnapshots : [];
  const weeks = Array.isArray(track.completedWeeks) ? track.completedWeeks : [];
  document.querySelector('[data-stat-atlas]').textContent = String(Array.isArray(footprints) ? footprints.length : 0);
  document.querySelector('[data-stat-lab]').textContent = String(lab.length + quizzes.length + weeks.length);
  document.querySelector('[data-stat-reading]').textContent = String(Array.isArray(reading) ? reading.length : 0);

  const activity = [
    ...(Array.isArray(footprints) ? footprints.map(item => ({ title:item.title, meta:item.saved ? 'Atlas · bewaard' : `Atlas · ${item.progress || 0}% gelezen`, href:item.url, time:Number(item.visitedAt) || 0 })) : []),
    ...(Array.isArray(reading) ? reading.map(item => ({ title:item.title, meta:`Verder lezen · ${item.progress || 0}%`, href:item.url, time:Number(item.visitedAt) || 0 })) : []),
    ...lab.map(item => ({ title:item.title, meta:'Menslab · bewaard', href:'menslab.html#mijn-spoor', time:Date.parse(item.savedAt) || 0 })),
    ...quizzes.map(item => ({ title:item.resultTitle, meta:'Quizkast · spiegel', href:'menslab.html#mijn-spoor', time:Date.parse(item.savedAt) || 0 }))
  ].filter(item => item.title).sort((a, b) => b.time - a.time).slice(0, 5);
  if (activity.length) {
    document.querySelector('[data-profile-activity]').hidden = false;
    document.querySelector('[data-profile-activity-list]').replaceChildren(...activity.map(item => {
      const row = document.createElement('li');
      const link = document.createElement('a');
      link.href = item.href;
      const meta = document.createElement('span');
      meta.textContent = item.meta;
      const title = document.createElement('strong');
      title.textContent = item.title;
      link.append(meta, title);
      row.append(link);
      return row;
    }));
  }

  const deleteButton = document.querySelector('[data-delete-profile]');
  const status = document.querySelector('[data-profile-status]');
  let deleteArmed = false;
  let deleteTimer;
  deleteButton.addEventListener('click', () => {
    if (!deleteArmed) {
      deleteArmed = true;
      deleteButton.textContent = 'Klik nog eens om alleen dit profiel te verwijderen';
      status.textContent = 'Je quizantwoorden en Mijn spoor blijven bestaan.';
      clearTimeout(deleteTimer);
      deleteTimer = setTimeout(() => {
        deleteArmed = false;
        deleteButton.textContent = 'Verwijder alleen mijn profiel';
        status.textContent = '';
      }, 5000);
      return;
    }
    try {
      localStorage.removeItem(profileKey);
      location.reload();
    } catch (_) {
      status.textContent = 'Verwijderen is in deze browser niet beschikbaar.';
    }
  });
}());
