/* GBD w nauczaniu — quiz „Sprawdź swoją wiedzę o GBD" */
(function () {
  "use strict";

  const QUESTIONS = [
    {
      q: "Co mierzy DALY?",
      opts: [
        "Liczbę zgonów na 100 tys. ludności",
        "Lata życia utracone z powodu przedwczesnej śmierci i niepełnosprawności",
        "Koszty leczenia choroby w systemie ochrony zdrowia",
        "Liczbę nowych zachorowań w danym roku"
      ],
      correct: 1,
      why: "DALY (Disability-Adjusted Life Years) to lata życia utracone z powodu przedwczesnej śmierci i niepełnosprawności. Jedna jednostka DALY odpowiada jednemu utraconemu rokowi życia w pełnym zdrowiu.",
      link: "metodologia.html#slownik", linkLabel: "Słownik pojęć"
    },
    {
      q: "Z jakich składników składa się DALY?",
      opts: ["DALY = YLL + YLD", "DALY = YLL × YLD", "DALY = zgony + zachorowania", "DALY = YLD − YLL"],
      correct: 0,
      why: "DALY = YLL (lata utracone z powodu przedwczesnych zgonów) + YLD (lata przeżyte z niepełnosprawnością, ważone wagą niepełnosprawności).",
      link: "metodologia.html", linkLabel: "Metodologia GBD"
    },
    {
      q: "Dlaczego nie można bezpośrednio porównywać surowych wskaźników umieralności między krajami?",
      opts: [
        "Bo kraje stosują różne waluty",
        "Bo surowe wskaźniki zależą od struktury wiekowej populacji — starsza populacja ma więcej zgonów niezależnie od jakości systemu zdrowia",
        "Bo GBD nie publikuje surowych wskaźników",
        "Bo surowe wskaźniki nie obejmują zgonów z powodu urazów"
      ],
      correct: 1,
      why: "Różnice w strukturze wieku zniekształcają porównania. Dlatego GBD stosuje standaryzację do wieku — wskaźniki z każdej grupy wiekowej są ważone tą samą standardową populacją.",
      link: "metodologia.html", linkLabel: "Jak działa standaryzacja do wieku"
    },
    {
      q: "Czym są garbage codes?",
      opts: [
        "Błędnie wprowadzone rekordy, które GBD usuwa z danych",
        "Kody przyczyn zgonu nieużyteczne analitycznie — np. „niewydolność serca” czy „zatrzymanie krążenia” — które GBD redystrybuuje do właściwych przyczyn",
        "Kody chorób zakaźnych o niskiej częstości",
        "Zgony bez wypełnionej karty zgonu"
      ],
      correct: 1,
      why: "Garbage codes to objawy lub mechanizmy końcowe wpisane jako przyczyna zgonu. GBD ich nie usuwa — redystrybuuje je do właściwych przyczyn, więc łączna liczba zgonów się nie zmienia.",
      link: "#garbage-codes", linkLabel: "Redystrybucja garbage codes"
    },
    {
      q: "Co oznacza 95-procentowy przedział niepewności (95% UI) w szacunkach GBD?",
      opts: [
        "Klasyczny błąd statystyczny próby",
        "Zakres, w którym mieści się 95% populacji",
        "Niepewność wynikającą z jakości i dostępności danych źródłowych oraz z procesu modelowania",
        "Margines błędu pomiaru w rejestrach zgonów"
      ],
      correct: 2,
      why: "UI nie jest błędem statystycznym w klasycznym sensie — odzwierciedla niepewność danych źródłowych i modelowania. Im szerszy przedział, tym ostrożniej należy interpretować wynik punktowy.",
      link: "metodologia.html#jak-korzystac", linkLabel: "Jak korzystać z danych GBD"
    },
    {
      q: "Którą edycję GBD należy cytować, podając dane np. za rok 2010?",
      opts: [
        "Edycję wydaną najbliżej roku 2010",
        "Najnowszą edycję — każda nowa edycja przelicza retrospektywnie wszystkie lata tą samą metodą",
        "Dowolną — wyniki za dany rok się nie zmieniają",
        "Edycję GBD 1990, bo jest edycją bazową"
      ],
      correct: 1,
      why: "Nowa edycja GBD przelicza retrospektywnie WSZYSTKIE lata. GBD 2021 daje inne wyniki za rok 2010 niż GBD 2019 — zawsze cytuj najnowszą edycję i podawaj jej numer.",
      link: "#cytowanie", linkLabel: "Jak cytować dane GBD"
    }
  ];

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  let score = 0, answered = 0;

  function render() {
    score = 0; answered = 0;
    const box = document.getElementById("quiz-box");
    box.innerHTML = QUESTIONS.map((q, i) => `
      <fieldset class="q" data-i="${i}" style="margin-inline:0">
        <legend class="sr-only">Pytanie ${i + 1}</legend>
        <h3><span class="qn">${i + 1}.</span>${esc(q.q)}</h3>
        <div class="q-opts">${q.opts.map((o, j) => `<button type="button" data-j="${j}">${esc(o)}</button>`).join("")}</div>
        <div class="q-fb" role="status"></div>
      </fieldset>`).join("");
    box.querySelectorAll(".q").forEach(fs => {
      fs.querySelectorAll(".q-opts button").forEach(b => b.addEventListener("click", () => answer(fs, +b.dataset.j)));
    });
    document.getElementById("quiz-done").classList.remove("show");
    updateScore();
  }

  function answer(fs, j) {
    const q = QUESTIONS[+fs.dataset.i];
    const ok = j === q.correct;
    const btns = fs.querySelectorAll(".q-opts button");
    btns.forEach((b, k) => {
      b.disabled = true;
      if (k === q.correct) b.classList.add("correct");
      else if (k === j) b.classList.add("wrong");
    });
    const fb = fs.querySelector(".q-fb");
    fb.className = "q-fb show " + (ok ? "ok" : "bad");
    fb.innerHTML = `<strong>${ok ? "Dobrze!" : "Nie tym razem."}</strong> ${esc(q.why)} <a href="${q.link}">${esc(q.linkLabel)} →</a>`;
    answered++; if (ok) score++;
    updateScore();
    if (answered === QUESTIONS.length) {
      const done = document.getElementById("quiz-done");
      const msg = score === QUESTIONS.length ? "Komplet! Znasz podstawy GBD." :
        score >= 4 ? "Bardzo dobrze — kilka szczegółów warto jeszcze powtórzyć." :
        "Warto wrócić do sekcji Metodologia i Słownik pojęć.";
      done.innerHTML = `<h3>Twój wynik: ${score} / ${QUESTIONS.length}</h3><p>${msg} <a href="metodologia.html">Przejdź do metodologii →</a></p>`;
      done.classList.add("show");
    }
  }

  function updateScore() {
    document.getElementById("quiz-score").textContent = `Wynik: ${score} / ${QUESTIONS.length}`;
  }

  document.addEventListener("DOMContentLoaded", () => {
    render();
    document.getElementById("quiz-reset").addEventListener("click", render);
  });
})();
